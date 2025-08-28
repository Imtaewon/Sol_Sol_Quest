# app/auth/router.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import time, random, string
import httpx


from app.auth.schemas import RegisterRequest, LoginRequest
from app.auth.deps import get_current_user, bearer
from app.auth.utils import hash_password, verify_password, create_access_token, decode_access_token
from app.database import get_db
from app.cache import rds
from app.models import User, School, UserStats, UserRoleEnum, TierNameEnum
from app.ENV import API_KEY as apiKey

router = APIRouter(prefix="/auth", tags=["Authentication"])

def generate_user_id() -> str:
    timestamp = int(time.time())
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return f"{timestamp:08X}{random_part}"

# ---- SSAFY 회원 생성 헬퍼 ----
def create_ssafy_member(user_email: str) -> str:
    """
    SSAFY MEMBER_01 (사용자 계정 생성)
    요청: { "apiKey": "...", "userId": "<email>" }
    성공 시 userKey(추정)를 반환. 실패 시 HTTPException 발생.
    """
    url = "https://finopenapi.ssafy.io/ssafy/api/v1/member/"
    payload = {
        "apiKey": apiKey,
        "userId": user_email,
    }
    # 권장 타임아웃: 연결 3s / 전체 7s
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, json=payload)
    except httpx.RequestError as e:
        # 네트워크/타임아웃 등
        raise HTTPException(status_code=502, detail=f"SSAFY 회원 생성 서버 연결 실패: {str(e)}")

    # 상태 코드 체크
    if resp.status_code >= 500:
        raise HTTPException(status_code=502, detail="SSAFY 회원 생성 서버 오류가 발생했습니다.")
    if resp.status_code >= 400:
        # 4xx인 경우, 응답 메시지 전달
        try:
            j = resp.json()
        except Exception:
            j = {}
        msg = j.get("message") or j.get("detail") or "SSAFY 회원 생성 요청이 거절되었습니다."
        raise HTTPException(status_code=400, detail=msg)

    # 응답 파싱 (명세 예시가 단순해서 방어적으로 처리)
    try:
        data = resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="SSAFY 회원 생성 응답 파싱 실패")

    # 보편적으로 success/data/userKey 형태를 가정, 없으면 최상단 키 탐색
    user_key = (
        (data.get("data") or {}).get("userKey")
        or data.get("userKey")
        or (data.get("result") or {}).get("userKey")
    )
    if not user_key:
        # 응답에 userKey가 없다면 메시지 노출
        msg = data.get("message") or "userKey가 포함되지 않은 응답입니다."
        raise HTTPException(status_code=502, detail=f"SSAFY 회원 생성 실패: {msg}")

    return user_key


@router.post("/register", summary="회원가입")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # 대학 확인
    school = db.query(School).filter(School.code == req.university_code).first()
    if not school:
        raise HTTPException(status_code=400, detail="등록되지 않은 대학입니다.")
    
    # 중복 체크
    if db.query(User).filter((User.login_id == req.login_id) | (User.email == req.email)).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 아이디 또는 이메일입니다.")
    

    # 여기에 사용자 생성 api 호출해서 응답받고
    # user 테이블의 userKey 칼럼에 저장
    user_key = create_ssafy_member(req.email)  # userId는 이메일 형식

    
    # 사용자 생성
    user = User(
        id=generate_user_id(),
        login_id=req.login_id,
        email=req.email,
        user_key=user_key,
        password=hash_password(req.password),
        real_name=req.real_name,
        gender=req.gender,
        birth_year=req.birth_year,
        school_id=school.id,
        department=req.department,
        grade=req.grade,
        role=UserRoleEnum.GUEST,
    )
    db.add(user)
    
    # 초기 통계
    stat = UserStats(user_id=user.id, total_exp=0, current_tier=TierNameEnum.BASIC)
    db.add(stat)
    
    db.commit()
    
    token = create_access_token({"sub": user.id})
    
    return {
        "success": True,
        "data": {
            "access_token": token,
            "user": {
                "user_id": user.id,
                "name": user.real_name,
                "email": user.email,
                "university_name": school.name,
                "current_tier": TierNameEnum.BASIC,
                "total_exp": 0,
                "has_savings": False
            }
        },
        "message": "회원가입이 완료되었습니다."
    }

@router.post("/login", summary="로그인")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # login_id 필드 확인
    login_id = getattr(req, 'login_id', None) or getattr(req, 'email', None)
    if not login_id:
        raise HTTPException(status_code=400, detail="로그인 ID가 필요합니다.")
    
    user = db.query(User).filter(User.login_id == login_id).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")
    
    stat = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    school = db.query(School).filter(School.id == user.school_id).first()
    
    token = create_access_token({"sub": user.id})
    
    return {
        "success": True,
        "data": {
            "access_token": token,
            "user": {
                "user_id": user.id,
                "name": user.real_name,
                "login_id": user.login_id,
                "email": user.email,
                "university_name": school.name if school else None,
                "current_tier": stat.current_tier if stat else TierNameEnum.BRONZE,
                "total_exp": stat.total_exp if stat else 0,
                "has_savings": False
            }
        }
    }

@router.post("/logout", summary="로그아웃")
def logout(creds=Depends(bearer), current_user=Depends(get_current_user)):
    payload = decode_access_token(creds.credentials)
    jti = payload.get("jti")
    if jti:
        rds.sadd("jwt:blacklist", jti)
    return {"success": True, "message": "로그아웃되었습니다."}
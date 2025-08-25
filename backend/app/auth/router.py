# app/auth/router.py
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

from app.auth.schemas import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse
from app.auth.deps import get_current_user, bearer
from app.auth.utils import hash_password, verify_password, create_access_token, decode_access_token
from app.database import get_db
from app.cache import rds

from app.models import (
    User, School, UserStat,
    UserRoleEnum, TierNameEnum
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# --- helpers ---
def get_school_or_400(db: Session, code: str, name_from_client: str | None = None) -> School:

    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="university_code가 필요합니다.")

    school = db.query(School).filter(School.code == code).first()
    if not school:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="등록되지 않은 university_code 입니다.")

    return school


def _ensure_userstat(db: Session, user: User) -> UserStat:
    stat = db.query(UserStat).filter(UserStat.user_id == user.id).first()
    if stat:
        return stat
    stat = UserStat(
        user_id=user.id,
        total_exp=0,
        current_tier=TierNameEnum.BRONZE,
    )
    db.add(stat)
    return stat


# --- routes ---
@router.post("/register", response_model=RegisterResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        # 대학(School) 보장
        school = get_school_or_400(
            db, code=req.university_code, name_from_client=req.university_name
        )

        # User 생성 (ERD 기반 필드명 매핑)
        user = User(
            id=f"user_{req.id}" if getattr(req, "id", None) else None,  # ID 생성 정책에 맞게 조정
            email=req.email,
            real_name=req.name,
            gender=req.gender,
            grade=req.grade,
            department=req.major,
            role=UserRoleEnum.MEMBER,
            password_hash=hash_password(req.password),
            school_id=school.id if school else None,
        )

        db.add(user)
        # stat 보장
        _ensure_userstat(db, user)

        db.commit()
        db.refresh(user)

        # 응답용 안전 조회
        stat = db.query(UserStat).filter(UserStat.user_id == user.id).first()
        school = db.query(School).filter(School.id == user.school_id).first() if user.school_id else None

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일 또는 사용자 ID입니다.")

    return {
        "success": True,
        "data": {
            "user_id": user.id,
            "email": user.email,
            "name": user.real_name,
            "university_code": school.code if school else None,
            "university_name": school.name if school else None,
        },
        "message": "회원가입이 완료되었습니다.",
    }


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    # 통계 정보
    stat = db.query(UserStat).filter(UserStat.user_id == user.id).first()
    current_tier = stat.current_tier if stat else TierNameEnum.BRONZE
    total_exp = stat.total_exp if stat else 0

    # 대학 정보
    school = db.query(School).filter(School.id == user.school_id).first() if user.school_id else None

    token = create_access_token({"sub": str(user.id)})

    return {
        "success": True,
        "data": {
            "access_token": token,
            "user": {
                "user_id": user.id,
                "name": user.real_name,
                "email": user.email,
                "university_code": school.code if school else None,
                "university_name": school.name if school else None,
                "current_tier": current_tier,
                "total_exp": total_exp,
            },
        },
    }


@router.post("/logout")
def logout(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    current_user=Depends(get_current_user),
):
    token = creds.credentials
    payload = decode_access_token(token)
    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        raise HTTPException(status_code=400, detail="토큰에 필요한 클레임이 없습니다.")

    now = int(datetime.now(timezone.utc).timestamp())
    ttl = max(exp - now, 0)

    rds.sadd("jwt:blacklist", jti)
    if ttl > 0:
        rds.expire("jwt:blacklist", ttl)

    return {"success": True, "message": "로그아웃 되었습니다."}

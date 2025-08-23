# app/auth/router.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.auth.schemas import RegisterRequest, RegisterResponse, LoginRequest, LoginResponse
from app.auth.models import User
from app.auth.deps import get_current_user, bearer
from app.auth.utils import hash_password, verify_password, create_access_token, decode_access_token
from app.deps import get_db
from app.cache import rds
from datetime import datetime, timezone




router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegisterResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = User(
            email=req.email, 
            name=req.name, 
            gender=req.gender, 
            grade=req.grade,
            university_code=req.university_code, 
            university_name=req.university_name,
            major=req.major, 
            hashed_pw=hash_password(req.password),
        )
        db.add(user); db.commit(); db.refresh(user)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일 또는 사용자 ID입니다.")

    return {
        "success": True,
        "data": {
            "user_id": user.user_id, "email": user.email, "name": user.name,
            "university_code": user.university_code, "university_name": user.university_name,
        },
        "message": "회원가입이 완료되었습니다."
    }

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    token = create_access_token({"sub": str(user.user_id)})
    return {
        "success": True,
        "data": {
            "access_token": token,
            "user": {
                "user_id": user.user_id, "name": user.name, "email": user.email,
                "university_code": user.university_code, "university_name": user.university_name,
                "current_tier": user.current_tier, "total_exp": user.total_exp,
            }
        }
    }

@router.post("/logout")
def logout(
    creds: HTTPAuthorizationCredentials = Depends(bearer),  # ✅ 토큰 추출
    current_user=Depends(get_current_user)
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
# app/auth/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.utils import decode_access_token
from app.models import User
from app.cache import rds

bearer = HTTPBearer()

def get_current_user(credentials=Depends(bearer), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        jti = payload.get("jti")
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 토큰")
    
    if jti and rds.sismember("jwt:blacklist", jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그아웃된 토큰")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="사용자를 찾을 수 없음")
    return user
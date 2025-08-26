# app/auth/utils.py
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
import uuid, os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    data.update({"exp": expire, "jti": str(uuid.uuid4())})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
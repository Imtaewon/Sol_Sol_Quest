from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends, HTTPException, Header
from typing import Optional
import os
from functools import lru_cache

# 환경 변수에서 데이터베이스 설정 가져오기
@lru_cache()
def get_settings():
    return {
        "database_url": os.getenv(
            "DATABASE_URL", 
            "mysql+pymysql://user:password@localhost:3306/quest_db"
        )
    }

# 데이터베이스 엔진 생성
settings = get_settings()
engine = create_engine(
    settings["database_url"],
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False  # 개발 시 True로 설정하여 SQL 쿼리 로깅 가능
)

# 세션 로컬 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base 클래스 생성
Base = declarative_base()

# 데이터베이스 세션 의존성
def get_db() -> Session:
    """
    데이터베이스 세션을 생성하고 요청 완료 후 정리하는 의존성 함수
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 현재 사용자 의존성 (실제 인증 로직에 맞게 수정 필요)
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> str:
    """
    현재 사용자 ID를 반환하는 의존성 함수
    
    실제 구현에서는 JWT 토큰 검증, 세션 확인 등의 로직이 필요합니다.
    현재는 간단한 예시 구현입니다.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header가 필요합니다.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Bearer 토큰에서 실제 토큰 추출
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Bearer 토큰 형식이 올바르지 않습니다."
            )
        
        token = authorization.split(" ")[1]
        
        # 실제 구현에서는 여기에 JWT 토큰 검증 로직 추가
        # 예시: jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        
        # 임시로 토큰을 user_id로 사용 (실제로는 토큰에서 user_id 추출)
        user_id = token
        
        # 사용자 존재 여부 확인
        user_check_query = text("SELECT id FROM users WHERE id = :user_id LIMIT 1")
        result = db.execute(user_check_query, {"user_id": user_id}).fetchone()
        
        if not result:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없습니다."
            )
        
        return user_id
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"토큰 검증 실패: {str(e)}"
        )


# 간단한 사용자 인증 (개발/테스트용)
def get_current_user_simple(user_id: str = Header(alias="X-User-ID")) -> str:
    """
    개발/테스트용 간단한 사용자 인증
    헤더에 X-User-ID를 직접 전달받아 사용
    """
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="X-User-ID 헤더가 필요합니다."
        )
    return user_id


# 데이터베이스 연결 테스트 함수
def test_database_connection():
    """
    데이터베이스 연결 상태를 테스트하는 함수
    """
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        return True if result else False
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        return False

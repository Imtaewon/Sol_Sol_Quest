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

# 개발/테스트용 간단한 사용자 인증
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

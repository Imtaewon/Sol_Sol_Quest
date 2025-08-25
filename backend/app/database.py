from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import os

# Docker 환경에서 mysql 호스트명 사용
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://quest_user:questpass123@mysql:3306/quest_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
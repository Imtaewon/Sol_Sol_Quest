# app/universities/router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import School  # code, name 컬럼 사용

router = APIRouter(prefix="/universities", tags=["Universities"])

@router.get("", summary="대학 목록 조회")
def list_universities(db: Session = Depends(get_db)):

    # 정렬 기준은 필요에 따라 변경 가능 (이름/코드)
    rows = (
        db.query(School.code, School.name)
          .order_by(School.name.asc())
          .all()
    )

    data = [
        {"university_code": code, "university_name": name}
        for code, name in rows
    ]

    return {"success": True, "data": data}

# app/universities/router.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import School
from app.auth.deps import get_current_user
from .schemas import UniversityItem, UniversityLeaderboardResponse
from .service import build_leaderboards

router = APIRouter(prefix="/universities", tags=["Universities"])


@router.get("", summary="대학 목록 조회")
def list_universities(db: Session = Depends(get_db)):
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

@router.get("/leaderboard", response_model=UniversityLeaderboardResponse, summary="대학 랭킹(총/평균) 및 내 학교 랭킹")
def university_leaderboard(
    limit: int = Query(10, ge=1, le=50, description="각 랭킹 상위 N개"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # 현재 사용자 학교 코드 조회
    user_school_code = None
    if current_user and getattr(current_user, "school", None):
        user_school_code = current_user.school.code
    elif current_user and getattr(current_user, "school_id", None):
        # 관계 미로딩 대비: 필요시 schools 테이블에서 조회
        row = db.query(School.code).filter(School.id == current_user.school_id).first()
        if row:
            user_school_code = row[0]

    def _to_float_avg(items):
        for it in items:
            it.avg_exp = float(it.avg_exp)
        return items

    my_uni, top_overall, top_avg = build_leaderboards(db, user_school_code, current_user.id if current_user else None, limit=limit)
    if my_uni: my_uni.avg_exp = float(my_uni.avg_exp)
    top_overall = _to_float_avg(top_overall)
    top_avg = _to_float_avg(top_avg)
    return UniversityLeaderboardResponse(
        my_university=my_uni,
        top10_overall=top_overall,
        top10_avg=top_avg,
    )
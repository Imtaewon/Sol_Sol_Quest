# app/universities/service.py
from __future__ import annotations
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from decimal import Decimal

from app.models import School, SchoolLeaderboard
from .schemas import UniversityLeaderboardItem

def _rows(db: Session) -> List[Dict[str, Any]]:
    """
    schools ↔ school_leaderboard 조인 결과(모든 학교) 로우들을 표준 dict로 반환
    """
    q = (
        db.query(
            School.code.label("university_code"),
            School.name.label("university_name"),
            SchoolLeaderboard.savings_students,
            SchoolLeaderboard.total_exp,
            SchoolLeaderboard.avg_exp,
        )
        .join(SchoolLeaderboard, SchoolLeaderboard.school_id == School.id)
    )
    rows = []
    for code, name, students, total, avg in q.all():
        rows.append({
            "university_code": code,
            "university_name": name,
            "savings_students": int(students or 0),
            "total_exp": int(total or 0),
            "avg_exp": Decimal(avg or 0),
        })
    return rows

def _dense_rank(sorted_rows: List[Dict[str, Any]], key: str, out_field: str) -> None:
    """
    동점은 같은 등수(밀집 랭크)로 부여: 1,2,2,3 ...
    sorted_rows는 이미 key 기준 DESC 정렬되어 있어야 함.
    """
    last_val = None
    rank = 0
    for r in sorted_rows:
        v = r[key]
        if last_val is None or v != last_val:
            rank += 1
            last_val = v
        r[out_field] = rank

def _to_item(r: Dict[str, Any]) -> UniversityLeaderboardItem:
    return UniversityLeaderboardItem(**r)

def build_leaderboards(
    db: Session,
    user_school_code: Optional[str],
    user_id: Optional[str] = None,
    limit: int = 10
) -> Tuple[Optional[UniversityLeaderboardItem], List[UniversityLeaderboardItem], List[UniversityLeaderboardItem]]:
    """
    - 전체 학교 기준으로 두 랭킹(총/평균)을 계산해 랭크 필드 부여
    - Top N(기본 10) 추려서 반환
    - 현재 유저 학교의 랭킹(두 기준 모두)을 찾아 함께 반환
    """
    rows = _rows(db)
    if not rows:
        return None, [], []

    # ----- 총 경험치 랭킹 -----
    overall_sorted = sorted(rows, key=lambda x: (x["total_exp"], x["university_code"]), reverse=True)
    _dense_rank(overall_sorted, key="total_exp", out_field="rank_overall")

    # ----- 평균 경험치 랭킹 -----
    avg_sorted = sorted(rows, key=lambda x: (x["avg_exp"], x["university_code"]), reverse=True)
    _dense_rank(avg_sorted, key="avg_exp", out_field="rank_avg")

    # 각 학교별로 두 랭크를 병합(코드 기준으로 merge)
    by_code: Dict[str, Dict[str, Any]] = {r["university_code"]: dict(r) for r in rows}
    for r in overall_sorted:
        by_code[r["university_code"]]["rank_overall"] = r["rank_overall"]
    for r in avg_sorted:
        by_code[r["university_code"]]["rank_avg"] = r["rank_avg"]

    # Top N 리스트
    top10_overall = [_to_item(by_code[r["university_code"]]) for r in overall_sorted[:limit]]
    top10_avg = [_to_item(by_code[r["university_code"]]) for r in avg_sorted[:limit]]

    # 내 학교
    my_item: Optional[UniversityLeaderboardItem] = None
    print(f"🔍 DEBUG: user_school_code = {user_school_code}")
    print(f"🔍 DEBUG: by_code keys = {list(by_code.keys())}")
    print(f"🔍 DEBUG: user_school_code in by_code = {user_school_code in by_code if user_school_code else False}")
    
    if user_school_code and user_school_code in by_code:
        my_school_data = dict(by_code[user_school_code])
        print(f"🔍 DEBUG: my_school_data = {my_school_data}")
        
        # 사용자 개인 경험치 조회
        user_total_exp = 0
        if user_id:
            from app.models import UserStats
            user_stats = db.query(UserStats.total_exp).filter(UserStats.user_id == user_id).first()
            if user_stats:
                user_total_exp = user_stats[0]
            print(f"🔍 DEBUG: user_id = {user_id}, user_total_exp = {user_total_exp}")
        
        my_school_data['user_total_exp'] = user_total_exp
        my_item = _to_item(my_school_data)
        print(f"🔍 DEBUG: my_item = {my_item}")
    else:
        print(f"🔍 DEBUG: 내 학교 데이터 생성 실패")

    return my_item, top10_overall, top10_avg

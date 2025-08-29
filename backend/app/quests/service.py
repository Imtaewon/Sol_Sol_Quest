# app/quests/service.py
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid


from app.models import (
    User, UserStats, Tier, 
    Quest, QuestAttempt, QuestAttemptStatusEnum, 
    SchoolLeaderboard, TierNameEnum, PeriodScopeEnum
)

def _now_kst() -> datetime:
    return datetime.now(ZoneInfo("Asia/Seoul"))

def _gen_id() -> str:
    return uuid.uuid4().hex[:26].upper()  # 26자

# --- helpers --------------------------------------------------------------

def _ensure_school_lb(db: Session, school_id: str) -> SchoolLeaderboard:
    """
    학교 리더보드 행을 가져오고, 없으면 생성한다.
    동시성 안전을 위해 with_for_update()로 잠금 (DB/격리수준에 따라 적용되지 않을 수 있음).
    """
    lb = (
        db.query(SchoolLeaderboard)
          .filter(SchoolLeaderboard.school_id == school_id)
          .with_for_update()
          .first()
    )
    if not lb:
        lb = SchoolLeaderboard(
            school_id=school_id,
            savings_students=0,
            total_exp=0,
            avg_exp=0
        )
        db.add(lb)
        db.flush()  # PK/기본값 확보
    return lb

def _recalc_avg(lb: SchoolLeaderboard) -> None:
    """
    avg_exp = total_exp / savings_students (소수점 둘째 자리 반올림)
    """
    s = int(lb.savings_students or 0)
    t = int(lb.total_exp or 0)
    if s > 0:
        lb.avg_exp = (Decimal(t) / Decimal(s)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    else:
        lb.avg_exp = Decimal("0.00")

# --- main ----------------------------------------------------------------

# 퀘스트 완료시 경험치 및 티어 증가 + 학교 리더보드(total_exp, avg_exp) 갱신
def complete_quest(db: Session, user_id: str, quest_id: str):
    """
    퀘스트 완수 → 경험치 증가 → 필요 시 티어 승급 → (학교 리더보드) total_exp/avg_exp 즉시 반영
    """
    try:
        # 0) 유저/학교 확인
        user: User | None = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("존재하지 않는 사용자입니다.")

        # 1) 퀘스트 정보(보상 EXP)
        quest = db.query(Quest).filter(Quest.id == quest_id).first()
        if not quest:
            raise ValueError("존재하지 않는 퀘스트입니다.")
        reward_exp = int(quest.reward_exp or 0)

        # 2) 유저 스탯
        user_stat = db.query(UserStats).filter(UserStats.user_id == user_id).first()
        if not user_stat:
            raise ValueError("유저 스탯이 존재하지 않습니다.")

        prev_total_exp = int(user_stat.total_exp or 0)
        prev_tier = user_stat.current_tier

        # 3) 경험치 증가
        user_stat.total_exp = prev_total_exp + reward_exp

        # 4) 티어 승급 판단(조건 만족 최고 티어)
        eligible_tier = (
            db.query(Tier)
              .filter(Tier.required_exp <= user_stat.total_exp)
              .order_by(Tier.required_exp.desc())
              .first()
        )
        if eligible_tier and eligible_tier.name != user_stat.current_tier:
            user_stat.current_tier = eligible_tier.name

        # 5) (학교 리더보드) total_exp/avg_exp 갱신
        #    - 학교가 없는 유저는 건너뜀
        if user.school_id:
            lb = _ensure_school_lb(db, user.school_id)
            lb.total_exp = int(lb.total_exp or 0) + reward_exp
            _recalc_avg(lb)
            db.add(lb)

        # 6) 커밋
        db.add(user_stat)
        db.commit()
        db.refresh(user_stat)

        return {
            "success": True,
            "data": {
                "gained_exp": reward_exp,
                "total_exp": user_stat.total_exp,
                "current_tier": user_stat.current_tier,
            }
        }

    except (SQLAlchemyError, ValueError) as e:
        db.rollback()
        return {"success": False, "message": str(e)}


# (시현용) 단일 퀘스트 즉시 완료
def simple_finish_quest(db: Session, user_id: str, quest_id: str) -> dict:
    """
    단일(시현용) 퀘스트: 버튼 클릭 → 즉시 완료로 기록 + EXP/티어 반영
    - period_scope/key 고정(ANY, '-')
    - 중복 클릭 고려 X (데모용)
    """


    try:
        quest_attempts = db.query(QuestAttempt).filter(QuestAttempt.quest_id == quest_id, QuestAttempt.user_id == user_id).first()
        if not quest_attempts:
            raise ValueError("존재하지 않거나 비활성화된 퀘스트입니다.")

        # 만약 quest user_status == 'APPROVED'라면
        if quest_attempts.status == 'APPROVED':
            raise ValueError("이미 완료된 퀘스트입니다.")


        # 즉시 완료 기록
        now = _now_kst()
        attempt = QuestAttempt(
            id=_gen_id(),
            quest_id=quest_id,
            user_id=user_id,
            status=QuestAttemptStatusEnum.APPROVED,   # 바로 완료 처리
            progress_count=quest_attempts.progress_count or 1,
            target_count=quest_attempts.target_count or 1,
            proof_url=None,
            period_scope=PeriodScopeEnum.ANY,         # 시현 간소화
            period_key="-",
            started_at=now,
            submitted_at=now,
            approved_at=now,
        )
        db.add(attempt)
        db.flush()  # attempt.id 확보

        reward = complete_quest(db, user_id=user_id, quest_id=quest_id)  # 내부에서 commit

        return {
            "success": True,
            "data": {
                "attempt_id": attempt.id,
                "attempt_status": attempt.status,
                "reward": reward.get("data"),
            },
        }
    except (SQLAlchemyError, ValueError) as e:
        db.rollback()
        return {"success": False, "message": str(e)}


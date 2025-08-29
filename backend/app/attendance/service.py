# app/attendance/service.py
from datetime import datetime, timedelta, date as DateType, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
import uuid

from app.models import Attendance
from app.models import Quest  # reward_exp 읽어올 용도
# 프로젝트에 있는 실제 모델로 교체하세요.
from app.models import QuestAttempt  # quest_attempts 테이블 모델 (id, user_id, quest_id, status)
# status가 Enum이면 import 해서 사용, 여기선 문자열 "CLEAR" 만 씁니다.

QUEST_ID_DAILY = "quest_daily_017"

def _now_kst():
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("Asia/Seoul"))
    except Exception:
        return datetime.now(timezone(timedelta(hours=9)))

def _today_kst_date() -> DateType:
    return _now_kst().date()

def _id26() -> str:
    return uuid.uuid4().hex[:26].upper()

def check_in_and_clear_daily_quest(db: Session, user_id: str) -> int:
    """
    1) 오늘자 attendance insert (중복이면 무시)
    2) quest_attempts에서 해당 유저의 quest_daily_017 상태를 CLEAR 로 업데이트(없으면 생성)
    3) exp_gained = quests.reward_exp (id=quest_daily_017) 로 반환
    """
    today = _today_kst_date()

    # 1) 출석 저장(중복 가능성 → 유니크 제약으로 방어)
    att = Attendance(
        id=_id26(),
        user_id=user_id,
        date=today,
        is_attend=True,
    )
    db.add(att)
    try:
        db.flush()  # 즉시 insert 시도하여 유니크 위반 빨리 감지
    except IntegrityError:
        db.rollback()
        # 이미 출석되어 있어도 아래 퀘스트 CLEAR 처리와 exp 조회는 진행

    # 2) 데일리 퀘스트 시도/상태 갱신 (존재하면 업데이트, 없으면 생성)
    qa = db.execute(
        select(QuestAttempt).where(
            QuestAttempt.user_id == user_id,
            QuestAttempt.quest_id == QUEST_ID_DAILY
        )
    ).scalar_one_or_none()

    if qa:
        qa.status = "CLEAR"
        # 필요시 qa.updated_at = _now_kst()
        db.add(qa)
    else:
        qa = QuestAttempt(
            id=_id26(),
            user_id=user_id,
            quest_id=QUEST_ID_DAILY,
            status="CLEAR",
            progress_count=1,
            target_count=1,
            period_scope="DAILY",
        )
        db.add(qa)

    # 3) 보상 경험치 조회
    quest = db.execute(
        select(Quest).where(Quest.id == QUEST_ID_DAILY)
    ).scalar_one_or_none()
    exp_gained = int(getattr(quest, "reward_exp", 0) or 0)

    db.commit()
    return exp_gained

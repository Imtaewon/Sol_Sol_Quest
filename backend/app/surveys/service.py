from __future__ import annotations
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.models import SurveyQuestion, SurveyQuestionOption, SurveyAnswer

# ---- ID 생성기(26자) ----
# 프로젝트에서 ULID/기존 규약이 있으면 교체하세요.
import time, random, string
def new_id() -> str:
    now = int(time.time() * 1000)
    rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=13))
    return f"{now:013d}{rand}"[:26]


def now_kst() -> datetime:
    # created_at 기본값이 모델에 없으므로 서비스에서 채워줌
    return datetime.utcnow().replace(tzinfo=timezone.utc) + timedelta(hours=9)


# ----- 조회 -----
def list_all_questions(db: Session) -> List[SurveyQuestion]:
    return (
        db.query(SurveyQuestion)
        .order_by(SurveyQuestion.order_no.asc())
        .all()
    )


def get_question_by_order_no(db: Session, order_no: int) -> Optional[SurveyQuestion]:
    return (
        db.query(SurveyQuestion)
        .filter(SurveyQuestion.order_no == order_no)
        .first()
    )


# ----- 답변 업서트 -----
def upsert_answers(db: Session, user_id: str, items: List["SurveyAnswerIn"]) -> int:
    """
    같은 (user_id, question_id)가 이미 있으면 갱신, 없으면 생성
    - SurveyAnswer.created_at: 모델 기본값이 없으므로 여기서 직접 세팅
    - question_type: 질문 테이블의 당시 값으로 스냅샷
    """
    if not items:
        return 0

    qids = [it.question_id for it in items]
    questions = db.query(SurveyQuestion).filter(SurveyQuestion.id.in_(qids)).all()
    qmap = {q.id: q for q in questions}

    upserted = 0
    for it in items:
        q = qmap.get(it.question_id)
        if not q:
            # 존재하지 않는 문항은 스킵(필요 시 ValueError로 바꿔 400 처리)
            continue

        existing = (
            db.query(SurveyAnswer)
            .filter(
                SurveyAnswer.user_id == user_id,
                SurveyAnswer.question_id == it.question_id
            )
            .first()
        )

        if existing:
            existing.option_id = it.option_id
            existing.question_type = q.question_type
            upserted += 1
        else:
            ans = SurveyAnswer(
                id=new_id(),
                user_id=user_id,
                question_id=it.question_id,
                question_type=q.question_type,
                option_id=it.option_id,
                created_at=now_kst().replace(tzinfo=None),  # DB 컬럼이 naive면 tz 제거
            )
            db.add(ans)
            upserted += 1

    db.commit()
    return upserted


# ----- 사용자 답변 조회(선택) -----
def get_my_answers_map(db: Session, user_id: str) -> dict[str, SurveyAnswer]:
    """
    사용자의 최신 답변을 question_id → SurveyAnswer 로 매핑해 반환
    """
    rows = (
        db.query(SurveyAnswer)
        .filter(SurveyAnswer.user_id == user_id)
        .all()
    )
    return {r.question_id: r for r in rows}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.surveys.schemas import (
    SurveyQuestionOut,
    SubmitSurveyAnswersRequest,
    SubmitSurveyAnswersResponse,
)
from app.surveys.service import (
    list_all_questions,
    get_question_by_order_no,
    upsert_answers,
    get_my_answers_map,
)

# 프로젝트의 인증 의존성에 맞게 import
from app.auth.deps import get_current_user  # user.id 제공 가정

router = APIRouter(prefix="/saving/survey", tags=["Saving Survey"])


# 문항 전체 + 옵션
@router.get("", response_model=list[SurveyQuestionOut])
def get_questions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    qs = list_all_questions(db)
    return qs


# order_no로 단일 문항 + 옵션
@router.get("/{order_no}", response_model=SurveyQuestionOut)
def get_question(order_no: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    q = get_question_by_order_no(db, order_no)
    if not q:
        raise HTTPException(status_code=404, detail="해당 순서의 문항이 없습니다.")
    return q


# 답변 제출(배치 업서트)
@router.post("/responses", response_model=SubmitSurveyAnswersResponse)
def submit_answers(
    payload: SubmitSurveyAnswersRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    upserted = upsert_answers(db, user_id=user.id, items=payload.items)
    return SubmitSurveyAnswersResponse(success=True, upserted=upserted)


# (선택) 내 답변 맵 조회: question_id → option_id
@router.get("/my-answers")
def get_my_answers(db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    프론트에서 '이미 고른 보기'를 표시할 때 유용.
    반환 예:
    {
      "01J8XCRP...": {"option_id": "01J8Y9...", "question_type": 2, "created_at": "..."},
      ...
    }
    """
    rows = get_my_answers_map(db, user.id)
    return {
        qid: {
            "option_id": (row.option_id or None),
            "question_type": row.question_type,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for qid, row in rows.items()
    }

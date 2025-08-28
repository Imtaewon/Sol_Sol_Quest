from typing import List, Optional
from pydantic import BaseModel, Field


# ----- 조회용 -----
class SurveyQuestionOptionOut(BaseModel):
    id: str
    order_no: int
    option_text: str

    class Config:
        from_attributes = True  # SQLAlchemy ORM → Pydantic 변환 허용


class SurveyQuestionOut(BaseModel):
    id: str
    order_no: int
    question: str
    question_type: int
    options: List[SurveyQuestionOptionOut] = []

    class Config:
        from_attributes = True


# ----- 제출용 -----
class SurveyAnswerIn(BaseModel):
    question_id: str = Field(..., min_length=1, max_length=26)
    option_id: Optional[str] = Field(None, max_length=26)  # 객관식 아닌 경우 None 가능


class SubmitSurveyAnswersRequest(BaseModel):
    items: List[SurveyAnswerIn]


class SubmitSurveyAnswersResponse(BaseModel):
    success: bool = True
    upserted: int

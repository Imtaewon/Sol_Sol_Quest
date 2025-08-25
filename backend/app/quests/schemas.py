# app/quests/schemas.py
from typing import Optional, Literal
from pydantic import BaseModel
from datetime import datetime
from app.models import (
    QuestTypeEnum, QuestVerifyMethodEnum, QuestCategoryEnum, PeriodScopeEnum,
    QuestAttemptStatusEnum
)

class QuestListItem(BaseModel):
    id: str
    type: QuestTypeEnum
    title: str
    description: Optional[str] = None
    verify_method: Optional[QuestVerifyMethodEnum] = None
    category: Optional[QuestCategoryEnum] = None
    verify_params: Optional[str] = None
    reward_exp: int
    target_count: Optional[int] = None
    period_scope: PeriodScopeEnum
    active: bool
    created_at: datetime

    # 사용자 컨텍스트(없으면 None)
    user_status: Optional[QuestAttemptStatusEnum | Literal["available"]] = None
    attempt_id: Optional[str] = None
    progress_count: Optional[int] = None
    user_target_count: Optional[int] = None
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # pydantic v2

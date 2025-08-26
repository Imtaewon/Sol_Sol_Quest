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
    verify_method: Optional[QuestVerifyMethodEnum] = None
    category: Optional[QuestCategoryEnum] = None
    verify_params: Optional[str] = None
    reward_exp: int
    target_count: Optional[int] = None
    period_scope: PeriodScopeEnum
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # pydantic v2


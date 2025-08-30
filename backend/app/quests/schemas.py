from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.models import (
    QuestTypeEnum, QuestVerifyMethodEnum, QuestCategoryEnum, PeriodScopeEnum,
    QuestAttemptStatusEnum,
)

class QuestListItem(BaseModel):
    # --- 퀘스트 정의 정보 ---
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
    created_at: Optional[datetime] = None   # 모델에 없으면 None 허용
    # (옵션) GPS 미션이면 쓰세요. 모델에 없으면 제거.
    lat: Optional[float] = None
    lng: Optional[float] = None
    link_url: Optional[str] = None   # ✅ 추가 (응답 필드명)


    # --- 유저 진행 상태(조인 결과) ---
    attempt_id: Optional[str] = None
    user_status: QuestAttemptStatusEnum
    progress_count: Optional[int] = 0
    user_target_count: Optional[int] = None
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # pydantic v2


class CompleteQuestRequest(BaseModel):
    proof_url: Optional[str] = None      # 업로드/링크 인증 시
    progress_count: Optional[int] = None # 수량형 미션(옵션, 없으면 target_count로 채움)


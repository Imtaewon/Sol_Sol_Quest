# app/quests/router.py
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, desc, asc, or_
from app.database import get_db
from app.auth.deps import get_current_user  # JWT 인증 의존성 (프로젝트에 이미 있음)
from app.models import (
    Quest, QuestAttempt,
    QuestTypeEnum, QuestVerifyMethodEnum, QuestCategoryEnum, PeriodScopeEnum
)
from .schemas import QuestListItem

router = APIRouter(prefix="/quests", tags=["Quests"])


@router.get("", response_model=dict)
def list_quests(
    # ------- 필터 -------
    type: Optional[QuestTypeEnum] = Query(None, description="퀘스트 유형"),
    category: Optional[QuestCategoryEnum] = Query(None, description="카테고리"),
    verify_method: Optional[QuestVerifyMethodEnum] = Query(None, description="인증 방식"),
    period_scope: Optional[PeriodScopeEnum] = Query(None, description="주기 스코프"),
    active: bool = Query(True, description="활성 상태만"),
    search: Optional[str] = Query(None, description="제목/설명 부분 검색"),

    # ------- 정렬 / 페이지네이션 -------
    sort_by: Literal["created_at", "reward_exp", "title"] = Query("created_at"),
    order: Literal["asc", "desc"] = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),

    # ------- 컨텍스트 -------
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),  # 현재 로그인 사용자
):
    """
    퀘스트 목록 조회 + (옵션) 현재 사용자 최신 시도 상태 조인
    """

    # 기본 쿼리
    q = db.query(Quest).filter(Quest.active == active)

    if type:
        q = q.filter(Quest.type == type)
    if category:
        q = q.filter(Quest.category == category)
    if verify_method:
        q = q.filter(Quest.verify_method == verify_method)
    if period_scope:
        q = q.filter(Quest.period_scope == period_scope)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(Quest.title.ilike(like), Quest.description.ilike(like)))


    # -------- 사용자별 최신 시도 서브쿼리 (퀘스트별 1개) --------
    # 현재 사용자(user_id)의 각 quest_id에 대해 가장 최근(시작시각 최대) attempt 1개
    LatestAttempt = aliased(QuestAttempt)
    sub_latest = (
        db.query(
            LatestAttempt.quest_id.label("quest_id"),
            func.max(LatestAttempt.started_at).label("max_started_at"),
        )
        .filter(LatestAttempt.user_id == current_user.id)
        .group_by(LatestAttempt.quest_id)
        .subquery()
    )

    # 위 서브쿼리와 실제 Attempt를 다시 조인해서, "최신" Attempt 레코드 자체를 얻는다
    LatestAttemptRow = aliased(QuestAttempt)
    # 주 쿼리에 조인해도 되고, 별도 쿼리 후 매핑해도 되나, 여기서는 조인으로 한 번에 묶는다.
    q = (
        q.outerjoin(
            sub_latest,
            sub_latest.c.quest_id == Quest.id
        )
        .outerjoin(
            LatestAttemptRow,
            (LatestAttemptRow.quest_id == Quest.id) &
            (LatestAttemptRow.user_id == current_user.id) &
            (LatestAttemptRow.started_at == sub_latest.c.max_started_at)
        )
    )

    # -------- 정렬 --------
    sort_col = {
        "created_at": Quest.created_at,
        "reward_exp": Quest.reward_exp,
        "title": Quest.title,
    }[sort_by]

    if order == "asc":
        q = q.order_by(asc(sort_col))
    else:
        q = q.order_by(desc(sort_col))

    # -------- total count (pagination) --------
    total_count = q.with_entities(func.count(Quest.id)).scalar() or 0

    # -------- 페이지네이션 --------
    rows = (
        q.with_entities(
            Quest,
            LatestAttemptRow.id.label("attempt_id"),
            LatestAttemptRow.status.label("user_status"),
            LatestAttemptRow.progress_count.label("progress_count"),
            LatestAttemptRow.target_count.label("user_target_count"),
            LatestAttemptRow.started_at.label("started_at"),
            LatestAttemptRow.submitted_at.label("submitted_at"),
            LatestAttemptRow.approved_at.label("approved_at"),
        )
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    # -------- 직렬화 --------
    items: list[QuestListItem] = []
    for quest_obj, attempt_id, user_status, progress_count, user_target_count, started_at, submitted_at, approved_at in rows:
        # attempt가 없으면 user_status는 "available"로 내려줌
        payload = QuestListItem(
            id=quest_obj.id,
            type=quest_obj.type,
            title=quest_obj.title,
            verify_method=quest_obj.verify_method,
            category=quest_obj.category,
            verify_params=quest_obj.verify_params,
            reward_exp=quest_obj.reward_exp,
            target_count=quest_obj.target_count,
            period_scope=quest_obj.period_scope,
            active=quest_obj.active,
            created_at=quest_obj.created_at,
            user_status=(user_status if attempt_id else "available"),
            attempt_id=attempt_id,
            progress_count=progress_count,
            user_target_count=user_target_count,
            started_at=started_at,
            submitted_at=submitted_at,
            approved_at=approved_at,
        )
        items.append(payload)

    return {
        "success": True,
        "data": {
            "quests": [item.model_dump() for item in items],
            "pagination": {
                "current_page": page,
                "total_pages": (total_count + limit - 1) // limit,
                "total_count": total_count,
            },
        },
    }

from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, desc, asc, and_
from app.database import get_db
from app.auth.deps import get_current_user
from app.models import (
    Quest, QuestAttempt,
    QuestTypeEnum, QuestVerifyMethodEnum, QuestCategoryEnum, PeriodScopeEnum,
    QuestAttemptStatusEnum
)
from .schemas import QuestListItem
from .service import simple_finish_quest

router = APIRouter(prefix="/quests", tags=["Quests"])

# 전체 퀘스트 목록
@router.get("", response_model=dict, summary="전체 퀘스트 목록 조회 (필터/정렬/페이지네이션)")
def list_quests(
    # ------- 필터 -------
    type: Optional[QuestTypeEnum] = Query(None, description="퀘스트 유형"),
    category: Optional[QuestCategoryEnum] = Query(None, description="카테고리"),
    verify_method: Optional[QuestVerifyMethodEnum] = Query(None, description="인증 방식"),
    period_scope: Optional[PeriodScopeEnum] = Query(None, description="주기 스코프"),
    active: bool = Query(True, description="활성 상태만"),
    search: Optional[str] = Query(None, description="제목 부분 검색"),

    # ------- 정렬 / 페이지네이션 -------
    sort_by: Literal["created_at", "reward_exp", "title"] = Query("created_at"),
    order: Literal["asc", "desc"] = Query("desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    퀘스트 목록 조회 + 현재 사용자 진행상태(최신 attempt 1건) 조인
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
        q = q.filter(Quest.title.ilike(like))

    # ---- (중요) 유저별 최신 attempt 서브쿼리 ----
    QA1 = aliased(QuestAttempt)
    sub_latest = (
        db.query(
            QA1.quest_id.label("quest_id"),
            func.max(QA1.started_at).label("max_started_at"),
        )
        .filter(QA1.user_id == current_user.id)
        .group_by(QA1.quest_id)
        .subquery()
    )

    # 최신 attempt 레코드
    QA = aliased(QuestAttempt)
    q = (
        q.outerjoin(
            sub_latest,
            sub_latest.c.quest_id == Quest.id
        )
        .outerjoin(
            QA,
            and_(
                QA.quest_id == Quest.id,
                QA.user_id == current_user.id,
                QA.started_at == sub_latest.c.max_started_at
            )
        )
    )

    # 정렬 컬럼 안전 처리 (created_at 없으면 id로 대체)
    sort_map = {
        "created_at": getattr(Quest, "created_at", Quest.id),
        "reward_exp": Quest.reward_exp,
        "title": Quest.title,
    }
    sort_col = sort_map[sort_by]
    q = q.order_by(asc(sort_col) if order == "asc" else desc(sort_col))

    # total count (성능 고려: 별도 카운트 서브쿼리)
    total_count = q.with_entities(func.count(Quest.id)).scalar() or 0

    # 페이지네이션 & 선택 컬럼
    rows = (
        q.with_entities(
            Quest.id, Quest.type, Quest.title, Quest.verify_method, Quest.category,
            Quest.verify_params, Quest.reward_exp, Quest.target_count, Quest.period_scope,
            Quest.active,
            getattr(Quest, "created_at", None).label("created_at"),
            # (옵션) 모델에 없으면 주석 처리
            getattr(Quest, "lat", None).label("lat"),
            getattr(Quest, "lng", None).label("lng"),

            QA.id.label("attempt_id"),
            QA.status.label("user_status"),
            QA.progress_count.label("progress_count"),
            QA.target_count.label("user_target_count"),
            QA.started_at.label("started_at"),
            QA.submitted_at.label("submitted_at"),
            QA.approved_at.label("approved_at"),
        )
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    items: list[QuestListItem] = []
    for row in rows:
        (
            quest_id, quest_type, title, verify_method, category,
            verify_params, reward_exp, target_count, period_scope,
            active,
            created_at,
            lat, lng,

            attempt_id, user_status, progress_count, user_target_count,
            started_at, submitted_at, approved_at
        ) = row

        # attempt가 없으면 DEACTIVE로 해석
        if user_status is None:
            user_status = QuestAttemptStatusEnum.DEACTIVE
            progress_count = 0
            user_target_count = target_count  # 없으면 기본 타겟을 그대로

        items.append(QuestListItem(
            id=quest_id,
            type=quest_type,
            title=title,
            verify_method=verify_method,
            category=category,
            verify_params=verify_params,
            reward_exp=reward_exp,
            target_count=target_count,
            period_scope=period_scope,
            active=active,
            created_at=created_at,
            lat=lat,
            lng=lng,

            attempt_id=attempt_id,
            user_status=user_status,
            progress_count=progress_count,
            user_target_count=user_target_count,
            started_at=started_at,
            submitted_at=submitted_at,
            approved_at=approved_at,
        ))

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


# (시현용) 단일 퀘스트 즉시 완료
@router.post("/{quest_id}/complete", summary="(시현용) 단일 퀘스트 즉시 완료")
def complete_simple_quest(
    quest_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    result = simple_finish_quest(db=db, user_id=current_user.id, quest_id=quest_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message", "처리 실패"))
    return result

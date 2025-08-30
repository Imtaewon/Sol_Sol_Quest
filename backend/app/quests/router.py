# app/quests/router.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, aliased
from sqlalchemy import func, and_
from app.database import get_db
from app.auth.deps import get_current_user
from app.models import Quest, QuestAttempt, QuestAttemptStatusEnum
from .schemas import QuestListItem, CompleteQuestRequest
from .service import simple_finish_quest, quest_submitted, complete_quest_with_auto_attempt
import os
from datetime import datetime
import uuid

router = APIRouter(prefix="/quests", tags=["Quests"])


# 전체 퀘스트 목록 (quests 배열만 반환)
@router.get("", response_model=dict, summary="전체 퀘스트 목록 조회")
def list_quests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    모든 퀘스트 + 현재 사용자 진행상태(최신 attempt 1건) 반환
    """
    q = db.query(Quest).filter(Quest.active == True)

    # ---- 유저별 최신 attempt 서브쿼리 ----
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

    QA = aliased(QuestAttempt)
    q = (
        q.outerjoin(sub_latest, sub_latest.c.quest_id == Quest.id)
         .outerjoin(
            QA,
            and_(
                QA.quest_id == Quest.id,
                QA.user_id == current_user.id,
                QA.started_at == sub_latest.c.max_started_at
            )
        )
    )

    # 전체 조회
    rows = (
        q.with_entities(
            Quest.id, Quest.type, Quest.title, Quest.verify_method, Quest.category,
            Quest.verify_params, Quest.reward_exp, Quest.target_count, Quest.period_scope,
            Quest.active, Quest.created_at, Quest.lat, Quest.lng,
            Quest.quest_link_url.label("link_url"),   # ✅ 추가: DB 컬럼을 응답 필드명으로 라벨링


            QA.id.label("attempt_id"),
            QA.status.label("user_status"),
            QA.progress_count.label("progress_count"),
            QA.target_count.label("user_target_count"),
            QA.started_at.label("started_at"),
            QA.submitted_at.label("submitted_at"),
            QA.approved_at.label("approved_at"),
        )
        .all()
    )

    items: list[QuestListItem] = []
    for row in rows:
        (
            quest_id, quest_type, title, verify_method, category,
            verify_params, reward_exp, target_count, period_scope,
            active, created_at, lat, lng, link_url,
            attempt_id, user_status, progress_count, user_target_count,
            started_at, submitted_at, approved_at
        ) = row

        if user_status is None:
            user_status = QuestAttemptStatusEnum.DEACTIVE
            progress_count = 0
            user_target_count = target_count

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
            link_url=link_url,   # ✅ 여기!
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
        "quests": [item.model_dump() for item in items]
    }


# (시현용) 단일 퀘스트 즉시 완료
@router.post("/{quest_id}/complete", summary="(시현용) 단일 퀘스트 즉시 완료")
def complete_simple_quest(
    quest_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = simple_finish_quest(db=db, user_id=current_user.id, quest_id=quest_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message", "처리 실패"))
    return result

# 업로드 인증 퀘스트 완료처리
@router.post("/{quest_id}/upload", summary="업로드 인증 퀘스트 완료처리")
def complete_upload_quest(
    quest_id: str,
    request: CompleteQuestRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = quest_submitted(db=db, user_id=current_user.id, quest_id=quest_id, proof_url=request.proof_url)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message", "처리 실패"))
    return result


# 퀘스트 완료 (시도 기록 자동 생성)
@router.post("/{quest_id}/claim", summary="퀘스트 완료 및 경험치 수령")
def claim_quest_reward(
    quest_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = complete_quest_with_auto_attempt(db=db, user_id=current_user.id, quest_id=quest_id)
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("message", "처리 실패"))
    return result


# 파일 업로드 엔드포인트
@router.post("/upload/file", summary="퀘스트 증빙 파일 업로드")
async def upload_quest_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """
    퀘스트 증빙 파일을 업로드하고 URL을 반환합니다.
    """
    try:
        # 파일 확장자 검증
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"지원하지 않는 파일 형식입니다. 지원 형식: {', '.join(allowed_extensions)}"
            )
        
        # 파일 크기 검증 (10MB 제한)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="파일 크기는 10MB를 초과할 수 없습니다."
            )
        
        # 고유한 파일명 생성
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        safe_filename = f"quest_proof_{timestamp}_{unique_id}{file_extension}"
        
        # 실제 구현에서는 파일을 S3나 로컬 스토리지에 저장
        # 여기서는 시뮬레이션을 위해 가짜 URL 반환
        file_url = f"https://sol-sol-quest-uploads.s3.amazonaws.com/quest-proofs/{safe_filename}"
        
        return {
            "success": True,
            "message": "파일 업로드 성공",
            "file_url": file_url,
            "filename": safe_filename,
            "original_filename": file.filename,
            "file_size": file.size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        )

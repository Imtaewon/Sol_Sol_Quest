# app/users/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.auth.deps import get_current_user
from app.database import get_db
from app.auth.utils import hash_password

from app.models import (
    User, School, UserStats, TierNameEnum
)
from .schemas import UpdateMeRequest

router = APIRouter(prefix="/users", tags=["Users"])


# --- helpers ---
def get_school_or_400(db: Session, code: str, name: str | None = None) -> School:
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="university_code가 필요합니다."
        )

    school = db.query(School).filter(School.code == code).first()
    if not school:
        # name이 같이 들어온 경우, 디버깅을 돕는 메시지로 활용
        hint = f" (client_name={name})" if name else ""
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"등록되지 않은 university_code 입니다.{hint}"
        )
    return school

def _safe_userstat(db: Session, user_id: str):
    stat = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if stat:
        return stat.current_tier, stat.total_exp
    return TierNameEnum.BRONZE, 0


# --- routes ---
@router.get("/me", summary="내 프로필 조회")
def read_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 관계/통계 로드
    school = db.query(School).filter(School.id == current_user.school_id).first() if current_user.school_id else None
    current_tier, total_exp = _safe_userstat(db, current_user.id)

    return {
        "success": True,
        "data": {
            "user_id": current_user.id,
            "name": current_user.real_name,
            "email": current_user.email,
            "university_code": school.code if school else None,
            "university_name": school.name if school else None,
            "current_tier": current_tier,
            "total_exp": total_exp,
            "gender": current_user.gender.value if current_user.gender else None,
            "major": current_user.department,
            "grade": current_user.grade,
            "birth_year": current_user.birth_year,
        },
    }


@router.patch("/me", summary="내 프로필 수정")
def update_me(
    body: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="변경할 값이 없습니다.")

    # 대학 정보 갱신(코드/이름 중 코드 기준으로 매핑)
    uni_code = data.get("university_code")
    uni_name = data.get("university_name")
    if uni_code:
        school = get_school_or_400(db, code=uni_code, name=uni_name)
        current_user.school_id = school.id if school else None

    # 단순 필드 매핑 (스키마 명세에 맞춰 존재하는 항목만 반영)
    if "major" in data:
        current_user.department = data["major"]
    if "grade" in data:
        current_user.grade = data["grade"]
    if "name" in data:
        current_user.real_name = data["name"]
    # if "gender" in data:
    #     # Enum 검증은 Pydantic 스키마에서 처리된다고 가정
    #     current_user.gender = data["gender"]
    # # 나이 대신 출생연도 사용(스키마가 age만 준다면 스키마 조정 권장)
    # if "birth_year" in data:
    #     current_user.birth_year = data["birth_year"]

    # 비밀번호 변경
    if "password" in data and data["password"]:
        current_user.password_hash = hash_password(data["password"])

    try:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="중복되는 정보가 있습니다.(이메일 등)")

    return {
        "success": True,
        "data": {
            "user_id": current_user.id,
            "message": "프로필이 업데이트되었습니다.",
        },
    }

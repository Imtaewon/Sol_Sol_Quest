# app/users/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.deps import get_current_user
from app.auth.models import User
from app.deps import get_db
from .schemas import UpdateMeRequest
from app.auth.utils import hash_password

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
def read_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 최소 프로필 (필요 시 필드 추가)
    return {
        "success": True,
        "data": {
            "user_id": current_user.user_id,
            "name": current_user.name,
            "email": current_user.email,
            "university_code": current_user.university_code,
            "university_name": current_user.university_name,
            "current_tier": current_user.current_tier,
            "total_exp": current_user.total_exp,
            "gender": current_user.gender.value if current_user.gender else None,
            "major": current_user.major,
            "grade": current_user.grade,
        },
    }

@router.patch("/me")
def update_me(
    body: UpdateMeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="변경할 값이 없습니다.")

    # 허용 필드만 갱신
    simple_fields = ["university_code", "university_name", "major", "grade", "age"]
    for f in simple_fields:
        if f in data:
            setattr(current_user, f, data[f])

    # 비밀번호 변경 요청 시 해시 교체
    if "password" in data and data["password"]:
        current_user.hashed_pw = hash_password(data["password"])

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    # 스펙에 맞춘 응답 형태
    return {
        "success": True,
        "data": {
            "user_id": str(current_user.user_id),
            "message": "프로필이 업데이트되었습니다.",
        }
    }
# auth/schemas.py
from pydantic import BaseModel, EmailStr, field_validator, FieldValidationInfo, model_validator
from typing import Optional, Dict, Any
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"

class RegisterRequest(BaseModel):
    name: str
    gender: Optional[GenderEnum] = None
    age: Optional[int] = None
    email: EmailStr
    password: str
    password_confirm: str
    university_code: str
    university_name: str
    major: str
    grade: Optional[int] = None

    # (선택) 단일 필드 규칙은 field_validator 사용
    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다.")
        return v

    # ✅ 교차 필드 검증은 model_validator(after)로 — 함수 이름을 다르게!
    @model_validator(mode="after")
    def ensure_passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("비밀번호와 비밀번호 확인이 일치하지 않습니다.")
        return self

class RegisterResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    message: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool = True
    data: dict

# auth/schemas.py
from pydantic import BaseModel, EmailStr, field_validator, FieldValidationInfo, model_validator
from typing import Optional, Dict, Any
from enum import Enum

class GenderEnum(str, Enum):
    M = "M"
    F = "F"
    X = "X"

class RegisterRequest(BaseModel):
    login_id: str
    email: EmailStr
    password: str
    password_confirm: str
    real_name: str
    gender: Optional[GenderEnum] = None
    birth_year: Optional[int] = None
    university_code: str
    university_name: str
    department: Optional[str] = None
    grade: Optional[int] = None

    @model_validator(mode="after")
    def validate_data(self):
        if self.password != self.password_confirm:
            raise ValueError("비밀번호가 일치하지 않습니다.")
        if len(self.password) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다.")
        return self

class RegisterResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    message: str

class LoginRequest(BaseModel):
    login_id: str
    password: str

class LoginResponse(BaseModel):
    success: bool = True
    data: dict

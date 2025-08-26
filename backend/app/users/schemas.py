# app/users/schemas.py
from pydantic import BaseModel, Field
from typing import Optional

class UpdateMeRequest(BaseModel):
    university_code: Optional[str] = None
    university_name: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[int] = Field(default=None, ge=1, le=8)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)

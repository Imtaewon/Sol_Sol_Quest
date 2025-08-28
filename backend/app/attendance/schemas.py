# app/attendance/schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class CheckInRequest(BaseModel):
    # 호환성: 바디를 보낼 수도 있으나, 값이 있어도 "오늘 날짜"로 저장합니다.
    date: Optional[date] = None

class CheckInResponseData(BaseModel):
    exp_gained: int

class CheckInResponse(BaseModel):
    success: bool = True
    data: CheckInResponseData


class AttendanceMonthData(BaseModel):
    attendance_dates: List[str] = Field(..., description="YYYY-MM-DD 문자열 배열")
    total_days: int
    attended_days: int

class AttendanceMonthResponse(BaseModel):
    success: bool = True
    data: AttendanceMonthData
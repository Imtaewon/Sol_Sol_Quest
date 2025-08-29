# app/attendance/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
import calendar

from app.database import get_db
from app.auth.deps import get_current_user
from app.attendance.schemas import CheckInRequest, CheckInResponse, CheckInResponseData, AttendanceMonthResponse, AttendanceMonthData
from app.attendance.service import check_in_and_clear_daily_quest
from app.models import Attendance  # id, user_id, date, is_attend


router = APIRouter(prefix="/attendance", tags=["Attendance"])

# 출석 체크 및 데일리 퀘스트 클리어
@router.post("/check-in", response_model=CheckInResponse)
def attendance_check_in(
    _req: CheckInRequest,  # 요청 본문은 받되 실제로는 오늘 날짜로 고정 처리
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        exp = check_in_and_clear_daily_quest(db, user_id=user.id)
        return CheckInResponse(success=True, data=CheckInResponseData(exp_gained=exp))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="출석 처리 중 오류가 발생했습니다."
        )

# 출석 내역 조회(월)
@router.get("/{year}/{month}", response_model=AttendanceMonthResponse, summary="출석 내역 조회(월)")
def get_attendance_by_month(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # 1) 파라미터 검증
    if year < 1970 or year > 2100 or month < 1 or month > 12:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="연/월 파라미터가 올바르지 않습니다.")

    # 2) 월 범위 계산
    days_in_month = calendar.monthrange(year, month)[1]
    first_day = date(year, month, 1)
    last_day = date(year, month, days_in_month)

    # 3) 해당 유저의 해당 월 출석일 조회 (True만)
    rows = (
        db.query(Attendance.date)
          .filter(
              and_(
                  Attendance.user_id == user.id,
                  Attendance.is_attend == True,
                  Attendance.date >= first_day,
                  Attendance.date <= last_day,
              )
          )
          .all()
    )

    # 4) YYYY-MM-DD 문자열로 정렬·중복 제거
    attendance_dates = sorted({d[0].strftime("%Y-%m-%d") for d in rows})
    attended_days = len(attendance_dates)

    return AttendanceMonthResponse(
        success=True,
        data=AttendanceMonthData(
            attendance_dates=attendance_dates,
            total_days=days_in_month,
            attended_days=attended_days,
        ),
    )

# app/accounts/router.py

from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session

from app.accounts.schemas import (
    AccountDTO,
    CreateDemandDepositAccountRequest,
    CreateDemandDepositAccountResponse,
    CreateSavingsAccountRequest,
    CreateSavingsAccountResponse,
)
from app.accounts.service import create_demand_deposit_account as svc_create, create_savings_account as svc_create_savings
from app.auth.deps import get_current_user
from app.database import get_db
from app.models import User

router = APIRouter(prefix="/accounts", tags=["Accounts"])


# 수시입출금 계좌 생성
@router.post("/demand-deposit", response_model=CreateDemandDepositAccountResponse, summary="수시입출금 계좌 생성")
async def create_demand_deposit_account_endpoint(
    req: CreateDemandDepositAccountRequest,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    try:
        result = await svc_create(db=db, user_id=req.user_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    dto = AccountDTO(account_no=result["account_no"])
    return CreateDemandDepositAccountResponse(success=True, data=dto, message="계좌 생성 및 저장 완료")

# 적금 계좌 생성
@router.post("/savings", response_model=CreateSavingsAccountResponse, summary="적금 계좌 생성")
async def create_savings_account_endpoint(
    req: CreateSavingsAccountRequest,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):

    try:
        result = await svc_create_savings(
            db=db,
            user_id=req.user_id,
            deposit_balance=req.deposit_balance,
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    dto = AccountDTO(account_no=result["account_no"])
    return CreateSavingsAccountResponse(
        success=True,
        data=dto,
        message="적금 계좌 생성 요청이 완료되었습니다."
    )
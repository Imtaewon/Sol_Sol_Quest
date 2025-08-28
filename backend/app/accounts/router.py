# app/accounts/router.py

from fastapi import APIRouter, Depends, HTTPException, status, Path, Query
from sqlalchemy.orm import Session

from app.accounts.schemas import (
    AccountDTO,
    CreateDemandDepositAccountRequest,
    CreateDemandDepositAccountResponse,
    CreateSavingsAccountRequest,
    CreateSavingsAccountResponse,
    DemandDepositAccountsResponse,
    SavingsAccountsResponse,
    SavingsAccountDTO,
)
from app.accounts.service import create_demand_deposit_account as svc_create, create_savings_account as svc_create_savings
from app.auth.deps import get_current_user
from app.database import get_db
from app.models import User, DemandDepositAccount, InstallmentSavingsAccount

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


# ------------ (신규) GET 조회 엔드포인트들 ------------

@router.get(
    "/demand-deposit",
    response_model=DemandDepositAccountsResponse,
    summary="수시입출금 계좌 목록 조회",
)
def list_demand_deposit_accounts(
    user_id: str = Query(..., min_length=1, max_length=64),
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    # 본인 계정만 조회 허용(필요 시 정책 변경)
    if me.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")

    rows = (
        db.query(DemandDepositAccount)
          .filter(DemandDepositAccount.user_id == user_id)
          .order_by(DemandDepositAccount.opened_at.desc())
          .all()
    )

    data = [AccountDTO(account_no=r.account_no or "") for r in rows if r.account_no]
    return DemandDepositAccountsResponse(success=True, data=data, message=None)


@router.get(
    "/savings",
    response_model=SavingsAccountsResponse,
    summary="적금 계좌(계약) 목록 조회",
)
def list_savings_accounts(
    user_id: str = Query(..., min_length=1, max_length=64),
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    if me.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="권한이 없습니다.")

    rows = (
        db.query(InstallmentSavingsAccount)
          .filter(InstallmentSavingsAccount.user_id == user_id)
          .order_by(InstallmentSavingsAccount.opened_at.desc())
          .all()
    )

    data = [
        SavingsAccountDTO(
            id=r.id,
            product_code=r.product_code,
            term_months=int(r.term_months),
            monthly_amount=int(r.monthly_amount or 0),
            interest_rate=r.interest_rate,
            opened_at=r.opened_at,
            maturity_date=r.maturity_date,
            status=str(r.status.value) if hasattr(r.status, "value") else str(r.status),
        )
        for r in rows
    ]
    return SavingsAccountsResponse(success=True, data=data, message=None)
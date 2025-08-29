# app/accounts/schemas.py

from pydantic import BaseModel, Field
from datetime import datetime, date
from decimal import Decimal

# 응답: 최소한의 정보만 DTO로 제공 (원하면 확장)
class AccountDTO(BaseModel):
    account_no: str
    balance: Decimal | None = None

# 요청: userId만 받음
class CreateDemandDepositAccountRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=64)

class CreateDemandDepositAccountResponse(BaseModel):
    success: bool = True
    data: AccountDTO | None = None
    message: str | None = None

# 적금 계좌 생성 요청/응답
class CreateSavingsAccountRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=64)
    deposit_balance: int = Field(..., ge=1)


class CreateSavingsAccountResponse(BaseModel):
    success: bool = True
    data: AccountDTO | None = None
    message: str | None = None

# 수시입출금 계좌 목록 응답
class DemandDepositAccountsResponse(BaseModel):
    success: bool = True
    data: list[AccountDTO] = []
    message: str | None = None


# 적금 계좌 단건 DTO (모델 구조에 맞춰 최소 필드만 노출)
class SavingsAccountDTO(BaseModel):
    id: str
    product_code: str
    term_months: int
    monthly_amount: int
    interest_rate: Decimal
    opened_at: datetime
    maturity_date: date | None = None
    status: str

class SavingsAccountsResponse(BaseModel):
    success: bool = True
    data: list[SavingsAccountDTO] = []
    message: str | None = None
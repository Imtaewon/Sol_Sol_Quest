# app/accounts/schemas.py

from pydantic import BaseModel, Field

# 응답: 최소한의 정보만 DTO로 제공 (원하면 확장)
class AccountDTO(BaseModel):
    account_no: str

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
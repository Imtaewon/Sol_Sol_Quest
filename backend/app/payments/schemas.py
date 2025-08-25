# app/payments/schemas.py
from pydantic import BaseModel, Field

class QrPayRequest(BaseModel):
    merchant_id: str
    order_id: str
    amount: int = Field(ge=0)
    currency: str = "KRW"
    ts: int
    endpoint: str

class QrPayResponse(BaseModel):
    success: bool
    payment_id: str
    message: str

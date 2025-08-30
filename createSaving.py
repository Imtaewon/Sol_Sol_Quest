# savings_product.py
import httpx
from datetime import datetime, timedelta, timezone
import uuid

# ---- API 설정 ----
BASE_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/savings/createProduct"
API_NAME = "createProduct"

# 제공된 키 그대로 사용 (이 API는 userKey 헤더에 넣지 않습니다)
API_KEY = "15fb3d5c23c94e4f9782a33a97b04645"

# ---- 시간 유틸 (Windows tzdata 이슈 대비 폴백 포함) ----
def _now_kr():
    try:
        from zoneinfo import ZoneInfo  # Python 3.9+
        return datetime.now(ZoneInfo("Asia/Seoul"))
    except Exception:
        KST = timezone(timedelta(hours=9))
        return datetime.now(KST)

def _unique_no(dt: datetime) -> str:
    # YYYYMMDDHHMMSS + 임의 6자리
    return dt.strftime("%Y%m%d%H%M%S") + str(uuid.uuid4().int)[-6:]

def make_header():
    now = _now_kr()
    return {
        "apiName": API_NAME,
        "transmissionDate": now.strftime("%Y%m%d"),
        "transmissionTime": now.strftime("%H%M%S"),
        "institutionCode": "00100",
        "fintechAppNo": "001",
        "apiServiceCode": API_NAME,
        "institutionTransactionUniqueNo": _unique_no(now),
        "apiKey": API_KEY,
        # userKey 제외!
    }

# ---- 메인 호출 함수: 적금상품 등록 ----
async def create_savings_product(
    bank_code: str,
    account_name: str,
    subscription_period: str,
    min_balance: int,
    max_balance: int,
    interest_rate: float,
    account_description: str | None = None,
    rate_description: str | None = None,
):
    headers = {"Content-Type": "application/json"}

    payload = {
        "Header": make_header(),
        "bankCode": bank_code,                          # 예: "088" (신한은행)
        "accountName": account_name,                    # 예: "7일 적금"
        "accountDescription": account_description or "",# 설명 (선택)
        "subscriptionPeriod": subscription_period,      # "7" (일 단위 or 문자열)
        "minSubscriptionBalance": str(min_balance),     # 최소금액 (원)
        "maxSubscriptionBalance": str(max_balance),     # 최대금액 (원)
        "interestRate": str(interest_rate),             # 금리 (%)
        "rateDescription": rate_description or "",      # 금리 설명 (선택)
    }

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(BASE_URL, json=payload, headers=headers)
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError:
            print("== Response status ==", resp.status_code)
            print("== Response body ==")
            print(resp.text)
            raise
        return resp.json()

# ---- 단독 실행 테스트 ----
if __name__ == "__main__":
    import anyio
    async def _test():
        result = await create_savings_product(
            bank_code="088",
            account_name="쏠쏠한 적금 상품",
            subscription_period="180",
            min_balance=10000,
            max_balance=200000,
            interest_rate=10.0,
            account_description="퀘스트 완료하면 우대금리를 제공하는 상품입니다.",
            rate_description="티어별로 다른 금리를 제공합니다.",
        )
        print(result)

    anyio.run(_test)

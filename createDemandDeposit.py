# bankcode.py
import httpx
from datetime import datetime, timedelta, timezone
import uuid

# ---- API 설정 ----
BASE_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/createDemandDeposit"
API_NAME = "createDemandDeposit"

# 제공된 키 그대로 사용 (이 API는 userKey 헤더에 넣지 않습니다)
API_KEY = "15fb3d5c23c94e4f9782a33a97b04645"

# ---- 시간 유틸 (Windows tzdata 이슈 대비 폴백 포함) ----
def _now_kr():
    try:
        from zoneinfo import ZoneInfo  # Python 3.9+
        return datetime.now(ZoneInfo("Asia/Seoul"))
    except Exception:
        # tzdata 미설치 Windows 환경 폴백: UTC+9 고정
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

# ---- 메인 호출 함수: 수시입출금 상품 등록 ----
async def create_demand_deposit_product():
    headers = {"Content-Type": "application/json"}

    payload = {
        "Header": make_header(),
        "bankCode": "088",  # 신한은행
        "accountName": "신한은행 수시입출금 상품",
        "accountDescription": "신한은행 수시입출금 상품",
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
    result = anyio.run(create_demand_deposit_product)
    print(result)

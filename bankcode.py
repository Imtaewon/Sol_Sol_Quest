# bankcode.py
import httpx
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid

BASE_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/bank/inquireBankCodes"

# 제공된 키 그대로 사용 (단, 이 API는 userKey를 헤더에 넣지 않습니다!)
API_KEY = "15fb3d5c23c94e4f9782a33a97b04645"
# USER_KEY = "642fcbe5-4955-4f3f-b07c-bfed6df7c9ba"  # ❌ 이 API에서는 사용 안 함

def _now_kr():
    return datetime.now(ZoneInfo("Asia/Seoul"))

def _unique_no(dt: datetime) -> str:
    # YYYYMMDDHHMMSS + 6자리 일련번호
    return dt.strftime("%Y%m%d%H%M%S") + str(uuid.uuid4().int)[-6:]

def make_header():
    now = _now_kr()
    return {
        "apiName": "inquireBankCodes",
        "transmissionDate": now.strftime("%Y%m%d"),
        "transmissionTime": now.strftime("%H%M%S"),
        "institutionCode": "00100",
        "fintechAppNo": "001",
        "apiServiceCode": "inquireBankCodes",
        "institutionTransactionUniqueNo": _unique_no(now),
        "apiKey": API_KEY,
        # "userKey": USER_KEY,  # ❌ 넣으면 400
    }

async def inquire_bank_codes():
    headers = {"Content-Type": "application/json"}
    payload = {"Header": make_header()}

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(BASE_URL, json=payload, headers=headers)
        # 디버깅을 위해 실패 시 본문도 출력
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as e:
            print("== Response text ==")
            print(resp.text)
            raise
        return resp.json()

# 단독 실행 테스트
if __name__ == "__main__":
    import anyio
    result = anyio.run(inquire_bank_codes)
    print(result)

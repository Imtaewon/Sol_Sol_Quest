import httpx
from datetime import datetime
from zoneinfo import ZoneInfo
import uuid

API_KEY = "15fb3d5c23c94e4f9782a33a97b04645"
BASE_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu"

# 수시 입출금 상품 accountTypeUniqueNo
DEPOSIT_ACCOUNT_UNIQUE_NO = "088-1-265cb9baa69c45"

# 적금 상품 accountTypeUniqueNo
SAVINGS_ACCOUNT_UNIQUE_NO = "088-3-833ca6d906884e"

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
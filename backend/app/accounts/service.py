# app/accounts/service.py

from datetime import datetime, timedelta, timezone, date
import uuid
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from decimal import Decimal
from math import ceil

from app.ENV import API_KEY as apiKey, DEPOSIT_ACCOUNT_UNIQUE_NO, SAVINGS_ACCOUNT_UNIQUE_NO  # <-- 고정값 사용
from app.models import User, InstallmentSavingsAccount
import app.models as models
from app.models import User, InstallmentSavingsAccount, SchoolLeaderboard, Quest, QuestAttempt, QuestAttemptStatusEnum, PeriodScopeEnum
from app.accounts.schemas import DepositToDemandDepositRequest, DepositToDemandDepositResponse, DepositResultDTO


BASE_URL = "https://finopenapi.ssafy.io/ssafy/api/v1/edu/"
DEPOSIT_CREATE_URL = BASE_URL+"demandDeposit/createDemandDepositAccount"
DEPOSIT_CREATE_API_NAME  = "createDemandDepositAccount"
DEPOSIT_API_NAME = "updateDemandDepositAccountDeposit"
DEPOSIT_URL = BASE_URL+"/demandDeposit/updateDemandDepositAccountDeposit"
SAVINGS_CREATE_URL = BASE_URL+"savings/createAccount"
SAVINGS_API_NAME   = "createAccount"
INST_CODE = "00100"
FIN_APPNO = "001"

def _now_kst():
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("Asia/Seoul"))
    except Exception:
        return datetime.now(timezone(timedelta(hours=9)))

def _unique_no(dt: datetime) -> str:
    # YYYYMMDDHHMMSS + 6자리
    return dt.strftime("%Y%m%d%H%M%S") + str(uuid.uuid4().int)[-6:]

# ssafy 공통 헤더
def _build_header(user_key: str, api_name: str) -> dict:
    now = _now_kst()
    return {
        "apiName": api_name,
        "transmissionDate": now.strftime("%Y%m%d"),
        "transmissionTime": now.strftime("%H%M%S"),
        "institutionCode": INST_CODE,
        "fintechAppNo": FIN_APPNO,
        "apiServiceCode": api_name,
        "institutionTransactionUniqueNo": _unique_no(now),
        "apiKey": apiKey,
        "userKey": user_key,
    }

# 성공 여부 확인
def _ensure_success(body: dict, *, default_fail_msg: str) -> dict:
    # Header.responseCode 가 H0000 이면 성공
    code = (
        body.get("Header", {}).get("responseCode")
        or body.get("rsp_code") or body.get("rspCode") or body.get("code") or ""
    )
    ok = str(code).strip().upper() in {"H0000", "0000", "SUCCESS", "0"}
    if not ok:
        msg = (
            body.get("Header", {}).get("responseMessage")
            or body.get("rsp_msg") or body.get("message") or default_fail_msg
        )
        raise ValueError(f"[외부API] {msg}")
    # 데이터 컨테이너(REC 우선) 반환
    return body.get("REC") or body


def _resolve_account_model():
    # 모델은 수정하지 않으므로, 존재하는 것으로만 시도
    for name in ("DemandDepositAccount", "Account", "BankAccount"):
        m = getattr(models, name, None)
        if m is not None:
            return m
    return None

def _gen_id_26():
    # 26자 문자열 PK가 일반적이라면 이렇게 생성 (ULID/KSUID 유틸 있으면 교체)
    return uuid.uuid4().hex[:26]

# ORM 모델에 계좌 정보 삽입
def _insert_account_orm(db: Session, user_id: str, account_no: str):
    AccountModel = _resolve_account_model()
    if not AccountModel:
        return False

    entity = AccountModel()
    # 존재하는 필드에만 안전하게 대입
    for k, v in (
        ("id", _gen_id_26()),
        ("user_id", user_id),
        ("account_no", account_no),
        ("balance", 0),
        ("opened_at", _now_kst()),

    ):
        if hasattr(entity, k) and v is not None:
            setattr(entity, k, v)

    db.add(entity)
    db.commit()
    return True

# SQL로 계좌 정보 삽입
def _insert_account_sql(db, user_id, account_no):
    ins = text("""
        INSERT INTO demand_deposit_accounts (id, user_id, account_no, opened_at)
        VALUES (:id, :user_id, :account_no, :opened_at)
    """)
    db.execute(ins, {
        "id": _gen_id_26(),
        "user_id": user_id,
        "account_no": str(account_no).strip(),
        "opened_at": _now_kst(),
    })
    db.commit()

    return True

# 수시입출금 계좌 생성
async def create_demand_deposit_account(*, db: Session, user_id: str, timeout: float = 10.0) -> dict:
    # 1) user 조회 및 userKey 확보
    user: User | None = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("유효하지 않은 userId 입니다.")

    user_key = getattr(user, "user_key", None) or getattr(user, "external_user_key", None) or getattr(user, "ssafy_user_key", None)
    if not user_key:
        raise ValueError("해당 사용자에 userKey가 없습니다. 먼저 userKey를 발급/저장하세요.")

    # 2) 고정 DEPOSIT_ACCOUNT_UNIQUE_NO 사용
    payload = {
        "Header": _build_header(user_key, DEPOSIT_CREATE_API_NAME),
        "accountTypeUniqueNo": DEPOSIT_ACCOUNT_UNIQUE_NO,
    }

    # 3) 외부 API 호출
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(DEPOSIT_CREATE_URL, json=payload, headers={"Content-Type": "application/json"})
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError:
            # 디버깅 도움
            print("== DEMAND_DEPOSIT_03 FAILED ==")
            print("status:", resp.status_code)
            print(resp.text)
            raise
        body = resp.json()

    # 4) 성공 판정 및 accountNo 추출
    # (기존) rsp_code/ok/account_no 블록 전부 지우고 ↓ 로 교체
    rec = _ensure_success(body, default_fail_msg="계좌 생성 실패")
    account_no = rec.get("accountNo") or rec.get("account_number") or body.get("accountNo")
    if not account_no:
        raise ValueError("[외부API] 응답에 accountNo가 없습니다.")


    # 5) DB 저장: 우선 ORM → 실패 시 raw SQL 백업
    try:
        saved = _insert_account_orm(db, user_id, account_no)
        if not saved:
            _insert_account_sql(db, user_id, account_no)
    except IntegrityError:
        db.rollback()
        # 이미 동일 계좌가 있을 수 있음: 비즈니스 정책에 따라 무시/에러 택1
        # 여기서는 무시하고 진행
    except Exception as e:
        db.rollback()
        raise RuntimeError(f"[DB] 저장 실패: {e}")

    # 6) 호출자에게 필요한 최소 DTO 반환
    return {
        "account_no": account_no
    }


# 기존: 수시입출금 계좌번호만 반환 → id와 번호를 같이 반환하도록 헬퍼 추가
def _get_latest_dd_account(db, user_id):
    row = db.execute(text("""
        SELECT id, account_no
        FROM demand_deposit_accounts
        WHERE user_id = :uid
        ORDER BY opened_at DESC
        LIMIT 1
    """), {"uid": user_id}).fetchone()
    if not row: return None
    rid = getattr(row, "id", None)  or (row[0] if len(row) > 0 else None)
    rno = getattr(row, "account_no", None) or (row[1] if len(row) > 1 else None)
    return {"id": rid, "account_no": rno}


# YYYYMMDD 형식 문자열을 date 객체로 변환 (실패 시 None)
def _parse_date_yyyymmdd(s: str | None) -> date | None:
    if not s:
        return None
    s = str(s).strip()
    try:
        return datetime.strptime(s, "%Y%m%d").date()
    except Exception:
        return None

# 구독 기간(개월 수)로 변환
def _to_term_months(subscription_period: str | int | None) -> int:
    """
    명세상 subscription_period는 문자열(일 단위)로 내려올 수 있음.
    안전하게 ceil(일/30) 로 월 환산(최소 1개월).
    """
    if subscription_period is None:
        return 1
    try:
        days = int(str(subscription_period).strip())
        return max(1, ceil(days / 30))
    except Exception:
        return 1

# --- 적금 계좌 생성 (영속화 포함, 퀘스트 클리어) ---
async def create_savings_account(*, db: Session, user_id: str, deposit_balance: int, timeout: float = 10.0) -> dict:
    # 1) 사용자 및 userKey 확보
    user: User | None = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("유효하지 않은 userId 입니다.")

    user_key = getattr(user, "user_key", None) or getattr(user, "external_user_key", None)
    if not user_key:
        raise ValueError("해당 사용자에 userKey가 없습니다. 먼저 userKey를 발급/저장하세요.")

    # 2) 출금(수시) 계좌 확보 (id + account_no)
    dd = _get_latest_dd_account(db, user_id)
    if not dd or not dd.get("account_no"):
        raise ValueError("해당 사용자에 연결된 수시입출금 계좌가 없습니다.")
    withdrawal_account_no = dd["account_no"]
    linked_dd_account_id = dd["id"]

    # 가입 전, 사용자 활성 적금 보유 여부 체크
    had_active_before = (
        db.query(InstallmentSavingsAccount)
          .filter(
              InstallmentSavingsAccount.user_id == user_id,
              InstallmentSavingsAccount.status == "active",
          )
          .count() > 0
    )

    # 3) 고정 상품고유번호 + 헤더 구성
    payload = {
        "Header": _build_header(user_key, SAVINGS_API_NAME),
        "withdrawalAccountNo": withdrawal_account_no,
        "accountTypeUniqueNo": SAVINGS_ACCOUNT_UNIQUE_NO,
        "depositBalance": str(deposit_balance),
    }

    # 4) 외부 API 호출
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(SAVINGS_CREATE_URL, json=payload, headers={"Content-Type": "application/json"})
        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError:
            print("== SAVINGS_03 FAILED ==")
            print("status:", resp.status_code)
            print(resp.text)
            raise
        body = resp.json()

    # 5) 성공 여부/계좌번호 추출
    # (기존) rsp_code/ok/rec/savings_no 블록 전부 지우고 ↓ 로 교체
    rec = _ensure_success(body, default_fail_msg="적금계좌 생성 실패")
    savings_no = rec.get("savingsAccountNo") or rec.get("accountNo") or body.get("savingsAccountNo")
    if not savings_no:
        raise ValueError("[외부API] 응답에 적금 계좌번호가 없습니다.")


    # ---- ⬇ DB에 installment_savings_accounts 저장 ----
    # 파싱/보정
    subscription_period = rec.get("subscription_period") or rec.get("subscriptionPeriod")
    term_months = _to_term_months(subscription_period)

    # 금리
    try:
        ir = Decimal(str(rec.get("interestRate"))) if rec.get("interestRate") is not None else Decimal("0")
    except Exception:
        ir = Decimal("0")

    # 개설일/만기일
    opened_d = _parse_date_yyyymmdd(rec.get("accountCreateDate"))
    expiry_d = _parse_date_yyyymmdd(rec.get("accountExpiryDate"))
    opened_dt = datetime.combine(opened_d, datetime.min.time()) if opened_d else _now_kst()

    # 엔티티 생성
    isa = InstallmentSavingsAccount(
        id=_gen_id_26(),
        user_id=user_id,
        product_code=SAVINGS_ACCOUNT_UNIQUE_NO,         # 상품 코드로 고정값 사용
        linked_dd_account_id=linked_dd_account_id,
        term_months=term_months,
        monthly_amount=Decimal(str(deposit_balance)),   # 요청의 가입금액(원)
        interest_rate=ir,                               # 약정 금리
        opened_at=opened_dt,
        maturity_date=expiry_d,                         # None 가능 (모델이 허용)
        status="active",
    )

    try:
        db.add(isa)
        db.commit()
        # db.refresh(isa)  # 필요 시

        # 적금 가입 직후: 학교 리더보드 업데이트
        # → 기존에 '활성 적금'이 없던 유저가 처음 활성 상태가 되면 +1
        if user.school_id and not had_active_before:
            lb = _ensure_school_lb(db, user.school_id)
            lb.savings_students = int(lb.savings_students or 0) + 1
            _recalc_avg(lb)  # avg_exp = total_exp / savings_students
            db.add(lb)
            db.commit()
        
         # ---- ✅ 적금 개설 성공 시: quest_daily_016 → quest_attempt에 CLEAR 삽입 ----
        q = (
            db.query(Quest)
              .filter(Quest.id == "quest_daily_016", Quest.active == True)
              .first()
        )
        if q:
            now = _now_kst()
            qa = QuestAttempt(
                id=_gen_id_26(),
                quest_id=q.id,
                user_id=user_id,
                status=QuestAttemptStatusEnum.CLEAR,          # ← 요구사항
                progress_count=q.target_count or 1,
                target_count=q.target_count or 1,
                proof_url=None,
                period_scope=q.period_scope or PeriodScopeEnum.ANY,
                period_key="-",
                started_at=now,
                submitted_at=now,
                approved_at=None,                              # CLEAR 단계
            )
            db.add(qa)
            db.commit()
        # ---------------------------------------------------------------

    except Exception as e:
        db.rollback()
        raise RuntimeError(f"[DB] 적금계좌 저장 실패: {e}")

    # 호출자에게는 기존과 동일하게 계좌번호 반환 (라우터/DTO 변경 없음)
    return {"account_no": savings_no, "raw": body}


# 학교 리더보드 보장
def _ensure_school_lb(db: Session, school_id: str) -> SchoolLeaderboard:
    """
    school_leaderboard row가 없으면 생성해서 반환.
    """
    lb = (
        db.query(SchoolLeaderboard)
          .filter(SchoolLeaderboard.school_id == school_id)
          .first()
    )
    if not lb:
        lb = SchoolLeaderboard(
            school_id=school_id,
            savings_students=0,
            total_exp=0,
            avg_exp=0,
        )
        db.add(lb)
        db.flush()
    return lb

# 평균 경험치 재계산
def _recalc_avg(lb: SchoolLeaderboard) -> None:
    s = int(lb.savings_students or 0)
    t = int(lb.total_exp or 0)
    lb.avg_exp = (Decimal(t) / Decimal(s)) if s > 0 else Decimal("0")

# 수시입출금 계좌 입금
async def deposit_to_demand_deposit_with_ssafy(
    db: Session,
    me: User,
    req: DepositToDemandDepositRequest,
    timeout: float = 10.0,
) -> DepositToDemandDepositResponse:
    # 0) 권한/소유 검증
    if me.id != req.user_id:
        raise HTTPException(status_code=403, detail="본인 계좌에만 입금할 수 있습니다.")

    # 1) 계좌 확인(+ 잠금)
    account: models.DemandDepositAccount | None = (
        db.query(models.DemandDepositAccount)
          .filter(
              models.DemandDepositAccount.user_id == req.user_id,
              models.DemandDepositAccount.account_no == req.account_no,
          )
          .with_for_update(nowait=False)
          .first()
    )
    if not account:
        return DepositToDemandDepositResponse(success=False, message="계좌를 찾을 수 없습니다.", data=None)

    # 2) userKey 확보
    user_key = getattr(me, "user_key", None) or getattr(me, "external_user_key", None)
    if not user_key:
        return DepositToDemandDepositResponse(success=False, message="userKey가 없습니다.", data=None)

    # 3) SSAFY 요청 바디(예제처럼 Header 포함한 랩핑 JSON)
    header = _build_header(user_key=user_key, api_name=DEPOSIT_API_NAME)

    # Long 정수만 허용 → 문자열로 전달(예제와 동일 포맷)
    try:
        amt_int = int(Decimal(req.amount))
    except Exception:
        return DepositToDemandDepositResponse(success=False, message="amount는 정수여야 합니다.", data=None)

    payload = {
        "Header": header,
        "accountNo": req.account_no,
        "transactionBalance": str(amt_int),
        "transactionSummary": "(수시입출금) : 입금",
    }

    # 4) 외부 호출
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(DEPOSIT_URL, json=payload)
            resp.raise_for_status()
            # 응답 스펙이 불명확 → 본 구현은 성공 코드만 확인하고 DB 반영
            # 필요 시 resp.json()에서 afterBalance 등 키를 파싱하여 사용 가능
    except httpx.HTTPStatusError as e:
        # 외부 에러 메시지 포워딩
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        return DepositToDemandDepositResponse(
            success=False,
            message=f"입금 실패: {detail}",
            data=None,
        )
    except Exception as e:
        return DepositToDemandDepositResponse(success=False, message=f"입금 실패: {e}", data=None)

    # 5) DB balance 반영(최소 구현: 기존 + amount)
    current = Decimal(account.balance or 0)
    account.balance = current + Decimal(amt_int)
    db.add(account)
    db.commit()
    db.refresh(account)

    return DepositToDemandDepositResponse(
        success=True,
        message="입금이 완료되었습니다.",
        data=DepositResultDTO(
            account_no=account.account_no,
            balance=Decimal(account.balance),
            amount=Decimal(amt_int),
        ),
    )
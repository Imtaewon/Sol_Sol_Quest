from sqlalchemy import (
    Column, String, Integer, SmallInteger, Boolean,
    DateTime, Date, DECIMAL, Text, ForeignKey, Enum as SQLEnum, BigInteger
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from sqlalchemy.dialects.mysql import TINYINT  # grade: TINYINT UNSIGNED

Base = declarative_base()

# ---------- Enums ----------

class UserGenderEnum(str, Enum):
    M = "M"
    F = "F"
    X = "X" 

class UserRoleEnum(str, Enum):
    GUEST = "guest"
    MEMBER = "member"
    ADMIN = "admin"

class TierNameEnum(str, Enum):
    BASIC = "BASIC"
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    SOL = "SOL"

class QuestTypeEnum(str, Enum):
    LIFE = "life"
    GROWTH = "growth"
    SURPRISE = "surprise"

class QuestVerifyMethodEnum(str, Enum):
    GPS = "GPS"
    STEPS = "STEPS"
    LINK = "LINK"
    UPLOAD = "UPLOAD"
    PAYMENT = "PAYMENT"
    ATTENDANCE = "ATTENDANCE"
    CERTIFICATION = "CERTIFICATION"
    CONTEST = "CONTEST"

class QuestCategoryEnum(str, Enum):
    STUDY = "STUDY"
    HEALTH = "HEALTH"
    ECON = "ECON"
    LIFE = "LIFE"
    ENT = "ENT"
    SAVING = "SAVING"

class PeriodScopeEnum(str, Enum):
    ANY = "any"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class QuestAttemptStatusEnum(str, Enum):
    DEACTIVE = "deactive"
    IN_PROGRESS = "in_progress"
    CLEAR = "clear"
    SUBMITTED = "submitted"
    APPROVED = "approved"

class TransactionDirectionEnum(str, Enum):
    CREDIT = "credit"
    DEBIT = "debit"

class TransactionAccountTypeEnum(str, Enum):
    DEMAND = "DEMAND"
    SAVINGS = "SAVINGS"

class TransferStatusEnum(str, Enum):
    REQUESTED = "requested"
    SUCCESS = "success"
    FAILED = "failed"

class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"

class RecoInteractionEventEnum(str, Enum):
    IMPRESSION = "impression"
    DETAIL_CLICK = "detail_click"
    START = "start"
    COMPLETE = "complete"


# ---------- Identity ----------

class School(Base):
    __tablename__ = "schools"

    id = Column(String(26), primary_key=True)                # ULID
    code = Column(String(50), unique=True, nullable=False)   # HONGIK
    name = Column(String(255), nullable=False)               # 홍익대학교
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    users = relationship("User", back_populates="school")
    school_leaderboard = relationship("SchoolLeaderboard", back_populates="school", uselist=False)


class SchoolLeaderboard(Base):
    __tablename__ = "school_leaderboard"

    id = Column(String(26), primary_key=True)                     # ULID
    school_id = Column(String(26), ForeignKey("schools.id"), nullable=False)
    savings_students = Column(Integer, nullable=False, default=0)
    total_exp = Column(BigInteger, nullable=False, default=0)     # 누적 EXP 합
    avg_exp = Column(DECIMAL(12, 2), nullable=False, default=0)   # 평균 EXP
    rank_overall = Column(Integer)
    rank_avg = Column(Integer)
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())

    school = relationship("School", back_populates="school_leaderboard")


class User(Base):
    __tablename__ = "users"

    id = Column(String(26), primary_key=True)                  # ULID
    username = Column(String(64))                               # 금융 API username(@ 앞)
    login_id = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)              # hash only
    email = Column(String(320), unique=True, nullable=False)
    real_name = Column(String(50), nullable=False)
    gender = Column(SQLEnum(UserGenderEnum))
    birth_year = Column(SmallInteger)
    school_id = Column(String(26), ForeignKey("schools.id"))
    department = Column(String(100))
    grade = Column(TINYINT(unsigned=True))                      # TINYINT UNSIGNED
    role = Column(SQLEnum(UserRoleEnum), nullable=False, default=UserRoleEnum.MEMBER)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())

    school = relationship("School", back_populates="users")
    user_stats = relationship("UserStat", back_populates="user", uselist=False)
    quest_attempts = relationship("QuestAttempt", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    survey_answers = relationship("SurveyAnswer", back_populates="user")
    quest_recommendations = relationship("QuestRecommendation", back_populates="user")
    quest_interactions = relationship("QuestRecoInteraction", back_populates="user")


# ---------- Gamification ----------

class Tier(Base):
    __tablename__ = "tiers"

    name = Column(SQLEnum(TierNameEnum), primary_key=True)        # BASIC/BRONZE/...
    required_exp = Column(Integer, nullable=False)
    interest_rate = Column(DECIMAL(4, 2), nullable=False)         # 우대금리(%)


class UserStat(Base):
    __tablename__ = "user_stats"

    user_id = Column(String(26), ForeignKey("users.id"), primary_key=True)
    total_exp = Column(Integer, nullable=False, default=0)
    current_tier = Column(
        SQLEnum(TierNameEnum),
        ForeignKey("tiers.name"),
        nullable=False,
        default=TierNameEnum.BASIC,
    )
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())

    user = relationship("User", back_populates="user_stats")


# ---------- Quests ----------

class Quest(Base):
    __tablename__ = "quests"

    id = Column(String(26), primary_key=True)
    type = Column(SQLEnum(QuestTypeEnum), nullable=False)         # life/growth/surprise
    title = Column(String(255), nullable=False)
    category = Column(SQLEnum(QuestCategoryEnum), nullable=False)
    verify_method = Column(SQLEnum(QuestVerifyMethodEnum), nullable=False)
    verify_params = Column(Text)                                   # JSON 문자열
    reward_exp = Column(Integer, nullable=False, default=0)
    target_count = Column(Integer, nullable=False, default=1)
    period_scope = Column(SQLEnum(PeriodScopeEnum), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    lat = Column(DECIMAL(10, 6))
    lng = Column(DECIMAL(10, 6))
    quest_link_url = Column(String(2048))                          # 링크형 퀘스트용
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    quest_attempts = relationship("QuestAttempt", back_populates="quest")
    quest_recommendations = relationship("QuestRecommendation", back_populates="quest")
    quest_interactions = relationship("QuestRecoInteraction", back_populates="quest")


class QuestAttempt(Base):
    __tablename__ = "quest_attempts"

    id = Column(String(26), primary_key=True)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(QuestAttemptStatusEnum), nullable=False, default=QuestAttemptStatusEnum.IN_PROGRESS)
    progress_count = Column(Integer, nullable=False, default=0)
    target_count = Column(Integer, nullable=False, default=1)
    proof_url = Column(String(1024))
    period_scope = Column(SQLEnum(PeriodScopeEnum), nullable=False)
    period_key = Column(String(32), nullable=False)               # '-', 'YYYY-MM-DD' 등
    started_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    submitted_at = Column(DateTime)
    approved_at = Column(DateTime)

    quest = relationship("Quest", back_populates="quest_attempts")
    user = relationship("User", back_populates="quest_attempts")


# ---------- Recommendations / Logging ----------

class QuestRecommendation(Base):
    __tablename__ = "quest_recommendations"

    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    recommendation_date = Column(Date, nullable=False)            # YYYY-MM-DD
    is_click = Column(Boolean, nullable=False, default=False)     # 당일 클릭 여부
    is_cleared = Column(Boolean, nullable=False, default=False)   # 기한 내 완료/보상 수락 여부

    user = relationship("User", back_populates="quest_recommendations")
    quest = relationship("Quest", back_populates="quest_recommendations")


class QuestRecoInteraction(Base):
    __tablename__ = "quest_reco_interactions"

    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    event = Column(SQLEnum(RecoInteractionEventEnum), nullable=False)
    context = Column(Text)                                        # {"slot":"home_top","ab":"B"} 등
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    user = relationship("User", back_populates="quest_interactions")
    quest = relationship("Quest", back_populates="quest_interactions")


# ---------- Commerce ----------

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(26), primary_key=True)
    store_name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)                  # CAFE 등
    url = Column(String(200), nullable=False)                      # 매장/주문 URL
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    payments = relationship("Payment", back_populates="merchant")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    merchant_id = Column(String(26), ForeignKey("merchants.id"), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    status = Column(SQLEnum(PaymentStatusEnum), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    user = relationship("User", back_populates="payments")
    merchant = relationship("Merchant", back_populates="payments")


# ---------- Accounts ----------

class DemandDepositAccount(Base):
    __tablename__ = "demand_deposit_accounts"

    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    account_no = Column(String(32))                                # 예: 110-1234-****-5678
    balance = Column(DECIMAL(14, 0), nullable=False, default=0)
    opened_at = Column(DateTime, nullable=True)                    # NULL 허용
    closed_at = Column(DateTime)

    user = relationship("User")
    installment_savings = relationship("InstallmentSavingsAccount", back_populates="linked_dd_account")
    from_transfers = relationship("Transfer", foreign_keys="Transfer.from_dd_account_id", back_populates="from_account")


class InstallmentSavingsAccount(Base):
    __tablename__ = "installment_savings_accounts"

    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    product_code = Column(String(50), nullable=False)
    linked_dd_account_id = Column(String(26), ForeignKey("demand_deposit_accounts.id"))
    term_months = Column(SmallInteger, nullable=False)             # 기간(개월)
    monthly_amount = Column(DECIMAL(12, 0), nullable=False)
    interest_rate = Column(DECIMAL(5, 2), nullable=False)
    opened_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    maturity_date = Column(Date, nullable=False)
    status = Column(SQLEnum("active", "matured", "closed", name="installment_savings_status"), nullable=False, default="active")

    user = relationship("User")
    linked_dd_account = relationship("DemandDepositAccount", back_populates="installment_savings")
    to_transfers = relationship("Transfer", back_populates="to_account")


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(26), primary_key=True)
    from_dd_account_id = Column(String(26), ForeignKey("demand_deposit_accounts.id"), nullable=False)
    to_savings_account_id = Column(String(26), ForeignKey("installment_savings_accounts.id"), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    status = Column(SQLEnum(TransferStatusEnum), nullable=False, default=TransferStatusEnum.SUCCESS)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    from_account = relationship("DemandDepositAccount", back_populates="from_transfers")
    to_account = relationship("InstallmentSavingsAccount", back_populates="to_transfers")


class AccountTransaction(Base):
    __tablename__ = "account_transactions"

    id = Column(String(26), primary_key=True)
    account_type = Column(SQLEnum(TransactionAccountTypeEnum), nullable=False)  # DEMAND/SAVINGS
    account_id = Column(String(26), nullable=False)
    direction = Column(SQLEnum(TransactionDirectionEnum), nullable=False)       # credit/debit
    amount = Column(DECIMAL(12, 0), nullable=False)
    balance_after = Column(DECIMAL(14, 0))
    related_payment_id = Column(String(26))
    memo = Column(String(255))
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())


# ---------- Survey (Onboarding) ----------

class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id = Column(String(26), primary_key=True)
    order_no = Column(Integer, nullable=False)                     # 1~N
    question = Column(String(1000), nullable=False)
    question_type = Column(Integer, nullable=False)                # 카테고리 번호(1~6 등)

    answers = relationship("SurveyAnswer", back_populates="question")


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"

    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    question_id = Column(String(26), ForeignKey("survey_questions.id"), nullable=False)
    question_type = Column(Integer, nullable=False)                # 당시 카테고리 번호
    option_id = Column(String(26))                                 # 객관식 선택지 식별자(없을 수 있음)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    user = relationship("User", back_populates="survey_answers")
    question = relationship("SurveyQuestion", back_populates="answers")


# 데이터베이스 세션을 위한 유틸리티

def get_db_url(
    username: str = "quest_user",
    password: str = "questpass123",
    host: str = "15.165.185.135",
    port: int = 3306,
    database: str = "quest_db"
) -> str:
    """MySQL 데이터베이스 연결 URL 생성"""
    return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"

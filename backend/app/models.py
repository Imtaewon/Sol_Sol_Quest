from sqlalchemy import (
    Column, String, Integer, SmallInteger, Boolean, UniqueConstraint,
    DateTime, Date, DECIMAL, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from sqlalchemy.dialects.mysql import TINYINT, BIGINT
# 주의: 이 모델은 'quest_db (1).sql'의 MySQL 스키마와 1:1 대응하도록 작성되었습니다.

Base = declarative_base()

# ---------- DB 연결 URL ----------
def get_db_url(
    username: str = "quest_user",
    password: str = "questpass123",
    host: str = "127.0.0.1",     # phpMyAdmin(로컬) 기준 기본값
    port: int = 3306,
    database: str = "quest_db"
) -> str:
    return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"


# ---------- Enums (DB 저장 문자열과 정확히 일치) ----------
class UserGenderEnum(str, Enum):
    M = "M"
    F = "F"
    X = "X"

class UserRoleEnum(str, Enum):
    GUEST = "GUEST"
    MEMBER = "MEMBER"
    ADMIN = "ADMIN"

class TierNameEnum(str, Enum):
    BASIC = "BASIC"
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    SOL = "SOL"

class QuestTypeEnum(str, Enum):
    LIFE = "LIFE"
    GROWTH = "GROWTH"
    SURPRISE = "SURPRISE"

class QuestCategoryEnum(str, Enum):
    STUDY = "STUDY"
    HEALTH = "HEALTH"
    ECON = "ECON"
    LIFE = "LIFE"
    ENT = "ENT"
    SAVING = "SAVING"

class QuestVerifyMethodEnum(str, Enum):
    GPS = "GPS"
    STEPS = "STEPS"
    LINK = "LINK"
    UPLOAD = "UPLOAD"
    PAYMENT = "PAYMENT"
    ATTENDANCE = "ATTENDANCE"
    CERTIFICATION = "CERTIFICATION"
    CONTEST = "CONTEST"
    QUIZ = "QUIZ"

class PeriodScopeEnum(str, Enum):
    ANY = "ANY"
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"

class QuestAttemptStatusEnum(str, Enum):
    DEACTIVE = "DEACTIVE"
    IN_PROGRESS = "IN_PROGRESS"
    CLEAR = "CLEAR"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"

class AccountTypeEnum(str, Enum):
    DEMAND = "DEMAND"
    SAVINGS = "SAVINGS"

class TransactionDirectionEnum(str, Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"

# 주의: 적금계좌 상태는 스키마가 소문자('active','matured','closed')
class SavingsAccountStatusEnum(str, Enum):
    active = "active"
    matured = "matured"
    closed = "closed"

class TransferStatusEnum(str, Enum):
    REQUESTED = "REQUESTED"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class PaymentStatusEnum(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"

class RecoInteractionEventEnum(str, Enum):
    IMPRESSION = "IMPRESSION"
    DETAIL_CLICK = "DETAIL_CLICK"
    START = "START"
    COMPLETE = "COMPLETE"


# ---------- Identity ----------
class School(Base):
    __tablename__ = "schools"
    id = Column(String(26), primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)

    users = relationship("User", back_populates="school")
    leaderboard_rows = relationship("SchoolLeaderboard", back_populates="school")


class User(Base):
    __tablename__ = "users"
    id = Column(String(26), primary_key=True)
    username = Column(String(64))
    login_id = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(320), unique=True, nullable=False)
    real_name = Column(String(50), nullable=False)
    gender = Column(SQLEnum(UserGenderEnum))
    birth_year = Column(SmallInteger)
    school_id = Column(String(26), ForeignKey("schools.id"))
    department = Column(String(100))
    grade = Column(TINYINT(unsigned=True))  # MySQL: TINYINT UNSIGNED
    role = Column(SQLEnum(UserRoleEnum), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())
    user_key = Column(String(60), unique=True, nullable=False)

    school = relationship("School", back_populates="users")
    user_stats = relationship("UserStats", back_populates="user", uselist=False)
    dd_accounts = relationship("DemandDepositAccount", back_populates="user")
    savings_accounts = relationship("InstallmentSavingsAccount", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    quest_attempts = relationship("QuestAttempt", back_populates="user")
    quest_recos = relationship("QuestRecommendation", back_populates="user")
    reco_interactions = relationship("QuestRecoInteraction", back_populates="user")
    attendances = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    survey_answers = relationship("SurveyAnswer", back_populates="user")


class Tier(Base):
    __tablename__ = "tiers"
    name = Column(SQLEnum(TierNameEnum), primary_key=True)
    required_exp = Column(Integer, nullable=False)
    interest_rate = Column(DECIMAL(4, 2), nullable=False)

    user_stats_rows = relationship("UserStats", back_populates="tier")


class UserStats(Base):
    __tablename__ = "user_stats"
    user_id = Column(String(26), ForeignKey("users.id"), primary_key=True)
    total_exp = Column(Integer, nullable=False, default=0)
    current_tier = Column(SQLEnum(TierNameEnum), ForeignKey("tiers.name"), nullable=False)
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp())

    user = relationship("User", back_populates="user_stats")
    tier = relationship("Tier", back_populates="user_stats_rows")


# ---------- Quests ----------
class Quest(Base):
    __tablename__ = "quests"
    id = Column(String(26), primary_key=True)
    type = Column(SQLEnum(QuestTypeEnum), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(SQLEnum(QuestCategoryEnum), nullable=False)
    verify_method = Column(SQLEnum(QuestVerifyMethodEnum), nullable=False)
    verify_params = Column(Text)
    reward_exp = Column(Integer, nullable=False)
    target_count = Column(Integer, nullable=False)
    period_scope = Column(SQLEnum(PeriodScopeEnum), nullable=False)
    active = Column(Boolean, nullable=False)
    lat = Column(DECIMAL(10, 6))
    lng = Column(DECIMAL(10, 6))
    quest_link_url = Column(String(2048))

    attempts = relationship("QuestAttempt", back_populates="quest")
    recos = relationship("QuestRecommendation", back_populates="quest")
    reco_interactions = relationship("QuestRecoInteraction", back_populates="quest")


class QuestAttempt(Base):
    __tablename__ = "quest_attempts"
    id = Column(String(26), primary_key=True)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(QuestAttemptStatusEnum), nullable=False)
    progress_count = Column(Integer, nullable=False)
    target_count = Column(Integer, nullable=False)
    proof_url = Column(String(1024))
    period_scope = Column(SQLEnum(PeriodScopeEnum), nullable=False)
    period_key = Column(String(32), nullable=False)
    started_at = Column(DateTime, nullable=False)
    submitted_at = Column(DateTime)
    approved_at = Column(DateTime)

    quest = relationship("Quest", back_populates="attempts")
    user = relationship("User", back_populates="quest_attempts")


class QuestRecommendation(Base):
    __tablename__ = "quest_recommendations"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    recommendation_date = Column(Date, nullable=False)
    is_click = Column(Boolean, nullable=False)
    is_cleared = Column(Boolean, nullable=False)

    user = relationship("User", back_populates="quest_recos")
    quest = relationship("Quest", back_populates="recos")


class QuestRecoInteraction(Base):
    __tablename__ = "quest_reco_interactions"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    event = Column(SQLEnum(RecoInteractionEventEnum), nullable=False)
    context = Column(Text)
    created_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="reco_interactions")
    quest = relationship("Quest", back_populates="reco_interactions")


# ---------- Finance ----------
class DemandDepositAccount(Base):
    __tablename__ = "demand_deposit_accounts"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    account_no = Column(String(32))
    balance = Column(DECIMAL(14, 0), nullable=False)
    opened_at = Column(DateTime)
    closed_at = Column(DateTime)

    user = relationship("User", back_populates="dd_accounts")
    outgoing_transfers = relationship("Transfer",
                                     foreign_keys="Transfer.from_dd_account_id",
                                     back_populates="from_dd_account")
    incoming_links = relationship("InstallmentSavingsAccount",
                                  foreign_keys="InstallmentSavingsAccount.linked_dd_account_id",
                                  back_populates="linked_dd_account")


class InstallmentSavingsAccount(Base):
    __tablename__ = "installment_savings_accounts"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    product_code = Column(String(50), nullable=False)
    linked_dd_account_id = Column(String(26), ForeignKey("demand_deposit_accounts.id"))
    term_months = Column(SmallInteger, nullable=False)
    monthly_amount = Column(DECIMAL(12, 0), nullable=False)
    interest_rate = Column(DECIMAL(5, 2), nullable=False)
    opened_at = Column(DateTime, nullable=False)
    maturity_date = Column(Date, nullable=False)
    status = Column(SQLEnum(SavingsAccountStatusEnum), nullable=False)  # 'active','matured','closed'

    user = relationship("User", back_populates="savings_accounts")
    linked_dd_account = relationship("DemandDepositAccount", back_populates="incoming_links")
    incoming_transfers = relationship("Transfer",
                                     foreign_keys="Transfer.to_savings_account_id",
                                     back_populates="to_savings_account")


class Merchant(Base):
    __tablename__ = "merchants"
    id = Column(String(26), primary_key=True)
    store_name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    url = Column(String(200), nullable=False)

    payments = relationship("Payment", back_populates="merchant")


class Payment(Base):
    __tablename__ = "payments"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    merchant_id = Column(String(26), ForeignKey("merchants.id"), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    status = Column(SQLEnum(PaymentStatusEnum), nullable=False)
    created_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="payments")
    merchant = relationship("Merchant", back_populates="payments")
    # account_transactions.related_payment_id 는 FK가 아님(스키마 기준). 편의상 관계는 생략.


class AccountTransaction(Base):
    __tablename__ = "account_transactions"
    id = Column(String(26), primary_key=True)
    account_type = Column(SQLEnum(AccountTypeEnum), nullable=False)
    account_id = Column(String(26), nullable=False)
    direction = Column(SQLEnum(TransactionDirectionEnum), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    balance_after = Column(DECIMAL(14, 0))
    related_payment_id = Column(String(26))
    memo = Column(String(255))
    created_at = Column(DateTime, nullable=False)


class Transfer(Base):
    __tablename__ = "transfers"
    id = Column(String(26), primary_key=True)
    from_dd_account_id = Column(String(26), ForeignKey("demand_deposit_accounts.id"), nullable=False)
    to_savings_account_id = Column(String(26), ForeignKey("installment_savings_accounts.id"), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    status = Column(SQLEnum(TransferStatusEnum), nullable=False)
    created_at = Column(DateTime, nullable=False)

    from_dd_account = relationship("DemandDepositAccount", back_populates="outgoing_transfers",
                                   foreign_keys=[from_dd_account_id])
    to_savings_account = relationship("InstallmentSavingsAccount", back_populates="incoming_transfers",
                                      foreign_keys=[to_savings_account_id])


# ---------- Attendance ----------
class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    is_attend = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uniq_user_date"),
    )

    user = relationship("User", back_populates="attendances")


# ---------- Survey ----------
class SurveyQuestion(Base):
    __tablename__ = "survey_questions"
    id = Column(String(26), primary_key=True)
    order_no = Column(Integer, nullable=False)
    question = Column(String(1000), nullable=False)
    question_type = Column(Integer, nullable=False)

    options = relationship("SurveyQuestionOption", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("SurveyAnswer", back_populates="question")


class SurveyQuestionOption(Base):
    __tablename__ = "survey_question_options"
    id = Column(String(26), primary_key=True)
    question_id = Column(String(26), ForeignKey("survey_questions.id"), nullable=False)
    order_no = Column(Integer, nullable=False)
    option_text = Column(String(1000), nullable=False)

    question = relationship("SurveyQuestion", back_populates="options")
    answers = relationship("SurveyAnswer", back_populates="option")


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    question_id = Column(String(26), ForeignKey("survey_questions.id"), nullable=False)
    question_type = Column(Integer, nullable=False)
    option_order_no = Column(Integer, nullable=True)
    option_id = Column(String(26), ForeignKey("survey_question_options.id"))
    created_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="survey_answers")
    question = relationship("SurveyQuestion", back_populates="answers")
    option = relationship("SurveyQuestionOption", back_populates="answers")


# ---------- School Leaderboard ----------
class SchoolLeaderboard(Base):
    __tablename__ = "school_leaderboard"
    id = Column(String(26), primary_key=True)
    school_id = Column(String(26), ForeignKey("schools.id"), nullable=False)
    savings_students = Column(Integer, nullable=False)
    total_exp = Column(BIGINT, nullable=False)                  # MySQL BIGINT
    avg_exp = Column(DECIMAL(12, 2), nullable=False)
    rank_overall = Column(Integer)                              # NULL 허용
    rank_avg = Column(Integer)                                  # NULL 허용
    updated_at = Column(DateTime, nullable=False)

    school = relationship("School", back_populates="leaderboard_rows")

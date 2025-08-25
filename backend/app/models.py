from sqlalchemy import (
    Column, String, Integer, SmallInteger, Boolean, 
    DateTime, Date, DECIMAL, Text, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
from datetime import datetime
import enum

Base = declarative_base()

# Enum 정의
class UserGenderEnum(str, Enum):
    M = "M"
    F = "F"
    X = "X"

class UserRoleEnum(str, Enum):
    GUEST = "guest"
    MEMBER = "member"
    ADMIN = "admin"

class TierNameEnum(str, Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    SOL = "SOL"

class QuestTypeEnum(str, Enum):
    DAILY = "daily"
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
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    APPROVED = "approved"

class AccountStatusEnum(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"
    MATURED = "matured"

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

class SurveyQuestionTypeEnum(str, Enum):
    SINGLE = "single"
    MULTI = "multi"
    SCALE = "scale"
    TEXT = "text"

class RecoInteractionEventEnum(str, Enum):
    IMPRESSION = "impression"
    DETAIL_CLICK = "detail_click"
    START = "start"
    COMPLETE = "complete"

class ProgressEventSourceEnum(str, Enum):
    PAYMENT = "payment"
    STEPS = "steps"
    GPS = "gps"
    LINK = "link"
    UPLOAD = "upload"


# 모델 정의
class School(Base):
    __tablename__ = "schools"
    
    id = Column(String(26), primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    users = relationship("User", back_populates="school")
    donation_totals = relationship("SchoolDonationTotal", back_populates="school")


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(26), primary_key=True)
    login_id = Column(String(50), unique=True)
    password_hash = Column(String(255))
    email = Column(String(320), unique=True)
    real_name = Column(String(50), nullable=False)
    gender = Column(SQLEnum(UserGenderEnum))
    birth_year = Column(SmallInteger)
    role = Column(SQLEnum(UserRoleEnum), nullable=False)
    school_id = Column(String(26), ForeignKey("schools.id"))
    department = Column(String(100))
    grade = Column(SmallInteger)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    school = relationship("School", back_populates="users")
    user_stats = relationship("UserStat", back_populates="user", uselist=False)
    quest_attempts = relationship("QuestAttempt", back_populates="user")
    exp_logs = relationship("ExpLog", back_populates="user")
    interest_accruals = relationship("InterestAccrual", back_populates="user")
    demand_accounts = relationship("DemandDepositAccount", back_populates="user")
    savings_accounts = relationship("InstallmentSavingsAccount", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    survey_responses = relationship("SurveyResponse", back_populates="user")
    quest_recommendations = relationship("QuestRecommendation", back_populates="user")
    quest_interactions = relationship("QuestRecoInteraction", back_populates="user")


class Merchant(Base):
    __tablename__ = "merchants"
    
    id = Column(String(26), primary_key=True)
    store_name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    product_name = Column(String(200), nullable=False)
    product_price = Column(DECIMAL(12, 0), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    payments = relationship("Payment", back_populates="merchant")


class Tier(Base):
    __tablename__ = "tiers"
    
    name = Column(SQLEnum(TierNameEnum), primary_key=True)
    required_exp = Column(Integer, nullable=False)
    interest_rate = Column(DECIMAL(4, 2), nullable=False)


class UserStat(Base):
    __tablename__ = "user_stats"
    
    user_id = Column(String(26), ForeignKey("users.id"), primary_key=True)
    total_exp = Column(Integer, nullable=False, default=0)
    current_tier = Column(SQLEnum(TierNameEnum), nullable=False, default=TierNameEnum.BRONZE)
    updated_at = Column(DateTime, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="user_stats")


class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(String(26), primary_key=True)
    type = Column(SQLEnum(QuestTypeEnum), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    verify_method = Column(SQLEnum(QuestVerifyMethodEnum))
    category = Column(SQLEnum(QuestCategoryEnum))
    verify_params = Column(Text)
    reward_exp = Column(Integer, nullable=False, default=0)
    target_count = Column(Integer)
    period_scope = Column(SQLEnum(PeriodScopeEnum), nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    quest_attempts = relationship("QuestAttempt", back_populates="quest")
    quest_recommendations = relationship("QuestRecommendation", back_populates="quest")
    quest_interactions = relationship("QuestRecoInteraction", back_populates="quest")


class QuestAttempt(Base):
    __tablename__ = "quest_attempts"
    
    id = Column(String(26), primary_key=True)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(QuestAttemptStatusEnum), nullable=False)
    progress_count = Column(Integer, nullable=False, default=0)
    target_count = Column(Integer)
    proof_url = Column(String(1024))
    period_scope = Column(SQLEnum(PeriodScopeEnum), nullable=False)
    period_key = Column(String(32), nullable=False)
    started_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    submitted_at = Column(DateTime)
    approved_at = Column(DateTime)
    
    # Relationships
    quest = relationship("Quest", back_populates="quest_attempts")
    user = relationship("User", back_populates="quest_attempts")
    progress_events = relationship("QuestProgressEvent", back_populates="attempt")


class ExpLog(Base):
    __tablename__ = "exp_logs"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    source = Column(String(32), nullable=False)
    ref_id = Column(String(26), nullable=False)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="exp_logs")


class InterestAccrual(Base):
    __tablename__ = "interest_accruals"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    period = Column(String(7), nullable=False)
    interest_amount = Column(DECIMAL(12, 0), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="interest_accruals")


class SchoolDonationTotal(Base):
    __tablename__ = "school_donation_totals"
    
    id = Column(String(26), primary_key=True)
    school_id = Column(String(26), ForeignKey("schools.id"), nullable=False)
    period = Column(String(7), nullable=False)
    donation_amount = Column(DECIMAL(12, 0), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    school = relationship("School", back_populates="donation_totals")


class DemandDepositAccount(Base):
    __tablename__ = "demand_deposit_accounts"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    account_no = Column(String(32))
    alias = Column(String(50))
    balance = Column(DECIMAL(14, 0), nullable=False, default=0)
    status = Column(SQLEnum(AccountStatusEnum), nullable=False, default=AccountStatusEnum.ACTIVE)
    opened_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    closed_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="demand_accounts")
    linked_savings = relationship("InstallmentSavingsAccount", back_populates="linked_dd_account")
    from_transfers = relationship("Transfer", foreign_keys="Transfer.from_dd_account_id", back_populates="from_account")


class InstallmentSavingsAccount(Base):
    __tablename__ = "installment_savings_accounts"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    product_code = Column(String(50), nullable=False)
    linked_dd_account_id = Column(String(26), ForeignKey("demand_deposit_accounts.id"))
    term_months = Column(SmallInteger, nullable=False)
    monthly_amount = Column(DECIMAL(12, 0), nullable=False)
    interest_rate = Column(DECIMAL(5, 2), nullable=False)
    opened_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    maturity_date = Column(Date)
    status = Column(SQLEnum(AccountStatusEnum), nullable=False, default=AccountStatusEnum.ACTIVE)
    
    # Relationships
    user = relationship("User", back_populates="savings_accounts")
    linked_dd_account = relationship("DemandDepositAccount", back_populates="linked_savings")
    to_transfers = relationship("Transfer", back_populates="to_account")


class AccountTransaction(Base):
    __tablename__ = "account_transactions"
    
    id = Column(String(26), primary_key=True)
    account_type = Column(SQLEnum(TransactionAccountTypeEnum), nullable=False)
    account_id = Column(String(26), nullable=False)
    direction = Column(SQLEnum(TransactionDirectionEnum), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    balance_after = Column(DECIMAL(14, 0))
    related_payment_id = Column(String(26))
    memo = Column(String(255))
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())


class Transfer(Base):
    __tablename__ = "transfers"
    
    id = Column(String(26), primary_key=True)
    from_dd_account_id = Column(String(26), ForeignKey("demand_deposit_accounts.id"), nullable=False)
    to_savings_account_id = Column(String(26), ForeignKey("installment_savings_accounts.id"), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    status = Column(SQLEnum(TransferStatusEnum), nullable=False, default=TransferStatusEnum.SUCCESS)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    from_account = relationship("DemandDepositAccount", back_populates="from_transfers")
    to_account = relationship("InstallmentSavingsAccount", back_populates="to_transfers")


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    merchant_id = Column(String(26), ForeignKey("merchants.id"), nullable=False)
    amount = Column(DECIMAL(12, 0), nullable=False)
    status = Column(SQLEnum(PaymentStatusEnum), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="payments")
    merchant = relationship("Merchant", back_populates="payments")


class Survey(Base):
    __tablename__ = "surveys"
    
    id = Column(String(26), primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    version = Column(Integer, nullable=False, default=1)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    questions = relationship("SurveyQuestion", back_populates="survey")
    responses = relationship("SurveyResponse", back_populates="survey")


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"
    
    id = Column(String(26), primary_key=True)
    survey_id = Column(String(26), ForeignKey("surveys.id"), nullable=False)
    order_no = Column(Integer, nullable=False)
    q_type = Column(SQLEnum(SurveyQuestionTypeEnum), nullable=False)
    question = Column(String(1000), nullable=False)
    
    # Relationships
    survey = relationship("Survey", back_populates="questions")
    options = relationship("SurveyOption", back_populates="question")
    answers = relationship("SurveyAnswer", back_populates="question")


class SurveyOption(Base):
    __tablename__ = "survey_options"
    
    id = Column(String(26), primary_key=True)
    question_id = Column(String(26), ForeignKey("survey_questions.id"), nullable=False)
    order_no = Column(Integer, nullable=False)
    opt_text = Column(String(1000), nullable=False)
    opt_value = Column(String(100))
    
    # Relationships
    question = relationship("SurveyQuestion", back_populates="options")
    answers = relationship("SurveyAnswer", back_populates="option")


class SurveyResponse(Base):
    __tablename__ = "survey_responses"
    
    id = Column(String(26), primary_key=True)
    survey_id = Column(String(26), ForeignKey("surveys.id"), nullable=False)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    submitted_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    survey = relationship("Survey", back_populates="responses")
    user = relationship("User", back_populates="survey_responses")
    answers = relationship("SurveyAnswer", back_populates="response")


class SurveyAnswer(Base):
    __tablename__ = "survey_answers"
    
    id = Column(String(26), primary_key=True)
    response_id = Column(String(26), ForeignKey("survey_responses.id"), nullable=False)
    question_id = Column(String(26), ForeignKey("survey_questions.id"), nullable=False)
    option_id = Column(String(26), ForeignKey("survey_options.id"))
    value_text = Column(String(2000))
    value_number = Column(DECIMAL(12, 4))
    
    # Relationships
    response = relationship("SurveyResponse", back_populates="answers")
    question = relationship("SurveyQuestion", back_populates="answers")
    option = relationship("SurveyOption", back_populates="answers")


class QuestRecommendation(Base):
    __tablename__ = "quest_recommendations"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    score = Column(DECIMAL(6, 3), nullable=False, default=0)
    reasons = Column(Text)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    recommendation_date = Column(Date, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="quest_recommendations")
    quest = relationship("Quest", back_populates="quest_recommendations")


class QuestRecoInteraction(Base):
    __tablename__ = "quest_reco_interactions"
    
    id = Column(String(26), primary_key=True)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=False)
    quest_id = Column(String(26), ForeignKey("quests.id"), nullable=False)
    event = Column(SQLEnum(RecoInteractionEventEnum), nullable=False)
    context = Column(Text)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="quest_interactions")
    quest = relationship("Quest", back_populates="quest_interactions")


class QuestProgressEvent(Base):
    __tablename__ = "quest_progress_events"
    
    id = Column(String(26), primary_key=True)
    attempt_id = Column(String(26), ForeignKey("quest_attempts.id"), nullable=False)
    source = Column(SQLEnum(ProgressEventSourceEnum), nullable=False)
    ref_id = Column(String(26), nullable=False)
    amount = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=func.current_timestamp())
    
    # Relationships
    attempt = relationship("QuestAttempt", back_populates="progress_events")


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
# app/auth/models.py
from sqlalchemy import Integer, String, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.auth.schemas import GenderEnum

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
    )

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    gender: Mapped[GenderEnum | None] = mapped_column(SAEnum(GenderEnum, native_enum=True))
    grade: Mapped[int | None] = mapped_column(Integer)
    university_code: Mapped[str] = mapped_column(String(50), nullable=False)
    university_name: Mapped[str] = mapped_column(String(100), nullable=False)
    major: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_pw: Mapped[str] = mapped_column(String(255), nullable=False)
    current_tier: Mapped[str] = mapped_column(String(20), default="BRONZE")
    total_exp: Mapped[int] = mapped_column(Integer, default=0)

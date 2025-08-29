# app/universities/schemas.py
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

class UniversityItem(BaseModel):
    university_code: str
    university_name: str
    model_config = ConfigDict(from_attributes=True)

class UniversityLeaderboardItem(BaseModel):
    university_code: str
    university_name: str
    total_exp: int
    avg_exp: float
    rank_overall: int | None = None
    rank_avg: int | None = None
    is_mine: bool = False

class UniversityLeaderboardResponse(BaseModel):
    my_university: Optional[UniversityLeaderboardItem] = None
    top10_overall: list[UniversityLeaderboardItem]
    top10_avg: list[UniversityLeaderboardItem]

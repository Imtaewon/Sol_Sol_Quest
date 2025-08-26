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
    savings_students: int
    total_exp: int
    avg_exp: Decimal
    rank_overall: Optional[int] = None
    rank_avg: None

class UniversityLeaderboardResponse(BaseModel):
    my_university: Optional[UniversityLeaderboardItem] = None
    top10_overall: list[UniversityLeaderboardItem]
    top10_avg: list[UniversityLeaderboardItem]

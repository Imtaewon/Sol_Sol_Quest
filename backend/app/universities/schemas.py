# app/universities/schemas.py
from pydantic import BaseModel, ConfigDict

class UniversityItem(BaseModel):
    university_code: str
    university_name: str

    model_config = ConfigDict(from_attributes=True)

# backend/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date

# ------------------
# Transakcje
# ------------------
class TransactionBase(BaseModel):
    title: str
    amount: float
    start_date: date
    is_income: bool
    frequency: str = "once"  # 'once', 'monthly', 'weekly' etc.
    end_date: Optional[date] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
# ------------------
# Cele
# ------------------
class SubGoalBase(BaseModel):
    title: str
    target_amount: float

class SubGoalCreate(SubGoalBase):
    pass

class SubGoalOut(SubGoalBase):
    id: int
    goal_id: int

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    title: str
    target_amount: float

class GoalCreate(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int
    owner_id: int
    subgoals: List[SubGoalOut] = []

    class Config:
        from_attributes = True

# ------------------
# Użytkownicy i auth
# ------------------
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    initial_balance: float = 0.0

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

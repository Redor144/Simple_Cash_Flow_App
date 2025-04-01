# backend/models.py
from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    username = Column(String, nullable=True)
    initial_balance = Column(Float, default=0.0)

    transactions = relationship("Transaction", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    amount = Column(Float)
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)  # dla cyklicznej, jeśli ma ograniczenie w czasie
    is_income = Column(Boolean, default=False)  # True = przychód, False = wydatek
    frequency = Column(String, nullable=True)   # np. "monthly", "once", "weekly", itp.

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    target_amount = Column(Float, default=0.0)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="goals")

    subgoals = relationship("SubGoal", back_populates="parent_goal")

class SubGoal(Base):
    __tablename__ = "subgoals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    target_amount = Column(Float, default=0.0)

    goal_id = Column(Integer, ForeignKey("goals.id"))
    parent_goal = relationship("Goal", back_populates="subgoals")

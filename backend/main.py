# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import date, timedelta, datetime
from typing import List

from . import models, schemas, auth
from .database import SessionLocal, engine, Base
from jose import JWTError, jwt

from fastapi.middleware.cors import CORSMiddleware

# Inicjalizacja bazy
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS - zezwolenie np. na połączenie z frontendu (http://localhost:3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Funkcja pomocnicza: aktualny użytkownik
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nieprawidłowy token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# ------------------------------------------
# Rejestracja
# ------------------------------------------
@app.post("/register", response_model=schemas.UserOut)
def register_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Sprawdzamy, czy email już istnieje
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Użytkownik o takim e-mail już istnieje")
    # Hash hasła
    hashed_pw = auth.get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        hashed_password=hashed_pw,
        username=user_data.username,
        initial_balance=user_data.initial_balance
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ------------------------------------------
# Logowanie -> token
# ------------------------------------------
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Nieprawidłowe dane logowania")
    if not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Nieprawidłowe dane logowania")

    # Tworzymy JWT
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ------------------------------------------
# Pobranie danych bieżącego użytkownika
# ------------------------------------------
@app.get("/me", response_model=schemas.UserOut)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ------------------------------------------
# Transakcje
# ------------------------------------------
@app.post("/transactions", response_model=schemas.TransactionOut)
def create_transaction(
    transaction_data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_tr = models.Transaction(
        title=transaction_data.title,
        amount=transaction_data.amount,
        is_income=transaction_data.is_income,
        frequency=transaction_data.frequency,
        start_date=transaction_data.start_date,
        end_date=transaction_data.end_date,
        owner_id=current_user.id
    )
    db.add(new_tr)
    db.commit()
    db.refresh(new_tr)
    return new_tr

@app.get("/transactions", response_model=List[schemas.TransactionOut])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    trs = db.query(models.Transaction).filter(models.Transaction.owner_id == current_user.id).all()
    return trs

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tr = db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.owner_id == current_user.id
    ).first()
    if not tr:
        raise HTTPException(status_code=404, detail="Transakcja nie znaleziona")
    db.delete(tr)
    db.commit()
    return {"detail": "Usunięto transakcję"}

# ------------------------------------------
# Cele i podcele
# ------------------------------------------
@app.post("/goals", response_model=schemas.GoalOut)
def create_goal(
    goal_data: schemas.GoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_goal = models.Goal(
        title=goal_data.title,
        target_amount=goal_data.target_amount,
        owner_id=current_user.id
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@app.get("/goals", response_model=List[schemas.GoalOut])
def list_goals(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    goals = db.query(models.Goal).filter(models.Goal.owner_id == current_user.id).all()
    return goals

@app.post("/goals/{goal_id}/subgoals", response_model=schemas.SubGoalOut)
def create_subgoal(
    goal_id: int,
    subgoal_data: schemas.SubGoalCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # sprawdzenie czy goal należy do usera
    goal = db.query(models.Goal).filter(
        models.Goal.id == goal_id,
        models.Goal.owner_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Cel nie znaleziony")

    subgoal = models.SubGoal(
        title=subgoal_data.title,
        target_amount=subgoal_data.target_amount,
        goal_id=goal.id
    )
    db.add(subgoal)
    db.commit()
    db.refresh(subgoal)
    return subgoal

# ------------------------------------------
# Prosta prognoza - cashflow
# ------------------------------------------
@app.get("/cashflow")
def get_cashflow(
    months_ahead: int = 6,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Zwraca listę (data -> saldo prognozowane).
    Dla uproszczenia: liczymy od dziś co miesiąc, uwzględniając transakcje cykliczne (monthly).
    """
    today = date.today()
    balance = current_user.initial_balance  # punkt startowy
    result = []
    
    # Pobierz wszystkie transakcje usera
    all_transactions = db.query(models.Transaction).filter(models.Transaction.owner_id == current_user.id).all()

    # Funkcja pomocnicza do sprawdzania, czy w danym miesiącu występuje transakcja
    def transaction_occurs(tr: models.Transaction, check_date: date):
        # jeśli jednorazowa ('once'), to sprawdzamy tylko czy check_date to start_date (miesiąc/rok)
        # uproszczenie: bierzemy 1. dzień miesiąca
        if tr.frequency == "once":
            return (tr.start_date.year == check_date.year) and (tr.start_date.month == check_date.month)
        elif tr.frequency == "monthly":
            # czy check_date jest >= start_date i (opcjonalnie) <= end_date
            if tr.start_date <= check_date:
                if tr.end_date is not None and check_date > tr.end_date:
                    return False
                # w monthly występuje co miesiąc 
                # sprawdź, czy minęło min. tyle miesięcy
                # uproszczenie: jeżeli check_date >= start_date, to transakcja występuje w tym miesiącu
                return True
            return False
        elif tr.frequency == "weekly":
            # dla uproszczenia – w cashflow miesięcznym – liczymy, że 4x w miesiącu (bardzo prosto)
            if tr.start_date <= check_date:
                if tr.end_date and check_date > tr.end_date:
                    return False
                return True
            return False
        # Można dodać inne rodzaje 
        return False

    # Generujemy x kolejnych miesięcy (począwszy od 1. dnia kolejnego miesiąca)
    current_month = date(today.year, today.month, 1)
    for i in range(months_ahead + 1):
        # zbieramy wszystkie transakcje występujące w tym miesiącu
        monthly_trans = [t for t in all_transactions if transaction_occurs(t, current_month)]

        # dodajemy do salda sumę (przychody - wydatki)
        month_income = sum(t.amount for t in monthly_trans if t.is_income)
        month_expense = sum(t.amount for t in monthly_trans if not t.is_income)

        balance = balance + month_income - month_expense

        # zapis do wyników
        result.append({
            "date": current_month.isoformat(),
            "balance": balance
        })

        # przejście do kolejnego miesiąca
        year = current_month.year
        month = current_month.month + 1
        if month > 12:
            month = 1
            year += 1
        current_month = date(year, month, 1)

    return result

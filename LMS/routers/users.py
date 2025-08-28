from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_password_hash, get_current_user


router = APIRouter()


@router.post("/", response_model=schemas.UserOut)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter((models.User.username == user_in.username) | (models.User.email == user_in.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already exists")
    user = models.User(
        username=user_in.username,
        email=user_in.email,
        password=get_password_hash(user_in.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=schemas.UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user
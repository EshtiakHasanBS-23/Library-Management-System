# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from .. import models, schemas
# from ..database import get_db
# from ..auth import get_password_hash, get_current_user


# router = APIRouter()


# @router.post("/", response_model=schemas.UserOut)
# def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
#     if db.query(models.User).filter((models.User.username == user_in.username) | (models.User.email == user_in.email)).first():
#         raise HTTPException(status_code=400, detail="Username or email already exists")
#     user = models.User(
#         username=user_in.username,
#         email=user_in.email,
#         password=get_password_hash(user_in.password),
#         is_admin=False,
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user


# @router.get("/me", response_model=schemas.UserOut)
# def read_me(current_user=Depends(get_current_user)):
#     return current_user


# from fastapi import APIRouter, HTTPException
# from LMS.routers.auth import get_current_user,require_admin
# from fastapi import Depends

# router = APIRouter()

# # In-memory storage for testing
# users_db = [
#     {"id": 1, "username": "alice"},
#     {"id": 2, "username": "bob"}
# ]

# @router.get("/", summary="Get all users")
# def get_users():
#     return users_db

# @router.get("/{user_id}", summary="Get a single user by ID")
# def get_user(user_id: int):
#     for user in users_db:
#         if user["id"] == user_id:
#             return user
#     raise HTTPException(status_code=404, detail="User not found")

# @router.post("/", summary="Create a new user")
# def create_user(user: dict,admin=Depends(require_admin)):
#     user["id"] = len(users_db) + 1
#     users_db.append(user)
#     return user
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File,Form
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required
import os, shutil
from pathlib import Path
from uuid import uuid4

router = APIRouter(prefix="", tags=["Users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Admin: create user
@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(admin_required),  # Admin required
):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pw = pwd_context.hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


MEDIA_DIR = "media/uploads"
os.makedirs(MEDIA_DIR, exist_ok=True)
@router.put("/settings/my")
def update_settings(
    username: str = Form(None),
    email: str = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if username:
        existing_user = db.query(models.User).filter(
            models.User.username == username,
            models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = username

    if email:
        current_user.email = email

    if file is not None:
        suffix = Path(file.filename).suffix
        filename = f"user_{current_user.id}_{uuid4().hex}{suffix}"
        file_path = os.path.join(MEDIA_DIR, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        current_user.image = f"/{file_path}"

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Settings updated successfully",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "photo": current_user.image
        }
    }

@router.post("/{user_id}/image")
def upload_user_image(user_id: int,
                      file: UploadFile = File(...),
                      db: Session = Depends(get_db),
                      admin: models.User = Depends(admin_required)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    suffix = Path(file.filename).suffix
    filename = f"{uuid4().hex}{suffix}"
    file_path = os.path.join(MEDIA_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Store relative path in DB
    user.image = f"/{file_path}"
    db.commit()
    db.refresh(user)
    
    return {"image_url": user.image}
# Get all users (admin only)
@router.get("/", response_model=list[schemas.User])
def list_users(
    db: Session = Depends(get_db),
    current_user = Depends(admin_required),  # Admin required
):
    return db.query(models.User).all()
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db),current_user = Depends(admin_required)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}



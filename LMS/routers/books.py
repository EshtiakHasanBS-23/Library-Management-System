from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required
import os, shutil
from pathlib import Path
from uuid import uuid4
from typing import Optional, Union
router = APIRouter(prefix="", tags=["Books"])
@router.get("/search")
def search_books(
    q: str,
    category_id: int | None = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Book).filter(
        or_(
            models.Book.title.ilike(f"%{q}%"),
            models.Book.author.ilike(f"%{q}%"),
            models.Book.description.ilike(f"%{q}%")
        )
    )

    if category_id:
        query = query.filter(models.Book.category_id == category_id)

    return query.offset(skip).limit(limit).all()


@router.get("/", response_model=list[schemas.Book])
def get_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()


@router.get("/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book
@router.get("/all/{category_id}", response_model=list[schemas.Book])
def get_book_by_category(category_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.category_id == category_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Books not found")
    return db.query(models.Book).filter(models.Book.category_id == category_id).all()


MEDIA_DIR = "media/uploads"
os.makedirs(MEDIA_DIR, exist_ok=True)
# @router.post("/", response_model=schemas.Book)
# def create_book(book: schemas.BookCreate, file: UploadFile = File(...),db: Session = Depends(get_db),current_user = Depends(admin_required)):
#     new_book = models.Book(**book.dict())
#     suffix = Path(file.filename).suffix
#     filename = f"{uuid4().hex}{suffix}"
#     file_path = os.path.join(MEDIA_DIR, filename)
    
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
#     new_book.image = f"/{file_path}"
#     db.add(new_book)
#     db.commit()
#     db.refresh(new_book)
#     return new_book
@router.post("/", response_model=schemas.Book)
def create_book(
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(...),
    category_id: int = Form(...),
    copies: int = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    # Create book
    new_book = models.Book(
        title=title,
        author=author,
        description=description,
        category_id=category_id,
        copies=copies
    )

    # Handle image upload
    if file:
        suffix = Path(file.filename).suffix
        filename = f"{uuid4().hex}{suffix}"
        file_path = os.path.join(MEDIA_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        new_book.image = f"/{file_path}"

    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book



@router.patch("/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[Union[int, str]] = Form(None),
    copies: Optional[Union[int, str]] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required),
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Update text fields if provided
    if title is not None:
        book.title = title
    if author is not None:
        book.author = author
    if description is not None:
        book.description = description
    if category_id not in (None, "", "null"):
        book.category_id = int(category_id)
    if copies not in (None, "", "null"):
        book.copies = int(copies)

    # Helper to save uploaded files
    def save_file(file: UploadFile, folder: str):
        suffix = Path(file.filename).suffix
        filename = f"{uuid4().hex}{suffix}"
        file_path = os.path.join(folder, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/{file_path}"

    # Update files if provided
    if file:
        book.image = save_file(file, MEDIA_DIR)

    db.commit()
    db.refresh(book)
    return book



@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db),current_user = Depends(admin_required)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}

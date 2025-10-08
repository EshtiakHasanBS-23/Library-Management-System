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
from datetime import datetime


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

    books= query.offset(skip).limit(limit).all()
    return _with_category_names(books)

@router.get("/", response_model=list[schemas.Book])
def get_books(db: Session = Depends(get_db)):
    books=db.query(models.Book).all()
    return _with_category_names(books)


@router.get("/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return _with_category_name(book)


@router.get("/all/{category_id}", response_model=list[schemas.Book])
def get_book_by_category(category_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.category_id == category_id).all()
    if not book:
        raise HTTPException(status_code=404, detail="Books not found")
    return _with_category_names(book)


MEDIA_DIR = "media/uploads"
os.makedirs(MEDIA_DIR, exist_ok=True)

@router.post("/", response_model=schemas.Book)
def create_book(
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(...),
    category_name: str = Form(...),
    copies: int = Form(...),
    file: UploadFile = File(None),
    pdf: UploadFile = File(None),
    audio: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required)
):
    # Create book
    category = db.query(models.Category).filter(models.Category.name == category_name).first()
    new_book = models.Book(
        title=title,
        author=author,
        description=description,
        category_id=category.id if category else None,
        copies=copies,
        created_at=datetime.utcnow()
    )

    def save_file(file: UploadFile, folder: str):
        suffix = Path(file.filename).suffix
        filename = f"{uuid4().hex}{suffix}"
        file_path = os.path.join(folder, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/{file_path}"

    # Update files if provided
    if file:
        new_book.image = save_file(file, MEDIA_DIR)
    if pdf:
        new_book.pdf = save_file(pdf, MEDIA_DIR)
    if audio:
        new_book.audio = save_file(audio, MEDIA_DIR)

    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return _with_category_name(new_book)



@router.patch("/{book_id}", response_model=schemas.Book)
def update_book(
    book_id: int,
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category_id: Optional[Union[int, str]] = Form(None),
    copies: Optional[Union[int, str]] = Form(None),
    file: Optional[UploadFile] = File(None),
    pdf: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
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
        category = db.query(models.Category).filter(models.Category.name == category_id).first()
        book.category_id = category.id if category else None
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
    if pdf:
        book.pdf = save_file(pdf, MEDIA_DIR)
    if audio:
        book.audio = save_file(audio, MEDIA_DIR)

    db.commit()
    db.refresh(book)
    return _with_category_name(book)



@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), current_user = Depends(admin_required)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}


def _with_category_name(book: models.Book) -> schemas.Book:
    """Attach category name to a single book."""
    category_name = book.category.name if book.category else None
    return schemas.Book(
        id=book.id,
        title=book.title,
        author=book.author,
        description=book.description,
        copies=book.copies,
        category_id=book.category_id,
        category=category_name,
        created_at=book.created_at,
        image=book.image,
        pdf=book.pdf,
        audio=book.audio,
        rating=book.rating
    )


def _with_category_names(books: list[models.Book]) -> list[schemas.Book]:
    """Attach category names to multiple books."""
    return [_with_category_name(b) for b in books]
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import models, schemas
from ..database import get_db
from ..auth import require_admin
from uuid import uuid4
from pathlib import Path
import os
import shutil

router = APIRouter()

MEDIA_DIR = os.getenv("MEDIA_DIR", "static/uploads")

@router.get("/", response_model=list[schemas.BookOut])
def list_books(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = Query(50, le=100),
    category_id: int | None = None,
    q: str | None = None,
):
    query = db.query(models.Book)
    if category_id is not None:
        query = query.filter(models.Book.category_id == category_id)
    if q:
        like = f"%{q}%"
        query = query.filter(or_(models.Book.title.ilike(like), models.Book.author.ilike(like)))
    return query.offset(skip).limit(limit).all()

@router.get("/{book_id}", response_model=schemas.BookOut)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("/", response_model=schemas.BookOut)
def create_book(book_in: schemas.BookCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    book = models.Book(**book_in.dict())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

@router.put("/{book_id}", response_model=schemas.BookOut)
def update_book(book_id: int, book_in: schemas.BookUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    book = db.query(models.Book).get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    for k, v in book_in.dict(exclude_unset=True).items():
        setattr(book, k, v)
    db.commit()
    db.refresh(book)
    return book

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    book = db.query(models.Book).get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    # if there's an image file, try to remove it
    if book.image:
        try:
            # image stored as /static/uploads/filename or relative path
            path = book.image
            if path.startswith("/static/"):
                path = path.lstrip("/")
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass
    db.delete(book)
    db.commit()
    return {"ok": True}


@router.post("/{book_id}/image")
async def upload_book_image(book_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), admin=Depends(require_admin)):
    book = db.query(models.Book).get(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # ensure uploads directory exists
    os.makedirs(MEDIA_DIR, exist_ok=True)

    suffix = Path(file.filename).suffix
    filename = f"{uuid4().hex}{suffix}"
    dest_path = os.path.join(MEDIA_DIR, filename)

    # write file to disk
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # store a public URL path in DB (served under /static)
    public_path = f"/static/uploads/{filename}"
    book.image = public_path
    db.commit()
    db.refresh(book)
    return {"image_url": public_path}

# from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
# from sqlalchemy.orm import Session
# from sqlalchemy import or_
# from LMS import models, schemas
# from LMS.database import get_db
# # from ..auth import require_admin
# from uuid import uuid4
# from pathlib import Path
# import os
# import shutil

# router = APIRouter()

# MEDIA_DIR = os.getenv("MEDIA_DIR", "static/uploads")

# @router.get("/", response_model=list[schemas.BookOut])
# def list_books(
#     db: Session = Depends(get_db),
#     skip: int = 0,
#     limit: int = Query(50, le=100),
#     category_id: int | None = None,
#     q: str | None = None,
# ):
#     query = db.query(models.Book)
#     if category_id is not None:
#         query = query.filter(models.Book.category_id == category_id)
#     if q:
#         like = f"%{q}%"
#         query = query.filter(or_(models.Book.title.ilike(like), models.Book.author.ilike(like)))
#     return query.offset(skip).limit(limit).all()

# @router.get("/{book_id}", response_model=schemas.BookOut)
# def get_book(book_id: int, db: Session = Depends(get_db)):
#     book = db.query(models.Book).get(book_id)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
#     return book

# @router.post("/", response_model=schemas.BookOut)
# def create_book(book_in: schemas.BookCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
#     book = models.Book(**book_in.dict())
#     db.add(book)
#     db.commit()
#     db.refresh(book)
#     return book

# @router.put("/{book_id}", response_model=schemas.BookOut)
# def update_book(book_id: int, book_in: schemas.BookUpdate, db: Session = Depends(get_db), admin=Depends(require_admin)):
#     book = db.query(models.Book).get(book_id)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
#     for k, v in book_in.dict(exclude_unset=True).items():
#         setattr(book, k, v)
#     db.commit()
#     db.refresh(book)
#     return book

# @router.delete("/{book_id}")
# def delete_book(book_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
#     book = db.query(models.Book).get(book_id)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
#     # if there's an image file, try to remove it
#     if book.image:
#         try:
#             # image stored as /static/uploads/filename or relative path
#             path = book.image
#             if path.startswith("/static/"):
#                 path = path.lstrip("/")
#             if os.path.exists(path):
#                 os.remove(path)
#         except Exception:
#             pass
#     db.delete(book)
#     db.commit()
#     return {"ok": True}


# @router.post("/{book_id}/image")
# async def upload_book_image(book_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), admin=Depends(require_admin)):
#     book = db.query(models.Book).get(book_id)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")

#     # ensure uploads directory exists
#     os.makedirs(MEDIA_DIR, exist_ok=True)

#     suffix = Path(file.filename).suffix
#     filename = f"{uuid4().hex}{suffix}"
#     dest_path = os.path.join(MEDIA_DIR, filename)

#     # write file to disk
#     with open(dest_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     # store a public URL path in DB (served under /static)
#     public_path = f"/static/uploads/{filename}"
#     book.image = public_path
#     db.commit()
#     db.refresh(book)
#     return {"image_url": public_path}

# from fastapi import APIRouter, HTTPException, Query
# from LMS.routers.auth import get_current_user,require_admin
# from fastapi import Depends, UploadFile, File, Form
# from typing import Optional,List
# router=APIRouter()
# books_db=[]
# @router.get("/", summary="Get all books")
# def get_books(skip:int=0, limit:int=Query(50,le=100),category_id:int|None=None,q:str|None=None):
#     results=books_db
#     if category_id is not None:
#         results=[b for b in results if b["category_id"]==category_id]
#     if q is not None:
#         q_lower=q.lower()
#         results=[b for b in results if q_lower in b["title"].lower() or q_lower in b["author"].lower()]
#     return results[skip:skip+limit]
# @router.get("/{book_id}",summary="Get a single book by ID")
# def get_book(book_id:int):
#     for book in books_db:
#         if book["id"]==book_id:
#             return book
#     raise HTTPException(status_code=404,detail="Book not found")

# @router.post("/", summary="Create a new book")
# async def create_book(
#     title: str = Form(...),
#     author: str = Form(...),
#     category_id: int = Form(...),
#     file: Optional[UploadFile] = File(None),
#     admin=Depends(require_admin)):
#     book_id= len(books_db) + 1
#     image_path=None
#     if file:
#         file_location = f"media/book_{book_id}_{file.filename}"
#         with open(file_location, "wb") as f:
#             f.write(await file.read())
#         image_path = file_location

#     book = {
#         "id": book_id,
#         "title": title,
#         "author": author,
#         "category_id": category_id,
#         "available": True,
#         "image": image_path,
#     }
#     books_db.append(book)
#     return book
# @router.put("/{book_id}", summary="Update a book")
# def update_book(book_id: int, book_update: dict,admin=Depends(require_admin)):
#     for book in books_db:
#         if book["id"] == book_id:
#             book.update(book_update)
#             return book
#     raise HTTPException(status_code=404, detail="Book not found")
# @router.delete("/{book_id}",summary="Delete a book")
# def delete_book(book_id:int,admin=Depends(require_admin)):
#     for book in books_db:
#         if book["id"]==book_id:
#             books_db.remove(book)
#             return {"message":"Book deleted"}
#     raise HTTPException(status_code=404,detail="Book not found")


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/", response_model=list[schemas.Book])
def get_books(db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    return db.query(models.Book).all()


@router.get("/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post("/", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db),current_user = Depends(admin_required)):
    new_book = models.Book(**book.dict())
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db),current_user = Depends(admin_required)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}

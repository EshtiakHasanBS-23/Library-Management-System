# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List
# from .. import models, schemas, database, dependencies

# router = APIRouter(prefix="/borrows", tags=["borrows"])

# @router.post("/", response_model=schemas.BorrowOut)
# def request_borrow(borrow: schemas.BorrowCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
#     book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
#     if book.copies <= 0:
#         raise HTTPException(status_code=400, detail="No copies available")

#     borrow_entry = models.Borrow(
#         user_id=current_user.id,
#         book_id=borrow.book_id,
#         return_date=borrow.return_date,
#         status="pending"
#     )
#     db.add(borrow_entry)
#     db.commit()
#     db.refresh(borrow_entry)
#     return borrow_entry

# @router.get("/pending", response_model=List[schemas.BorrowOut])
# def list_pending_borrows(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_admin_user)):
#     pending = db.query(models.Borrow).filter(models.Borrow.status == "pending").all()
#     return pending

# @router.post("/{borrow_id}/approve", response_model=schemas.BorrowOut)
# def approve_borrow(borrow_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_admin_user)):
#     borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id).first()
#     if not borrow:
#         raise HTTPException(status_code=404, detail="Borrow record not found")
#     if borrow.status != "pending":
#         raise HTTPException(status_code=400, detail="Request already processed")

#     book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
#     if not book or book.copies <= 0:
#         raise HTTPException(status_code=400, detail="No copies available")

#     book.copies -= 1
#     borrow.status = "accepted"

#     db.add(book)
#     db.add(borrow)
#     db.commit()
#     db.refresh(borrow)
#     return borrow

# @router.post("/{borrow_id}/reject", response_model=schemas.BorrowOut)
# def reject_borrow(borrow_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_admin_user)):
#     borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id).first()
#     if not borrow:
#         raise HTTPException(status_code=404, detail="Borrow record not found")
#     if borrow.status != "pending":
#         raise HTTPException(status_code=400, detail="Request already processed")

#     borrow.status = "rejected"
#     db.add(borrow)
#     db.commit()
#     db.refresh(borrow)
#     return borrow

# @router.post("/{borrow_id}/return", response_model=schemas.BorrowOut)
# def return_book(borrow_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
#     # Find the borrow record
#     borrow = db.query(models.Borrow).filter(
#         models.Borrow.id == borrow_id,
#         models.Borrow.user_id == current_user.id,
#         models.Borrow.status == "accepted"
#     ).first()
    
#     if not borrow:
#         raise HTTPException(status_code=404, detail="Borrow record not found or not approved yet")

#     # Increment book copies
#     book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
#     if book:
#         book.copies += 1
#         db.add(book)
    
#     # Option 1: Delete borrow record after return
#     db.delete(borrow)
#     db.commit()
#     return borrow


# from fastapi import APIRouter, HTTPException
# from datetime import datetime

# router = APIRouter()

# borrows_db = []
# books_db = [
#     {"id": 1, "title": "Book One", "author": "Author A", "category_id": 1, "available": True},
#     {"id": 2, "title": "Book Two", "author": "Author B", "category_id": 2, "available": True}
# ]

# @router.get("/", summary="Get all borrow records")
# def get_borrows():
#     return borrows_db

# @router.post("/", summary="Borrow a book")
# def borrow_book(user_id: int, book_id: int, return_date: str):
#     book = next((b for b in books_db if b["id"] == book_id), None)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")

#     if not book.get("available", True):
#         raise HTTPException(status_code=400, detail="Book is not available")
    
#     borrow_record = {
#         "id": len(borrows_db) + 1,
#         "user_id": user_id,
#         "book_id": book_id,
#         "borrow_date": datetime.utcnow().isoformat(),
#         "return_date": return_date,
#         "returned_at": None,
#         "status": "borrowed"
#     }
#     borrows_db.append(borrow_record)
#     book["available"] = False
#     return borrow_record

# @router.post("/return/{borrow_id}", summary="Return a borrowed book")
# def return_book(borrow_id: int):
#     borrow_record = next((b for b in borrows_db if b["id"] == borrow_id), None)
#     if not borrow_record:
#         raise HTTPException(status_code=404, detail="Borrow record not found")
    
#     book = next((b for b in books_db if b["id"] == borrow_record["book_id"]), None)
#     if book:
#         book["available"] = True
    
#     borrow_record["returned_at"] = datetime.utcnow().isoformat()
#     borrow_record["status"] = "returned"
#     return {"message": "Book returned successfully", "borrow": borrow_record}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="", tags=["Borrows"])

@router.get("/")
def list_borrows(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Borrow).filter(models.Borrow.status=="approved").all()

@router.post("/", response_model=schemas.BorrowOut)
def borrow_book(borrow: schemas.BorrowCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    if not book or  book.copies<1:
        raise HTTPException(status_code=400, detail="Book not available")

    borrow_record = models.Borrow(
        user_id=current_user.id,
        book_id=book.id,
        borrow_date=datetime.utcnow(),
        return_date=borrow.return_date,
        status="pending"
    )
    db.add(borrow_record)
    db.commit()
    db.refresh(borrow_record)
    return borrow_record

# Admin: list all pending borrows
@router.get("/pending")
def list_pending_borrows(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Borrow).filter(models.Borrow.status=="pending").all()

# Admin: approve/reject borrow
@router.put("/{borrow_id}/status")
def update_borrow_status(borrow_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow not found")
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    borrow.status = status
    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    if status=="approved":
        book.copies-=1
    db.commit()
    db.refresh(borrow)
    db.refresh(book)
    return borrow

# User: return bookw_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id, models.Borrow.user_id==current_user.id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow not found")
    borrow.returned_at = datetime.utcnow()
    borrow.status = "returned"
    borrow.copies+=1
    db.commit()
    db.refresh(borrow)
    return borrow

@router.put("/{borrow_id}/return")
def return_book(borrow_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id, models.Borrow.user_id==current_user.id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow not found")
    borrow.returned_at = datetime.utcnow()
    borrow.status = "returned"
    book= db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    book.copies+=1
    db.commit()
    db.refresh(borrow)
    db.refresh(book)
    return borrow
@router.get("/pending/my")
def my_pending_borrows(db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
    pending_borrows = db.query(models.Borrow).filter(models.Borrow.user_id == current_user.id,models.Borrow.status == "pending").all()

    return pending_borrows

@router.get("/my")
def my_borrow_list(db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
    borrows = db.query(models.Borrow).filter(models.Borrow.user_id == current_user.id,models.Borrow.status=="approved").all()
    return borrows
@router.get("/my/history")
def my_borrow_list(db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
    borrows = db.query(models.Borrow).filter(models.Borrow.user_id == current_user.id).all()
    return borrows

@router.get("/stats")
def borrow_stats(db: Session = Depends(get_db), current_user: models.User = Depends(admin_required)):
    total_books = db.query(func.sum(models.Book.copies)).scalar() or 0

    borrowed_copies = db.query(func.count(models.Borrow.id)).filter(models.Borrow.status == "approved").scalar() or 0
    returned_copies = db.query(func.count(models.Borrow.id)).filter(models.Borrow.status == "returned").scalar() or 0
    pending_copies = db.query(func.count(models.Borrow.id)).filter(models.Borrow.status == "pending").scalar() or 0


    available_copies = total_books - borrowed_copies

    return {
        "total_copies": total_books,
        "available_copies": available_copies,
        "borrowed_copies": borrowed_copies,
        "returned_copies": returned_copies,
        "pending_copies": pending_copies,
    }

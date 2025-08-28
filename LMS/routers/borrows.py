from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, database, dependencies

router = APIRouter(prefix="/borrows", tags=["borrows"])

@router.post("/", response_model=schemas.BorrowOut)
def request_borrow(borrow: schemas.BorrowCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.copies <= 0:
        raise HTTPException(status_code=400, detail="No copies available")

    borrow_entry = models.Borrow(
        user_id=current_user.id,
        book_id=borrow.book_id,
        return_date=borrow.return_date,
        status="pending"
    )
    db.add(borrow_entry)
    db.commit()
    db.refresh(borrow_entry)
    return borrow_entry

@router.get("/pending", response_model=List[schemas.BorrowOut])
def list_pending_borrows(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_admin_user)):
    pending = db.query(models.Borrow).filter(models.Borrow.status == "pending").all()
    return pending

@router.post("/{borrow_id}/approve", response_model=schemas.BorrowOut)
def approve_borrow(borrow_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_admin_user)):
    borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    if borrow.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")

    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    if not book or book.copies <= 0:
        raise HTTPException(status_code=400, detail="No copies available")

    book.copies -= 1
    borrow.status = "accepted"

    db.add(book)
    db.add(borrow)
    db.commit()
    db.refresh(borrow)
    return borrow

@router.post("/{borrow_id}/reject", response_model=schemas.BorrowOut)
def reject_borrow(borrow_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_admin_user)):
    borrow = db.query(models.Borrow).filter(models.Borrow.id == borrow_id).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    if borrow.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")

    borrow.status = "rejected"
    db.add(borrow)
    db.commit()
    db.refresh(borrow)
    return borrow

@router.post("/{borrow_id}/return", response_model=schemas.BorrowOut)
def return_book(borrow_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Find the borrow record
    borrow = db.query(models.Borrow).filter(
        models.Borrow.id == borrow_id,
        models.Borrow.user_id == current_user.id,
        models.Borrow.status == "accepted"
    ).first()
    
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found or not approved yet")

    # Increment book copies
    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    if book:
        book.copies += 1
        db.add(book)
    
    # Option 1: Delete borrow record after return
    db.delete(borrow)
    db.commit()
    return borrow
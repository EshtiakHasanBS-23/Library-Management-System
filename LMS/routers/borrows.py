from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, and_
from sqlalchemy.orm import Session, joinedload
from datetime import datetime,timedelta
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="", tags=["Borrows"])

@router.get("/")
def list_borrows(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    borrows=(db.query(models.Borrow).options(joinedload(models.Borrow.book), 
                 joinedload(models.Borrow.user)).filter(models.Borrow.status=="approved").all())
    return [
        {
            "id": b.id,
            "user_id": b.user_id,
            "username": b.user.username,
            "email": b.user.email,
            "book_id": b.book_id,
            "book_title": b.book.title,
            "borrow_date": b.borrow_date,
            "return_date": b.return_date,
            "status": b.status,
        }
        for b in borrows
    ]

@router.post("/", response_model=schemas.BorrowOut)
def borrow_book(borrow: schemas.BorrowCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == borrow.book_id).first()
    if not book or book.copies < 1:
        raise HTTPException(status_code=400, detail="Book not available")

    
    existing = db.query(models.Borrow).filter(
        and_(
            models.Borrow.user_id == current_user.id,
            models.Borrow.book_id == book.id,
            models.Borrow.status == "pending"
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending borrow for this book")

    
    settings = db.query(models.SystemSetting).first()
    max_days = settings.borrow_day_limit if settings else 14  # default 14 days

    
    if borrow.return_date:
        max_allowed_date = datetime.utcnow() + timedelta(days=max_days)
        return_date = min(borrow.return_date.replace(tzinfo=None), max_allowed_date)
    else:
        return_date = datetime.utcnow() + timedelta(days=max_days)

    
    borrow_record = models.Borrow(
        user_id=current_user.id,
        book_id=book.id,
        borrow_date=datetime.utcnow(),
        return_date=return_date,
        status="pending"
    )
    db.add(borrow_record)
    db.commit()
    db.refresh(borrow_record)
    return {
        "id": borrow_record.id,
        "user_id": borrow_record.user_id,
        "username": current_user.username,
        "book_id": borrow_record.book_id,
        "book_title": book.title,
        "borrow_date": borrow_record.borrow_date,
        "return_date": borrow_record.return_date,
        "status": borrow_record.status,
    }

# Admin: list all pending borrows
@router.get("/pending")
def list_pending_borrows(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    borrows=(db.query(models.Borrow).options(joinedload(models.Borrow.book), 
                 joinedload(models.Borrow.user)).filter(models.Borrow.status=="pending").all())
    return [
        {
            "id": b.id,
            "user_id": b.user_id,
            "username": b.user.username,
            "book_id": b.book_id,
            "book_title": b.book.title,
            "borrow_date": b.borrow_date,
            "return_date": b.return_date,
            "status": b.status,
        }
        for b in borrows
    ]
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
# @router.get("/my/history")
# def my_borrow_list(db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
#     borrows = db.query(models.Borrow).filter(models.Borrow.user_id == current_user.id).all()
#     return borrows


@router.get("/all-history", response_model=list[schemas.BorrowOut])
def my_borrow_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(admin_required),
):
    borrows = (
        db.query(models.Borrow)
        .options(joinedload(models.Borrow.book), joinedload(models.Borrow.user))
        .filter(models.Borrow.status != "rejected")
        .all()
    )

    return [
        {
            "id": b.id,
            "user_id": b.user_id,
            "username": b.user.username,
            "book_id": b.book_id,
            "book_title": b.book.title,
            "borrow_date": b.borrow_date,
            "return_date": b.return_date,
            "returned_at": b.returned_at,
            "status": b.status,
        }
        for b in borrows
    ]


@router.get("/my/history", response_model=list[schemas.BorrowOut])
def my_borrow_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    borrows = (
        db.query(models.Borrow)
        .options(joinedload(models.Borrow.book), joinedload(models.Borrow.user))
        .filter(models.Borrow.user_id == current_user.id,models.Borrow.status != "rejected")
        .all()
    )

    return [
        {
            "id": b.id,
            "user_id": b.user_id,
            "username": b.user.username,
            "book_id": b.book_id,
            "book_title": b.book.title,
            "borrow_date": b.borrow_date,
            "return_date": b.return_date,
            "returned_at": b.returned_at,
            "status": b.status,
        }
        for b in borrows
    ]

@router.get("/stats")
def borrow_stats(db: Session = Depends(get_db), current_user: models.User = Depends(admin_required)):
    available_copies = db.query(func.sum(models.Book.copies)).scalar() or 0

    borrowed_copies = db.query(func.count(models.Borrow.id)).filter(models.Borrow.status == "approved").scalar() or 0
    returned_copies = db.query(func.count(models.Borrow.id)).filter(models.Borrow.status == "returned").scalar() or 0
    pending_copies = db.query(func.count(models.Borrow.id)).filter(models.Borrow.status == "pending").scalar() or 0


    total_books = available_copies + borrowed_copies

    return {
        "total_copies": total_books,
        "available_copies": available_copies,
        "borrowed_copies": borrowed_copies,
        "returned_copies": returned_copies,
        "pending_copies": pending_copies,
    }

@router.post("/pdf-view/{book_id}", response_model=schemas.BorrowOut)
def record_pdf_view(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = (
        db.query(models.Borrow)
        .filter(
            models.Borrow.user_id == current_user.id,
            models.Borrow.book_id == book_id,
            models.Borrow.status == "Pdf Viewed",
        )
        .first()
    )
    if existing:
        return existing 


    borrow = models.Borrow(
        user_id=current_user.id,
        book_id=book_id,
        status="Pdf Viewed",
        borrow_date=datetime.utcnow(),
    )
    db.add(borrow)
    db.commit()
    db.refresh(borrow)
    return borrow
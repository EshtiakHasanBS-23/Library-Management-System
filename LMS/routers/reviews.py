from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime   
from sqlalchemy import func
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="", tags=["Reviews"])


@router.post("/", response_model=schemas.ReviewOut)
def add_review(review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == review.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Check if user already reviewed this book
    existing_review = db.query(models.Review).filter(
        models.Review.book_id == book.id,
        models.Review.user_id == current_user.id
    ).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this book")

    # Add new review
    new_review = models.Review(
        user_id=current_user.id,
        username=current_user.username,
        book_id=book.id,
        rating=review.rating,
        comment=review.comment,
        created_at=datetime.utcnow()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Update book average rating
    avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.book_id == book.id).scalar()
    book.rating = round(avg_rating or 0, 2)
    db.commit()
    db.refresh(book)

    return new_review



# ➤ Get all reviews for a specific book
@router.get("/book/{book_id}", response_model=list[schemas.ReviewOut])
def get_reviews(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return db.query(models.Review).filter(models.Review.book_id == book_id).all()


# ➤ Get average rating + review count + breakdown
@router.get("/book/{book_id}/rating-breakdown")
def get_rating_breakdown(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    total = db.query(func.count(models.Review.id)).filter(models.Review.book_id == book_id).scalar()
    overall = db.query(func.avg(models.Review.rating)).filter(models.Review.book_id == book_id).scalar() or 0
    
    breakdown = {}
    for star in range(1, 6):
        count = db.query(func.count(models.Review.id)).filter(
            models.Review.book_id == book_id, models.Review.rating == star
        ).scalar()
        breakdown[star] = int((count / total) * 100) if total > 0 else 0
    
    return {
        "book_id": book_id,
        "total": total,
        "overall": round(overall, 1),
        "breakdown": breakdown,
        "reviews": db.query(models.Review).filter(models.Review.book_id == book_id).all()
    }

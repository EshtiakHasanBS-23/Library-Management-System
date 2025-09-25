from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="", tags=["Reviews"])

# User: add review
@router.post("/", response_model=schemas.ReviewOut)
def add_review(review: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    book = db.query(models.Book).filter(models.Book.id == review.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    new_review = models.Review(user_id=current_user.id, book_id=book.id, rating=review.rating, comment=review.comment)
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

# Get all reviews for a book
@router.get("/book/{book_id}", response_model=list[schemas.ReviewOut])
def get_reviews(book_id: int, db: Session = Depends(get_db)):
    book=db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return db.query(models.Review).filter(models.Review.book_id==book_id).all()

@router.get("/book/{book_id}/rating")
def get_average_rating(book_id: int, db: Session = Depends(get_db)):
    # Check if book exists
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Calculate average rating
    avg_rating = db.query(func.avg(models.Review.rating)).filter(
        models.Review.book_id == book_id
    ).scalar()

    # If no reviews yet, return 0
    return {
        "book_id": book_id,
        "average_rating": round(avg_rating, 2) if avg_rating else 0
    }
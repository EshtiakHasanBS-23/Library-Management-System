from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user, require_admin

router = APIRouter()

@router.get("/book/{book_id}", response_model=list[schemas.ReviewOut])
def list_reviews_for_book(book_id: int, db: Session = Depends(get_db)):
    if not db.query(models.Book).get(book_id):
        raise HTTPException(status_code=404, detail="Book not found")
    return db.query(models.Review).filter(models.Review.book_id == book_id).all()

@router.post("/", response_model=schemas.ReviewOut)
def add_review(review_in: schemas.ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not db.query(models.Book).get(review_in.book_id):
        raise HTTPException(status_code=404, detail="Book not found")
    review = models.Review(
        user_id=current_user.id,
        book_id=review_in.book_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    review = db.query(models.Review).get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not allowed")
    db.delete(review)
    db.commit()
    return {"ok": True}

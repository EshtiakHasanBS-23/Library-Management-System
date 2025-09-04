# from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
# from .. import models, schemas
# from ..database import get_db
# from ..auth import get_current_user, require_admin

# router = APIRouter()

# @router.get("/book/{book_id}", response_model=list[schemas.ReviewOut])
# def list_reviews_for_book(book_id: int, db: Session = Depends(get_db)):
#     if not db.query(models.Book).get(book_id):
#         raise HTTPException(status_code=404, detail="Book not found")
#     return db.query(models.Review).filter(models.Review.book_id == book_id).all()

# @router.post("/", response_model=schemas.ReviewOut)
# def add_review(review_in: schemas.ReviewCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
#     if not db.query(models.Book).get(review_in.book_id):
#         raise HTTPException(status_code=404, detail="Book not found")
#     review = models.Review(
#         user_id=current_user.id,
#         book_id=review_in.book_id,
#         rating=review_in.rating,
#         comment=review_in.comment,
#     )
#     db.add(review)
#     db.commit()
#     db.refresh(review)
#     return review

# @router.delete("/{review_id}")
# def delete_review(review_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
#     review = db.query(models.Review).get(review_id)
#     if not review:
#         raise HTTPException(status_code=404, detail="Review not found")
#     if review.user_id != current_user.id and not current_user.is_admin:
#         raise HTTPException(status_code=403, detail="Not allowed")
#     db.delete(review)
#     db.commit()
#     return {"ok": True}


# from fastapi import APIRouter, HTTPException

# router = APIRouter()

# # In-memory storage
# reviews_db = []
# books_db = [
#     {"id": 1, "title": "Book One", "author": "Author A", "category_id": 1, "available": True},
#     {"id": 2, "title": "Book Two", "author": "Author B", "category_id": 2, "available": True}
# ]

# @router.get("/", summary="Get all reviews")
# def get_reviews():
#     return reviews_db

# @router.get("/book/{book_id}", summary="Get reviews for a specific book")
# def get_book_reviews(book_id: int):
#     book_reviews = [r for r in reviews_db if r["book_id"] == book_id]
#     return book_reviews

# @router.post("/", summary="Add a review")
# def add_review(user_id: int, book_id: int, rating: int, comment: str | None = None):
#     book = next((b for b in books_db if b["id"] == book_id), None)
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
    
#     if not (1 <= rating <= 5):
#         raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
#     review = {
#         "id": len(reviews_db) + 1,
#         "user_id": user_id,
#         "book_id": book_id,
#         "rating": rating,
#         "comment": comment
#     }
#     reviews_db.append(review)
#     return review

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="/reviews", tags=["Reviews"])

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
    return db.query(models.Review).filter(models.Review.book_id==book_id).all()

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
router = APIRouter()
MEDIA_DIR = Path("media/donations")

@router.post("/")
def create_donation_book(
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(None),
    category: str = Form(...),
    copies: int = Form(1),
    email: str = Form(...),
    BS_ID: str = Form(...),
    file: UploadFile = File(None),
    pdf: UploadFile = File(None),
    audio: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    
    donation_book = models.DonationBook(
        title=title,
        author=author,
        description=description,
        category=category,
        copies=copies,
        username=current_user.username,
        email=email,
        BS_ID=BS_ID,
        status="pending"
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
        donation_book.image = save_file(file, MEDIA_DIR)
    if pdf:
        donation_book.pdf = save_file(pdf, MEDIA_DIR)
    if audio:
        donation_book.audio = save_file(audio, MEDIA_DIR)
    db.add(donation_book)
    db.commit()
    db.refresh(donation_book)
    
    return donation_book
@router.get("/", response_model=list[schemas.DonationBookResponse])
def list_donation_books(db: Session = Depends(get_db), current_user: models.User = Depends(admin_required)):
    return db.query(models.DonationBook).all()

@router.get("/history", response_model=list[schemas.DonationBookResponse])
def list_donation_books(db: Session = Depends(get_db), current_user: models.User = Depends(admin_required)):
    return db.query(models.DonationBook).filter(models.DonationBook.status!="pending").all()

@router.patch("/{donation_id}/status", response_model=schemas.DonationBookResponse)
def update_donation_status(donation_id: int, update: schemas.DonationBookUpdateStatus, db: Session = Depends(get_db),current_user: models.User = Depends(admin_required)):
    donation = db.query(models.DonationBook).filter(models.DonationBook.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation request not found")
    
    if update.status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    donation.status = update.status
    db.commit()
    db.refresh(donation)

    if update.status == "accepted":
        category = db.query(models.Category).filter(models.Category.name.ilike(donation.category)).first()
        category_id = category.id if category else None

        new_book = models.Book(
            title=donation.title,
            author=donation.author,
            description=donation.description,
            copies=donation.copies,
            image=donation.image,
            pdf=donation.pdf,
            audio=donation.audio,
            category_id=category_id,
            created_at=datetime.utcnow()
        )
        db.add(new_book)
        db.commit()
        db.refresh(new_book)

    return donation
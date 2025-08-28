from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import require_admin
router = APIRouter()

@router.get("/", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name.asc()).all()

@router.post("/", response_model=schemas.CategoryOut)
def create_category(category_in: schemas.CategoryCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if db.query(models.Category).filter(models.Category.name.ilike(category_in.name)).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    cat = models.Category(name=category_in.name)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(category_id: int, category_in: schemas.CategoryCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    cat = db.query(models.Category).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.name = category_in.name
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    cat = db.query(models.Category).get(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"ok": True}

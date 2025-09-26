
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="", tags=["Categories"])


# List categories
@router.get("/", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.get("/{category_id}", response_model=str)
def categories_name_by_id(category_id:int,  db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    category= db.query(models.Category).filter(models.Category.id==category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category.name

# Admin: create category
@router.post("/", response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db),current_user = Depends(admin_required)):
    new_category = models.Category(name=category.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.put("/{category_id}", response_model=schemas.CategoryOut)
def update_category(category_id: int,
                    category_in: schemas.CategoryCreate,
                    db: Session = Depends(get_db),
                    admin: models.User = Depends(admin_required)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.name = category_in.name
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(category_id: int,
                    db: Session = Depends(get_db),
                    admin: models.User = Depends(admin_required)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(category)
    db.commit()
    return {"ok": True}
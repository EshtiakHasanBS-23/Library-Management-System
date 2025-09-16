# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from .. import models, schemas
# from ..database import get_db
# from ..auth import require_admin
# router = APIRouter()

# @router.get("/", response_model=list[schemas.CategoryOut])
# def list_categories(db: Session = Depends(get_db)):
#     return db.query(models.Category).order_by(models.Category.name.asc()).all()

# @router.post("/", response_model=schemas.CategoryOut)
# def create_category(category_in: schemas.CategoryCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
#     if db.query(models.Category).filter(models.Category.name.ilike(category_in.name)).first():
#         raise HTTPException(status_code=400, detail="Category already exists")
#     cat = models.Category(name=category_in.name)
#     db.add(cat)
#     db.commit()
#     db.refresh(cat)
#     return cat
# @router.put("/{category_id}", response_model=schemas.CategoryOut)
# def update_category(category_id: int, category_in: schemas.CategoryCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
#     cat = db.query(models.Category).get(category_id)
#     if not cat:
#         raise HTTPException(status_code=404, detail="Category not found")
#     cat.name = category_in.name
#     db.commit()
#     db.refresh(cat)
#     return cat

# @router.delete("/{category_id}")
# def delete_category(category_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
#     cat = db.query(models.Category).get(category_id)
#     if not cat:
#         raise HTTPException(status_code=404, detail="Category not found")
#     db.delete(cat)
#     db.commit()
#     return {"ok": True}

# from fastapi import APIRouter, HTTPException
# from LMS.routers.auth import get_current_user,require_admin
# from fastapi import Depends

# router = APIRouter()

# # In-memory storage for categories
# categories_db = [
#     {"id": 1, "name": "Fiction"},
#     {"id": 2, "name": "Science"}
# ]

# @router.get("/", summary="Get all categories")
# def get_categories():
#     return categories_db

# @router.get("/{category_id}", summary="Get a single category by ID")
# def get_category(category_id: int):
#     for category in categories_db:
#         if category["id"] == category_id:
#             return category
#     raise HTTPException(status_code=404, detail="Category not found")

# @router.post("/", summary="Create a new category")
# def create_category(category: dict,admin=Depends(require_admin)):
#     category["id"] = len(categories_db) + 1
#     categories_db.append(category)
#     return category

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter(prefix="", tags=["Categories"])


# List categories
@router.get("/", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db),current_user = Depends(get_current_user)):
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
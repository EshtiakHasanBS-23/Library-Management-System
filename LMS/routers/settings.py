from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from LMS import models, schemas
from LMS.database import get_db
from LMS.routers.auth import get_current_user,admin_required

router = APIRouter()

@router.get("/", response_model=schemas.SystemSettingOut)
def get_settings(db: Session = Depends(get_db),current_user = Depends(admin_required)):
    settings = db.query(models.SystemSetting).first()
    if not settings:
        settings = models.SystemSetting(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.patch("/", response_model=schemas.SystemSettingOut)
def update_settings(
    updates: schemas.SystemSettingUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(admin_required)
):
    settings = db.query(models.SystemSetting).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings

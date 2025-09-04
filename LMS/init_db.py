from LMS.database import Base, engine, SessionLocal
from LMS import models
from LMS.routers.auth import get_password_hash

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create default admin if not exists
    db = SessionLocal()
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        admin = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print("✅ Default admin created (username=admin, password=admin123)")
    db.close()


if __name__ == "__main__":
    init_db()

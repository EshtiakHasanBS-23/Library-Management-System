# from fastapi import FastAPI
# from LMS.routers import test,books
# from LMS import schemas,models


# app = FastAPI()
# app.include_router(test.router)
# app.include_router(books.router)
# # app.include_router(borrows.router)
# @app.get("/")
# def read_root():
#     return {"message": "Welcome to Library Management System!"}

# @app.get("/books")
# def get_books():
#     return {"books": ["Book A", "Book B", "Book C"]}

# import os
# from fastapi import FastAPI
# from fastapi.staticfiles import StaticFiles
# from LMS.routers import users, books, borrows, categories, reviews,auth

# app = FastAPI(title="Library Management System")

# # ✅ Ensure "media" folder exists before mounting
# os.makedirs("media", exist_ok=True)

# # Mount media folder for serving uploaded files
# app.mount("/media", StaticFiles(directory="media"), name="media")

# # Routers
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(categories.router,prefix="/categories",tags=["Categories"])
# app.include_router(books.router,prefix="/books",tags=["Books"])
# app.include_router(borrows.router,prefix="/borrows",tags=["Borrows"])
# app.include_router(reviews.router,prefix="/reviews",tags=["Reviews"])
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
# app.mount("/media", StaticFiles(directory="media"), name="media")
# @app.get("/")
# def root():
#     return {"message": "Welcome to LMS Step 3"}

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from LMS.routers import auth, users, books, borrows, categories, reviews

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/media", StaticFiles(directory="media"), name="media")
# Enable CORS if needed


# Include Routers
# app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(books.router, prefix="/books", tags=["Books"])
app.include_router(borrows.router, prefix="/borrows", tags=["Borrows"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])


# Custom OpenAPI schema for Swagger Authorize button
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from LMS.database import get_db
from pydantic import BaseModel
from LMS.models import User

from LMS.routers.auth import verify_password, create_access_token

# @app.post("/token")
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == form_data.username).first()
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=400, detail="Incorrect username or password")
#     access_token = create_access_token(data={"sub": user.username})
#     return {"access_token": access_token, "token_type": "bearer"}
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/token_json")
def login_json(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# ✅ Form-data login (Swagger Authorize button)
@app.post("/token")
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

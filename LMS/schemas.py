from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    image: Optional[str] = None

    class Config:
        orm_mode = True




class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    class Config:
        orm_mode = True




class BookBase(BaseModel):
    title: str
    author: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    copies:int

class BookCreate(BookBase):
    pass

class Book(BookBase):
    id: int
    copies: int
    image: Optional[str] = None
    class Config:
        orm_mode = True

class BorrowCreate(BaseModel):
    book_id: int
    return_date: datetime

class BorrowOut(BaseModel):
    id: int
    user_id: int
    username: str
    book_id: int
    book_title: str
    borrow_date: datetime
    return_date: datetime
    returned_at: Optional[datetime] = None
    status: str

    class Config:
        orm_mode = True




class ReviewCreate(BaseModel):
    book_id: int
    rating: int
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    rating: int
    comment: Optional[str] = None

    class Config:
        orm_mode = True



class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None




class DonationBookBase(BaseModel):
    title: str
    category: str
    author: str
    description: Optional[str] = None
    email: str
    BS_ID: str
    username: str
    copies: Optional[int] = 1

class DonationBookCreate(DonationBookBase):
    pass 
class DonationBookUpdateStatus(BaseModel):
    status: str 

class DonationBookResponse(DonationBookBase):
    id: int
    image: Optional[str] = None
    status: str

    class Config:
        orm_mode = True


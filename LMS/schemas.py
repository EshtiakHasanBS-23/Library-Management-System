# from pydantic import BaseModel, EmailStr, field_validator
# from typing import Optional, List
# from datetime import datetime

# # User
# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     password: str
#     image: Optional[str] = None


# class UserOut(BaseModel):
#     id: int
#     username: str
#     email: EmailStr
#     is_admin: bool
#     class Config:
#         from_attributes = True


# # Category
# class CategoryBase(BaseModel):
#     name: str


# class CategoryCreate(CategoryBase):
#     pass


# class CategoryOut(CategoryBase):
#     id: int
#     class Config:
#         from_attributes = True


# # Book
# class BookBase(BaseModel):
#     title: str
#     author: str
#     description: Optional[str] = None
#     category_id: Optional[int] = None


# class BookCreate(BookBase):
#     pass


# class BookUpdate(BaseModel):
#     title: Optional[str] = None
#     author: Optional[str] = None
#     description: Optional[str] = None
#     category_id: Optional[int] = None
#     copies: int = 1
#     image: Optional[str] = None


# class BookOut(BookBase):
#     id: int
#     available: int
#     image: Optional[str] = None
#     class Config:
#         from_attributes = True


# # Borrow
# class BorrowCreate(BaseModel):
#     book_id: int
#     return_date: datetime


# class BorrowOut(BaseModel):
#     id: int
#     user_id: int
#     book_id: int
#     borrow_date: datetime
#     return_date: datetime
#     returned_at: Optional[datetime] = None
#     status: str
#     class Config:
#         from_attributes = True


# # Review
# class ReviewCreate(BaseModel):
#     book_id: int
#     rating: int
#     comment: Optional[str] = None


# # @field_validator("rating")
# # @classmethod
# # def rating_range(cls, v):
# #     if not 1 <= v <= 5:
# #         raise ValueError("rating must be between 1 and 5")
# #     return v


# class ReviewOut(BaseModel):
#     id: int
#     user_id: int
#     book_id: int
#     rating: int
#     comment: Optional[str] = None
#     class Config:
#         from_attributes = True


# # Auth
# class Token(BaseModel):
#     access_token: str
#     token_type: str

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

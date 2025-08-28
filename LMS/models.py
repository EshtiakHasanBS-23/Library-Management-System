from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False) # hashed
    image = Column(String(255), nullable=True) # stores URL or path to image
    is_admin = Column(Boolean, default=False, nullable=False)


    borrows = relationship("Borrow", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")




class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)


    books = relationship("Book", back_populates="category")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True, nullable=False)
    author = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    copies = Column(Integer, default=1, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    image = Column(String(255), nullable=True) # stores URL or path to image


    category = relationship("Category", back_populates="books")
    borrows = relationship("Borrow", back_populates="book")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")




class Borrow(Base):
    __tablename__ = "borrows"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    return_date = Column(DateTime, nullable=False)
    returned_at = Column(DateTime, nullable=True)
    status=Column(String, default="pending")


    user = relationship("User", back_populates="borrows")
    book = relationship("Book", back_populates="borrows")




class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)


    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")
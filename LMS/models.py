from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime,Text
from sqlalchemy.orm import relationship
from LMS.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    image = Column(String(255), nullable=True)

    borrows = relationship("Borrow", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    books = relationship("Book", back_populates="category")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    copies = Column(Integer, default=1, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    image = Column(String(255), nullable=True)
    pdf = Column(String(255), nullable=True)
    audio = Column(String(255), nullable=True)

    category = relationship("Category", back_populates="books")
    borrows = relationship("Borrow", back_populates="book", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="book", cascade="all, delete-orphan")

class Borrow(Base):
    __tablename__ = "borrows"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.utcnow)
    return_date = Column(DateTime, nullable=True)
    returned_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")

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

class DonationBook(Base):
    __tablename__ = "donation_books"

    id = Column(Integer, primary_key=True, index=True)  # auto-generated ID
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    author = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    email = Column(String, nullable=False)
    BS_ID = Column(String, nullable=False)
    username = Column(String, nullable=False) 
    image = Column(String, nullable=True)
    pdf = Column(String, nullable=True)
    audio = Column(String, nullable=True)
    status = Column(String, default="pending")
    copies = Column(Integer, default=1)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True, default=1)
    borrow_day_limit = Column(Integer, nullable=False, default=14)
    borrow_extend_limit = Column(Integer, nullable=False, default=7)
    borrow_limit = Column(Integer, nullable=False, default=3)
    booking_duration = Column(Integer, nullable=False, default=2)
    booking_days_limit = Column(Integer, nullable=False, default=30)

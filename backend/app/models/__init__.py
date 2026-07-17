from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DECIMAL, Enum, TIMESTAMP, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="buyer")
    seller_level = Column(String(80), nullable=False, default="Freelancer Baru")
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    slug = Column(String(140), nullable=False, unique=True)
    icon = Column(String(12), nullable=False)
    description = Column(String(255), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(180), nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=False)
    price = Column(DECIMAL(12, 2), nullable=False)
    rating = Column(DECIMAL(3, 2), nullable=False, default=0)
    delivery_days = Column(Integer, nullable=False, default=7)
    is_featured = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())


class SavedService(Base):
    __tablename__ = "saved_services"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    package_name = Column(String(80), nullable=False)
    status = Column(String(20), nullable=False, default="Pending")
    total_price = Column(DECIMAL(12, 2), nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    initial = Column(String(4), nullable=False)
    sender_name = Column(String(120), nullable=False)
    last_message = Column(String(255), nullable=False)
    sent_at = Column(String(40), nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    preferences = Column(JSON, nullable=False)
    interests = Column(JSON, nullable=False)

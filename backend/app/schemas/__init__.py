from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field


# Auth Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=1)
    email: str
    password: str = Field(..., min_length=6)
    role: Optional[str] = "buyer"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# Category Schemas
class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon: str
    description: str

    class Config:
        from_attributes = True


# Service Schemas
class ServiceResponse(BaseModel):
    id: int
    category_id: int
    category_slug: Optional[str] = None
    seller_id: int
    seller_name: Optional[str] = None
    seller_level: Optional[str] = None
    title: str
    description: str
    image_url: str
    price: float
    rating: float
    delivery_days: int
    is_featured: bool

    class Config:
        from_attributes = True


# Order Schemas
class OrderCreate(BaseModel):
    service_id: int
    package_name: str = "Standard"


class OrderResponse(BaseModel):
    id: int
    service_id: int
    service_title: Optional[str] = None
    package_name: str
    status: str
    total_price: float
    created_at: datetime

    class Config:
        from_attributes = True


class OrderStatusResponse(BaseModel):
    status: str


# Saved Services Schemas
class SavedResponse(BaseModel):
    saved: bool


class RemovedResponse(BaseModel):
    removed: bool


# Message Schemas
class MessageResponse(BaseModel):
    id: int
    initial: str
    sender_name: str
    last_message: str
    sent_at: str

    class Config:
        from_attributes = True


# Profile Schemas
class Preferences(BaseModel):
    notifications: bool = True
    privacy: str = "standard"
    language: str = "id"
    currency: str = "IDR"


class ProfileResponse(BaseModel):
    preferences: Preferences
    interests: List[str]


class UpdatedResponse(BaseModel):
    updated: bool


# Payment Schemas
class PaymentCreate(BaseModel):
    service_id: int
    package_name: str = "Standard"


class PaymentResponse(BaseModel):
    status: str
    order_id: Optional[int] = None


# Health
class HealthResponse(BaseModel):
    status: str

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
    is_active: bool = True
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
    payment_status: Optional[str] = None
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
    order_id: int
    method: str = "virtual_account"


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    method: str
    amount: float
    fee: float
    total_amount: float
    status: str
    payment_code: Optional[str] = None
    va_number: Optional[str] = None
    expiry_time: Optional[datetime] = None
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentStatusResponse(BaseModel):
    status: str
    message: str


# Customer Service Schemas
class CSThreadCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=255)


class CSThreadResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    subject: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_message: Optional[str] = None

    class Config:
        from_attributes = True


class CSMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)


class CSMessageResponse(BaseModel):
    id: int
    thread_id: int
    sender_id: int
    sender_role: str
    sender_name: Optional[str] = None
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class CSStatusUpdate(BaseModel):
    status: str


# Admin Schemas
class UserListResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    role: str


class UserToggleResponse(BaseModel):
    id: int
    is_active: bool


# Health
class HealthResponse(BaseModel):
    status: str

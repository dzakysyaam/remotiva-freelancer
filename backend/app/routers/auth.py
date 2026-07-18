from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from app.repositories import UserRepository
from app.security import hash_password, verify_password, create_access_token
from app.rate_limiter import rate_limiter


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(data: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Register a new user. Only buyer and seller roles allowed."""
    # Rate limit: 10 requests per minute per IP for registration
    allowed, response = rate_limiter.is_allowed(request, limit=10, path_prefix="/api/auth/register")
    if not allowed:
        return response

    repo = UserRepository(db)

    # Reject admin role from public registration
    if data.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register as admin. Admin accounts are created by administrators.",
        )

    # Check if email exists
    existing = repo.get_user_by_email(data.email.lower())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Validate
    if not data.name or len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nama, email, dan password minimal 6 karakter wajib diisi",
        )

    # Create user with bcrypt hash
    role = data.role if data.role in ["buyer", "seller"] else "buyer"
    user = repo.create_user(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=role,
        is_active=True,
    )

    # Create token
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    })

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    # Rate limit: 10 requests per minute per IP for login
    allowed, response = rate_limiter.is_allowed(request, limit=10, path_prefix="/api/auth/login")
    if not allowed:
        return response

    repo = UserRepository(db)

    user_data = repo.get_user_by_email(data.email.lower())
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="email atau password tidak sesuai",
        )

    user, stored_hash = user_data

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact customer service.",
        )

    # Verify password
    if not verify_password(data.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="email atau password tidak sesuai",
        )

    # Create token
    token = create_access_token({
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    })

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
        ),
    )

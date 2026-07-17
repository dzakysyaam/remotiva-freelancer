from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from app.repositories import UserRepository
from app.security import hash_password, verify_password, create_access_token


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    repo = UserRepository(db)

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
    role = data.role if data.role else "buyer"
    user = repo.create_user(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=role,
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
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    repo = UserRepository(db)

    user_data = repo.get_user_by_email(data.email.lower())
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="email atau password tidak sesuai",
        )

    user, stored_hash = user_data

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
            created_at=user.created_at,
        ),
    )

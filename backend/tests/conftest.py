"""
Test fixtures and configuration for Remotiva backend tests
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import asyncio

from app.main import app
from app.database import get_db
from app.models import Base, User
from app.security import hash_password


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
async def client(db_session):
    """Create an async test client with database override."""
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_user(db_session):
    """Create an admin user for testing."""
    user = User(
        name="Admin Test",
        email="admin@test.com",
        password_hash=hash_password("password123"),
        role="admin",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def buyer_user(db_session):
    """Create a buyer user for testing."""
    user = User(
        name="Buyer Test",
        email="buyer@test.com",
        password_hash=hash_password("password123"),
        role="buyer",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def seller_user(db_session):
    """Create a seller user for testing."""
    user = User(
        name="Seller Test",
        email="seller@test.com",
        password_hash=hash_password("password123"),
        role="seller",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def regular_users(db_session):
    """Create multiple regular users for testing list operations."""
    users = []
    for i in range(5):
        user = User(
            name=f"User {i+1}",
            email=f"user{i+1}@test.com",
            password_hash=hash_password("password123"),
            role="buyer" if i % 2 == 0 else "seller",
            is_active=True
        )
        db_session.add(user)
        users.append(user)
    db_session.commit()
    for u in users:
        db_session.refresh(u)
    return users


@pytest.fixture(scope="function")
async def admin_token(client, admin_user):
    """Get JWT token for admin user."""
    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "password123"}
    )
    return response.json()["token"]


@pytest.fixture(scope="function")
async def buyer_token(client, buyer_user):
    """Get JWT token for buyer user."""
    response = await client.post(
        "/api/auth/login",
        json={"email": "buyer@test.com", "password": "password123"}
    )
    return response.json()["token"]


@pytest.fixture(scope="function")
async def seller_token(client, seller_user):
    """Get JWT token for seller user."""
    response = await client.post(
        "/api/auth/login",
        json={"email": "seller@test.com", "password": "password123"}
    )
    return response.json()["token"]


def auth_header(token):
    """Create authorization header."""
    return {"Authorization": f"Bearer {token}"}

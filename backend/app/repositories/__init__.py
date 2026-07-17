from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
import json

from app.models import User, Category, Service, SavedService, Order, Message, UserProfile


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, name: str, email: str, password_hash: str, role: str = "buyer") -> User:
        user = User(name=name, email=email, password_hash=password_hash, role=role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_email(self, email: str) -> Optional[Tuple[User, str]]:
        user = self.db.query(User).filter(User.email == email).first()
        if user:
            return user, user.password_hash
        return None

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()


class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Category]:
        return (
            self.db.query(Category)
            .order_by(Category.sort_order, Category.name)
            .all()
        )


class ServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        category: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 20,
    ) -> List[dict]:
        q = (
            self.db.query(
                Service.id,
                Service.category_id,
                Category.slug.label("category_slug"),
                Service.seller_id,
                User.name.label("seller_name"),
                User.seller_level,
                Service.title,
                Service.description,
                Service.image_url,
                Service.price,
                Service.rating,
                Service.delivery_days,
                Service.is_featured,
            )
            .join(Category, Category.id == Service.category_id)
            .join(User, User.id == Service.seller_id)
        )

        if category:
            q = q.filter(Category.slug == category)
        if query:
            term = f"%{query}%"
            q = q.filter(
                (Service.title.like(term)) | (Service.description.like(term))
            )

        if limit <= 0 or limit > 50:
            limit = 20

        q = q.order_by(Service.is_featured.desc(), Service.rating.desc()).limit(limit)
        return q.all()

    def get_by_id(self, service_id: int) -> Optional[dict]:
        result = (
            self.db.query(
                Service.id,
                Service.category_id,
                Category.slug.label("category_slug"),
                Service.seller_id,
                User.name.label("seller_name"),
                User.seller_level,
                Service.title,
                Service.description,
                Service.image_url,
                Service.price,
                Service.rating,
                Service.delivery_days,
                Service.is_featured,
            )
            .join(Category, Category.id == Service.category_id)
            .join(User, User.id == Service.seller_id)
            .filter(Service.id == service_id)
            .first()
        )
        return result

    def get_price(self, service_id: int) -> Optional[float]:
        service = self.db.query(Service.price).filter(Service.id == service_id).first()
        return float(service.price) if service else None


class SavedServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_saved_services(self, user_id: int) -> List[dict]:
        return (
            self.db.query(
                Service.id,
                Service.category_id,
                Category.slug.label("category_slug"),
                Service.seller_id,
                User.name.label("seller_name"),
                User.seller_level,
                Service.title,
                Service.description,
                Service.image_url,
                Service.price,
                Service.rating,
                Service.delivery_days,
                Service.is_featured,
            )
            .join(SavedService, SavedService.service_id == Service.id)
            .join(Category, Category.id == Service.category_id)
            .join(User, User.id == Service.seller_id)
            .filter(SavedService.user_id == user_id)
            .order_by(SavedService.created_at.desc())
            .all()
        )

    def save_service(self, user_id: int, service_id: int) -> bool:
        existing = (
            self.db.query(SavedService)
            .filter(SavedService.user_id == user_id, SavedService.service_id == service_id)
            .first()
        )
        if existing:
            return True  # Already saved

        saved = SavedService(user_id=user_id, service_id=service_id)
        self.db.add(saved)
        self.db.commit()
        return True

    def remove_saved(self, user_id: int, service_id: int) -> bool:
        deleted = (
            self.db.query(SavedService)
            .filter(SavedService.user_id == user_id, SavedService.service_id == service_id)
            .delete()
        )
        self.db.commit()
        return deleted > 0


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_orders(self, user_id: int) -> List[dict]:
        return (
            self.db.query(
                Order.id,
                Order.service_id,
                Service.title.label("service_title"),
                Order.package_name,
                Order.status,
                Order.total_price,
                Order.created_at,
            )
            .join(Service, Service.id == Order.service_id)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .all()
        )

    def create_order(self, user_id: int, service_id: int, package_name: str) -> Order:
        price = self.db.query(Service.price).filter(Service.id == service_id).scalar()
        order = Order(
            user_id=user_id,
            service_id=service_id,
            package_name=package_name,
            status="Pending",
            total_price=price,
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_messages(self, user_id: int) -> List[Message]:
        return (
            self.db.query(Message)
            .filter(Message.user_id == user_id)
            .order_by(Message.id.desc())
            .all()
        )


class UserProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_profile(self, user_id: int) -> Tuple[dict, List[str]]:
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

        if not profile:
            # Create default profile
            default_prefs = {
                "notifications": True,
                "privacy": "standard",
                "language": "id",
                "currency": "IDR",
            }
            profile = UserProfile(
                user_id=user_id,
                preferences=default_prefs,
                interests=[],
            )
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
            return default_prefs, []

        return profile.preferences, profile.interests

    def update_preferences(self, user_id: int, preferences: dict) -> bool:
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(
                user_id=user_id,
                preferences=preferences,
                interests=[],
            )
            self.db.add(profile)
        else:
            profile.preferences = preferences
        self.db.commit()
        return True

    def update_interests(self, user_id: int, interests: List[str]) -> bool:
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(
                user_id=user_id,
                preferences={
                    "notifications": True,
                    "privacy": "standard",
                    "language": "id",
                    "currency": "IDR",
                },
                interests=interests,
            )
            self.db.add(profile)
        else:
            profile.interests = interests
        self.db.commit()
        return True

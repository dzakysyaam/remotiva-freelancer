from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import json
import random
import string

from app.models import User, Category, Service, SavedService, Order, Message, UserProfile, CustomerServiceThread, CustomerServiceMessage, Payment


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, name: str, email: str, password_hash: str, role: str = "buyer", is_active: bool = True) -> User:
        user = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role=role,
            is_active=is_active
        )
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

    def get_all_users(self) -> List[User]:
        return self.db.query(User).order_by(User.created_at.desc()).all()

    def toggle_user_active(self, user_id: int) -> Optional[User]:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = not user.is_active
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_user_role(self, user_id: int, new_role: str) -> Optional[User]:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.role = new_role
            self.db.commit()
            self.db.refresh(user)
        return user

    def delete_user(self, user_id: int) -> bool:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False

    def user_exists_by_email(self, email: str) -> bool:
        user = self.db.query(User).filter(User.email == email.lower()).first()
        return user is not None


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

    def get_seller_services(self, seller_id: int) -> List[dict]:
        """Get all services for a seller."""
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
            .join(Category, Category.id == Service.category_id)
            .join(User, User.id == Service.seller_id)
            .filter(Service.seller_id == seller_id)
            .order_by(Service.created_at.desc())
            .all()
        )


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
        orders = (
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

        # Get payment status for each order
        result = []
        for o in orders:
            payment = self.db.query(Payment).filter(Payment.order_id == o.id).first()
            order_dict = {
                "id": o.id,
                "service_id": o.service_id,
                "service_title": o.service_title,
                "package_name": o.package_name,
                "status": o.status,
                "total_price": o.total_price,
                "created_at": o.created_at,
                "payment_status": payment.status if payment else None
            }
            result.append(order_dict)
        return result

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


class CustomerServiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_threads(self, user_id: int) -> List[dict]:
        threads = (
            self.db.query(CustomerServiceThread)
            .filter(CustomerServiceThread.user_id == user_id)
            .order_by(CustomerServiceThread.updated_at.desc())
            .all()
        )

        result = []
        for t in threads:
            last_msg = (
                self.db.query(CustomerServiceMessage)
                .filter(CustomerServiceMessage.thread_id == t.id)
                .order_by(CustomerServiceMessage.created_at.desc())
                .first()
            )
            user = self.db.query(User).filter(User.id == t.user_id).first()
            result.append({
                "id": t.id,
                "user_id": t.user_id,
                "user_name": user.name if user else "Unknown",
                "user_role": user.role if user else None,
                "subject": t.subject,
                "status": t.status,
                "created_at": t.created_at,
                "updated_at": t.updated_at,
                "last_message": last_msg.message if last_msg else None
            })
        return result

    def get_all_threads(self, status_filter: Optional[str] = None) -> List[dict]:
        q = self.db.query(CustomerServiceThread)
        if status_filter:
            q = q.filter(CustomerServiceThread.status == status_filter)
        threads = q.order_by(CustomerServiceThread.updated_at.desc()).all()

        result = []
        for t in threads:
            last_msg = (
                self.db.query(CustomerServiceMessage)
                .filter(CustomerServiceMessage.thread_id == t.id)
                .order_by(CustomerServiceMessage.created_at.desc())
                .first()
            )
            user = self.db.query(User).filter(User.id == t.user_id).first()
            result.append({
                "id": t.id,
                "user_id": t.user_id,
                "user_name": user.name if user else "Unknown",
                "user_role": user.role if user else None,
                "subject": t.subject,
                "status": t.status,
                "created_at": t.created_at,
                "updated_at": t.updated_at,
                "last_message": last_msg.message if last_msg else None
            })
        return result

    def get_thread(self, thread_id: int) -> Optional[CustomerServiceThread]:
        return self.db.query(CustomerServiceThread).filter(CustomerServiceThread.id == thread_id).first()

    def get_thread_by_user(self, thread_id: int, user_id: int) -> Optional[CustomerServiceThread]:
        return (
            self.db.query(CustomerServiceThread)
            .filter(
                CustomerServiceThread.id == thread_id,
                CustomerServiceThread.user_id == user_id
            )
            .first()
        )

    def create_thread(self, user_id: int, subject: str) -> CustomerServiceThread:
        thread = CustomerServiceThread(
            user_id=user_id,
            subject=subject,
            status="open"
        )
        self.db.add(thread)
        self.db.commit()
        self.db.refresh(thread)
        return thread

    def update_thread_status(self, thread_id: int, status: str) -> Optional[CustomerServiceThread]:
        thread = self.db.query(CustomerServiceThread).filter(CustomerServiceThread.id == thread_id).first()
        if thread:
            thread.status = status
            self.db.commit()
            self.db.refresh(thread)
        return thread

    def get_thread_messages(self, thread_id: int) -> List[dict]:
        messages = (
            self.db.query(CustomerServiceMessage)
            .filter(CustomerServiceMessage.thread_id == thread_id)
            .order_by(CustomerServiceMessage.created_at.asc())
            .all()
        )

        result = []
        for m in messages:
            sender = self.db.query(User).filter(User.id == m.sender_id).first()
            result.append({
                "id": m.id,
                "thread_id": m.thread_id,
                "sender_id": m.sender_id,
                "sender_role": m.sender_role,
                "sender_name": sender.name if sender else "Unknown",
                "message": m.message,
                "created_at": m.created_at
            })
        return result

    def create_message(self, thread_id: int, sender_id: int, sender_role: str, message: str) -> CustomerServiceMessage:
        msg = CustomerServiceMessage(
            thread_id=thread_id,
            sender_id=sender_id,
            sender_role=sender_role,
            message=message
        )
        self.db.add(msg)

        # Update thread updated_at
        thread = self.db.query(CustomerServiceThread).filter(CustomerServiceThread.id == thread_id).first()
        if thread:
            thread.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(msg)
        return msg


class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def generate_payment_code(self) -> str:
        """Generate unique payment code."""
        chars = string.ascii_uppercase + string.digits
        return ''.join(random.choices(chars, k=12))

    def generate_va_number(self) -> str:
        """Generate mock VA number."""
        return ''.join(random.choices(string.digits, k=16))

    def create_payment(
        self,
        order_id: int,
        user_id: int,
        method: str,
        amount: float,
        fee: float = 0
    ) -> Payment:
        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            method=method,
            amount=amount,
            fee=fee,
            total_amount=amount + fee,
            status="pending",
            payment_code=self.generate_payment_code(),
            va_number=self.generate_va_number() if "va" in method.lower() or "virtual" in method.lower() else None,
            expiry_time=datetime.utcnow() + timedelta(hours=24)
        )
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def get_payment(self, payment_id: int) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.id == payment_id).first()

    def get_user_payments(self, user_id: int) -> List[Payment]:
        return (
            self.db.query(Payment)
            .filter(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
            .all()
        )

    def get_order_payment(self, order_id: int) -> Optional[Payment]:
        return (
            self.db.query(Payment)
            .filter(Payment.order_id == order_id)
            .first()
        )

    def mark_paid(self, payment_id: int) -> Optional[Payment]:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            payment.status = "paid"
            payment.paid_at = datetime.utcnow()

            # Update order status
            order = self.db.query(Order).filter(Order.id == payment.order_id).first()
            if order:
                order.status = "In Progress"

            self.db.commit()
            self.db.refresh(payment)
        return payment

    def mark_failed(self, payment_id: int) -> Optional[Payment]:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            payment.status = "failed"
            self.db.commit()
            self.db.refresh(payment)
        return payment

    def mark_expired(self, payment_id: int) -> Optional[Payment]:
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if payment:
            payment.status = "expired"
            self.db.commit()
            self.db.refresh(payment)
        return payment

    def get_stats(self) -> dict:
        """Get payment statistics for admin."""
        total = self.db.query(Payment).count()
        pending = self.db.query(Payment).filter(Payment.status == "pending").count()
        paid = self.db.query(Payment).filter(Payment.status == "paid").count()
        failed = self.db.query(Payment).filter(Payment.status == "failed").count()

        total_amount = self.db.query(func.sum(Payment.total_amount)).filter(Payment.status == "paid").scalar() or 0

        return {
            "total": total,
            "pending": pending,
            "paid": paid,
            "failed": failed,
            "total_paid_amount": float(total_amount)
        }

"""
Database Migration Script
Run this to update existing database with new schema changes
"""
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import User
from app.security import hash_password

def migrate():
    """Run database migrations"""
    db = SessionLocal()

    try:
        # 1. Check if is_active column exists
        with engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'is_active'"))
            if not result.fetchone():
                print("Adding is_active column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role"))
                conn.commit()
                print("[OK] Added is_active column")

        # 2. Check if updated_at column exists
        with engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM users LIKE 'updated_at'"))
            if not result.fetchone():
                print("Adding updated_at column to users table...")
                conn.execute(text("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at"))
                conn.commit()
                print("[OK] Added updated_at column")

        # 3. Create customer_service_threads table if not exists
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES LIKE 'customer_service_threads'"))
            if not result.fetchone():
                print("Creating customer_service_threads table...")
                conn.execute(text("""
                    CREATE TABLE customer_service_threads (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        subject VARCHAR(255) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'open',
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                """))
                conn.commit()
                print("[OK] Created customer_service_threads table")

        # 4. Create customer_service_messages table if not exists
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES LIKE 'customer_service_messages'"))
            if not result.fetchone():
                print("Creating customer_service_messages table...")
                conn.execute(text("""
                    CREATE TABLE customer_service_messages (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        thread_id BIGINT NOT NULL,
                        sender_id BIGINT NOT NULL,
                        sender_role VARCHAR(20) NOT NULL,
                        message TEXT NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (thread_id) REFERENCES customer_service_threads(id) ON DELETE CASCADE,
                        FOREIGN KEY (sender_id) REFERENCES users(id)
                    )
                """))
                conn.commit()
                print("[OK] Created customer_service_messages table")

        # 5. Create payments table if not exists
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES LIKE 'payments'"))
            if not result.fetchone():
                print("Creating payments table...")
                conn.execute(text("""
                    CREATE TABLE payments (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        order_id BIGINT NOT NULL,
                        user_id BIGINT NOT NULL,
                        method VARCHAR(50) NOT NULL,
                        amount DECIMAL(12,2) NOT NULL,
                        fee DECIMAL(12,2) NOT NULL DEFAULT 0,
                        total_amount DECIMAL(12,2) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'pending',
                        payment_code VARCHAR(100),
                        va_number VARCHAR(50),
                        expiry_time TIMESTAMP NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        paid_at TIMESTAMP NULL,
                        FOREIGN KEY (order_id) REFERENCES orders(id),
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """))
                conn.commit()
                print("[OK] Created payments table")

        # 6. Create admin user if not exists
        admin = db.query(User).filter(User.email == 'admin@remotiva.id').first()
        if not admin:
            print("Creating admin user...")
            password_hash = hash_password('password')
            admin = User(
                name='Admin Remotiva',
                email='admin@remotiva.id',
                password_hash=password_hash,
                role='admin',
                is_active=True,
                seller_level='Admin'
            )
            db.add(admin)
            db.commit()
            print("[OK] Created admin user")
        else:
            print("Admin user already exists: " + admin.email)

        # 7. Create buyer user if not exists
        buyer = db.query(User).filter(User.email == 'fery@remotiva.id').first()
        if not buyer:
            print("Creating buyer user...")
            password_hash = hash_password('password')
            buyer = User(
                name='Fery Firdaus',
                email='fery@remotiva.id',
                password_hash=password_hash,
                role='buyer',
                is_active=True,
                seller_level='Klien Aktif'
            )
            db.add(buyer)
            db.commit()
            print("[OK] Created buyer user")
        else:
            print("Buyer user already exists: " + buyer.email)

        # 8. Create seller user if not exists
        seller = db.query(User).filter(User.email == 'nadia@remotiva.id').first()
        if not seller:
            print("Creating seller user...")
            password_hash = hash_password('password')
            seller = User(
                name='Nadia Studio',
                email='nadia@remotiva.id',
                password_hash=password_hash,
                role='seller',
                is_active=True,
                seller_level='Top Rated'
            )
            db.add(seller)
            db.commit()
            print("[OK] Created seller user")
        else:
            print("Seller user already exists: " + seller.email)

        # 9. Set all existing users to is_active=True if column was just added
        with engine.connect() as conn:
            conn.execute(text("UPDATE users SET is_active = TRUE WHERE is_active IS NULL OR is_active = FALSE"))
            conn.commit()

        print("")
        print("=" * 50)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print("")
        print("Test accounts:")
        print("  Admin:  admin@remotiva.id / password")
        print("  Buyer:  fery@remotiva.id / password")
        print("  Seller: nadia@remotiva.id / password")

    except Exception as e:
        print("Migration failed: " + str(e))
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate()

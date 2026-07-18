-- Migration: Add role-based features, customer service, and payment simulation
-- Run this after schema.sql

USE remotiva_db;

-- ============================================
-- PHASE 1: User Management Updates
-- ============================================

-- Add is_active column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE AFTER role;

-- Add updated_at column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Update existing users to be active
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- ============================================
-- PHASE 2: Admin User Seed
-- ============================================

-- Insert admin user if not exists
INSERT IGNORE INTO users (name, email, password_hash, role, is_active, seller_level)
VALUES
('Admin Remotiva', 'admin@remotiva.id', '$2b$12$voL4Gf/qZ4KFkFf84wTW7O9kY7xnYfdzVcqpd/zy9oq83cI76rBHe', 'admin', TRUE, 'Admin');

-- ============================================
-- PHASE 3: Customer Service Tables
-- ============================================

CREATE TABLE IF NOT EXISTS customer_service_threads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('open', 'pending', 'closed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_service_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thread_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES customer_service_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- ============================================
-- PHASE 4: Payments Table
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'expired') NOT NULL DEFAULT 'pending',
    payment_code VARCHAR(100),
    va_number VARCHAR(50),
    expiry_time TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================
-- SEED: Sample Customer Service Threads
-- ============================================

-- Insert sample CS threads for testing
INSERT INTO customer_service_threads (user_id, subject, status) VALUES
(1, 'Pertanyaan tentang layanan desain logo', 'open'),
(1, 'Masalah dengan pesanan saya', 'pending');

INSERT INTO customer_service_messages (thread_id, sender_id, sender_role, message) VALUES
(1, 1, 'buyer', 'Halo, saya ingin bertanya tentang layanan desain logo'),
(1, 5, 'admin', 'Halo! Terima kasih sudah menghubungi kami. Ada yang bisa kami bantu?'),
(2, 1, 'buyer', 'Pesanan saya belum diproses'),
(2, 5, 'admin', 'Kami akan segera mengecek pesanan Anda.');

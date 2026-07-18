# UI Copy Audit - Indonesian Localization

## Overview
This document tracks the standardization of user-facing text across the Remotiva frontend into professional Indonesian.

## Date
2026-07-18

## Files Audited

### Pages
- `frontend/src/pages/Login.jsx` - Authentication login page
- `frontend/src/pages/Register.jsx` - Authentication registration page
- `frontend/src/pages/Home.jsx` - Landing page with categories and services
- `frontend/src/pages/Checkout.jsx` - Payment/checkout page
- `frontend/src/pages/ServiceDetail.jsx` - Individual service detail page
- `frontend/src/pages/OrdersPage.jsx` - User orders listing
- `frontend/src/pages/SearchPage.jsx` - Marketplace search/browse page
- `frontend/src/pages/buyer/BuyerDashboard.jsx` - Buyer workspace
- `frontend/src/pages/seller/SellerDashboard.jsx` - Seller workspace
- `frontend/src/pages/admin/AdminDashboard.jsx` - Admin control panel

### Components
- `frontend/src/components/layout/Shell.jsx` - Navigation and footer
- `frontend/src/components/customer-service/CustomerServiceButton.jsx` - CS popup

### Data
- `frontend/src/data/uiCopy.js` - **NEW** Centralized UI copy file

## Major Wording Changes

### Navigation
| Before | After |
|--------|-------|
| Home | Beranda |
| Explore | Jelajahi |
| Categories | Kategori |
| Become a Seller | Mulai Berjualan |
| Sign in | Masuk |
| Join | Daftar |
| Sign Out | Keluar |

### Auth Pages
| Before | After |
|--------|-------|
| Login | Masuk ke akun Anda |
| Create account | Buat akun Remotiva |
| Email address | Email |
| Password | Kata Sandi |
| Full Name | Nama Lengkap |
| Buyer | Pembeli |
| Seller | Penjual |
| Don't have an account? | Belum punya akun? |
| Already have an account? | Sudah punya akun? |

### Dashboard (Buyer)
| Before | After |
|--------|-------|
| Buyer Dashboard | Beranda Pembeli |
| Browse Services | Jelajahi Layanan |
| Saved Services | Layanan Tersimpan |
| My Orders | Pesanan Saya |
| Customer Service | Bantuan Pelanggan |
| Settings | Pengaturan |

### Dashboard (Seller)
| Before | After |
|--------|-------|
| Seller Dashboard | Pusat Penjual |
| Total Earnings | Total Pendapatan |
| Total Orders | Total Pesanan |
| Active Orders | Pesanan Aktif |
| My Services | Layanan Saya |
| Add New Service | Tambah Layanan |
| Incoming Orders | Pesanan Masuk |
| Analytics | Analitik |

### Dashboard (Admin)
| Before | After |
|--------|-------|
| Admin Dashboard | Pusat Admin |
| User Management | Kelola Pengguna |
| Total Users | Total Pengguna |
| Active Users | Pengguna Aktif |
| Total Revenue | Total Pendapatan |
| Open Tickets | Tiket Terbuka |
| Activate | Aktifkan |
| Deactivate | Nonaktifkan |

### Customer Service
| Before | After |
|--------|-------|
| Customer Service | Bantuan Pelanggan |
| Hi, how can we help you today? | Hai, ada yang bisa kami bantu? |
| Type your message... | Tulis pesan Anda... |
| Send | Kirim |
| Select a thread | Pilih percakapan |
| No threads found | Belum ada percakapan |

### Checkout/Payment
| Before | After |
|--------|-------|
| Checkout | Pembayaran |
| Select Payment Method | Pilih Metode Pembayaran |
| Credit / Debit Card | Kartu Kredit/Debit |
| Bank Transfer | Transfer Bank |
| Card Details | Detail Kartu |
| Card Number | Nomor Kartu |
| Cardholder Name | Nama Pemegang Kartu |
| Expiry Date | Tanggal Kadaluarsa |
| Virtual Account | Virtual Account |
| Copy VA Number | Salin Nomor VA |
| How to Pay | Cara Pembayaran |
| QRIS Payment | Pembayaran QRIS |
| Order Summary | Ringkasan Pesanan |
| Service Price | Harga Layanan |
| Platform Fee | Biaya Platform |
| Total | Total |
| Pay Now | Bayar Sekarang |
| Payment Successful! | Pembayaran Berhasil! |
| View My Orders | Lihat Pesanan Saya |

### Service Detail
| Before | After |
|--------|-------|
| Select Package | Pilih Paket |
| Total price | Total harga |
| days delivery | hari pengerjaan |
| Continue to Checkout | Lanjut ke Pembayaran |
| Save for Later | Simpan Nanti |
| Contact Seller | Hubungi Penjual |
| Share Service | Bagikan Layanan |

### Status Labels
| Backend Value | Display |
|---------------|---------|
| pending | Menunggu |
| in_progress / In Progress | Diproses |
| completed / Completed | Selesai |
| cancelled / Cancelled | Dibatalkan |
| paid | Sudah Dibayar |
| failed | Gagal |
| expired | Kedaluwarsa |
| active | Aktif |
| paused | Dijeda |
| draft | Draf |
| open | Terbuka |
| closed | Selesai |

## Role Labels
| Backend Value | Display |
|---------------|---------|
| buyer | Pembeli |
| seller | Penjual |
| admin | Admin |

## Remaining English Text

### Unchanged (Technical/Brand)
- Category names from database (e.g., "Graphic & Design")
- Service titles and descriptions from database
- Seller names and levels from database
- Social media links/handles
- URL paths and slugs

### Technical Labels (Not Displayed to Users)
- API route paths
- CSS class names
- JavaScript variable names
- localStorage keys
- Backend database field names

## Notes

1. **Formatter Functions**: Added `formatOrderStatus()`, `formatPaymentStatus()`, `formatRole()`, and `formatServiceStatus()` to uiCopy.js for consistent status/role display while preserving backend API values.

2. **Centralized Copy**: All UI text is now centralized in `frontend/src/data/uiCopy.js` for easy maintenance and consistency.

3. **Professional Tone**: Used Tokopedia-style Indonesian - professional, friendly, clear, and natural.

4. **No Business Logic Changed**: Only user-facing text was modified. Backend API, database, and authentication logic remain unchanged.

5. **Status Values Preserved**: Backend status values (e.g., "pending", "paid") are NOT translated - only their display labels in Indonesian.

## Changelog Entry

```
- Standardized all user-facing copy to professional Indonesian
- Added centralized uiCopy.js for consistent localization
- Updated Login/Register pages with Indonesian labels
- Updated Buyer/Seller/Admin dashboards with Indonesian labels
- Updated Checkout/Payment page with Indonesian labels
- Updated Customer Service popup with Indonesian labels
- Updated Service Detail page with Indonesian labels
- Added status/role formatter functions for consistent display
```

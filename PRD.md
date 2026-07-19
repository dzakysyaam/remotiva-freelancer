# PRD Remotiva

## Ringkasan Produk

Remotiva adalah platform marketplace freelancer yang membantu klien menemukan layanan digital dan membantu freelancer menjual jasa profesional. Produk menggabungkan alur onboarding, autentikasi, eksplor kategori, pencarian layanan, detail layanan, koleksi, pesanan, inbox, profil, minat, preferensi, dan onboarding penjual.

## Tujuan

- Membuat platform freelancer yang rapi, mobile-first, dan mudah dikembangkan.
- Menghubungkan alur login hingga fitur marketplace secara terpadu.
- Menyediakan basis backend Go dan MySQL yang siap dikembangkan ke fitur production.
- Menjaga scope agar MVP tidak melebar tetapi tetap mencakup fitur dari wireframe.

## Pengguna

### Klien

- Mencari layanan digital.
- Menyimpan layanan favorit.
- Membuat pesanan.
- Mengelola pesanan.
- Mengatur preferensi dan minat.

### Freelancer

- Melihat halaman become a seller.
- Menawarkan layanan.
- Menerima pesanan dan pesan.

## Fitur MVP

### Onboarding

- Menampilkan tiga halaman pengenalan.
- Mengarahkan pengguna ke register atau login.

### Autentikasi

- Register pengguna baru.
- Login pengguna.
- Token session sederhana berbasis HMAC.

### Home

- Menampilkan kategori populer.
- Menampilkan promo referral.
- Menampilkan layanan rekomendasi.

### Search dan Kategori

- Menampilkan daftar kategori.
- Pencarian kategori.
- Halaman layanan berdasarkan kategori.
- Filter visual sesuai wireframe.

### Layanan

- Detail layanan.
- Informasi seller.
- Harga mulai dari.
- Estimasi pengerjaan.
- Buat pesanan.

### Saved Lists

- Simpan layanan.
- Lihat daftar layanan tersimpan.

### Orders

- Lihat pesanan pengguna.
- Buat pesanan dari detail layanan.

### Inbox

- Lihat ringkasan pesan.

### Profile

- Menampilkan informasi akun.
- Menu minat, preferensi, saved lists, dan become seller.

### Preferences

- Bahasa.
- Mata uang.
- Status notifikasi.

### Interests

- Pilih minat layanan.
- Simpan ke profil pengguna.

## Entitas Data

- users
- categories
- services
- saved_services
- orders
- messages
- user_profiles

## API Scope

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/me
GET    /api/categories
GET    /api/services
GET    /api/services/{id}
GET    /api/saved
POST   /api/saved/{id}
DELETE /api/saved/{id}
GET    /api/orders
POST   /api/orders
GET    /api/messages
GET    /api/profile
PATCH  /api/profile/preferences
PATCH  /api/profile/interests
```

## Aturan Bisnis

- Pengguna wajib login untuk mengakses fitur utama.
- Email pengguna harus unik.
- Pesanan hanya dapat dibuat untuk layanan yang valid.
- Layanan tersimpan tidak boleh duplikat untuk user yang sama.
- Default role pengguna baru adalah buyer.
- Data preferensi dan minat disimpan pada user profile.

## Non-Goal MVP

- Payment gateway.
- Upload portofolio seller.
- Chat real-time websocket.
- Review dan dispute management.
- Admin dashboard.
- Escrow payment.

## Clean Architecture Scope

Backend dipisahkan menjadi:

```text
domain      struktur data utama
repository  akses MySQL
http        handler dan routing API
security    token dan autentikasi
config      konfigurasi environment
db          koneksi database
```

Frontend dipisahkan menjadi:

```text
components  layout dan reusable UI
pages       halaman fitur
lib         API client dan data statis
assets      aset Figma yang sudah disanitasi
```

## Acceptance Criteria

- Frontend dapat login memakai akun demo.
- Home menampilkan kategori dan layanan dari API.
- Search menampilkan kategori dan halaman layanan kategori.
- Detail layanan dapat membuat order.
- Saved list dapat menyimpan layanan.
- Orders menampilkan order milik user.
- Preferences dan interests dapat disimpan.
- Backend dapat berjalan dengan MySQL `remotiva_db`.
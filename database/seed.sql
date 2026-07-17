USE remotiva_db;

INSERT INTO users (name,email,password_hash,role,seller_level) VALUES
('Fery Firdaus','fery@remotiva.id','$2b$12$voL4Gf/qZ4KFkFf84wTW7O9kY7xnYfdzVcqpd/zy9oq83cI76rBHe','buyer','Klien Aktif'),
('Nadia Studio','nadia@remotiva.id','$2b$12$voL4Gf/qZ4KFkFf84wTW7O9kY7xnYfdzVcqpd/zy9oq83cI76rBHe','seller','Top Rated'),
('Kreasi Media','kreasi@remotiva.id','$2b$12$voL4Gf/qZ4KFkFf84wTW7O9kY7xnYfdzVcqpd/zy9oq83cI76rBHe','seller','Level 2'),
('Andara Tech','andara@remotiva.id','$2b$12$voL4Gf/qZ4KFkFf84wTW7O9kY7xnYfdzVcqpd/zy9oq83cI76rBHe','seller','Level 1');

INSERT INTO categories (name,slug,icon,description,sort_order) VALUES
('Desain & Grafis','desain-grafis','◇','Logo, brand identity, ilustrasi, dan desain visual.',1),
('Pemasaran Digital','pemasaran-digital','◈','SEO, media sosial, iklan, dan strategi pemasaran.',2),
('Penulisan & Terjemahan','penulisan-terjemahan','▤','Artikel, copywriting, resume, dan translasi.',3),
('Video & Animasi','video-animasi','▣','Editing video, animasi logo, video sosial, dan motion.',4),
('Pemrograman & Teknologi','pemrograman-teknologi','⌘','Website, aplikasi, e-commerce, dan integrasi sistem.',5),
('Data','data','▥','Analisis data, visualisasi, scraping, dan ML ringan.',6),
('Bisnis','bisnis','▧','Riset pasar, rencana bisnis, dan konsultasi profesional.',7),
('Keuangan','keuangan','▦','Akuntansi, pajak, dan perencanaan keuangan.',8);

INSERT INTO services (category_id,seller_id,title,description,image_url,price,rating,delivery_days,is_featured) VALUES
(1,2,'Buat desain logo modern untuk brand profesional','Paket logo siap pakai untuk kebutuhan brand, sosial media, dan bisnis digital. Termasuk revisi dan file final.','/assets/home-5.jpg',350000,4.82,3,true),
(1,2,'Buat brand identity lengkap dan panduan gaya merek','Logo, warna, tipografi, brand guide, dan asset visual untuk bisnis baru.','/assets/frame-81.jpg',850000,4.91,7,true),
(4,3,'Animasi logo clean untuk intro bisnis dan konten','Animasi logo singkat dengan output MP4, transparan, dan versi sosial media.','/assets/home-2.jpg',420000,4.78,4,true),
(4,3,'Editing video komersial untuk produk dan layanan','Video iklan pendek dengan pacing rapi, subtitle, musik, dan color grading ringan.','/assets/search-kategori-6.jpg',600000,4.66,5,false),
(5,4,'Bangun website company profile responsif','Website modern dengan landing page, halaman layanan, kontak, dan integrasi formulir.','/assets/search-kategori-7.jpg',1500000,4.88,10,true),
(5,4,'Pengembangan website e-commerce ringan','Storefront, katalog produk, keranjang, checkout basic, dan admin sederhana.','/assets/home.jpg',2500000,4.73,14,false),
(2,3,'Kelola konten media sosial bulanan','Kalender konten, desain feed, caption, hashtag, dan laporan performa.','/assets/search-kategori-17.jpg',900000,4.61,7,false),
(3,2,'Copywriting halaman landing page yang menjual','Struktur headline, benefit, CTA, dan copy yang mudah dipahami target market.','/assets/search-kategori-5.jpg',450000,4.69,4,false),
(6,4,'Dashboard data bisnis menggunakan Looker Studio','Visualisasi KPI bisnis dengan koneksi spreadsheet dan layout profesional.','/assets/search-kategori-8.jpg',700000,4.75,5,true),
(7,2,'Riset pasar singkat untuk validasi ide bisnis','Analisis kompetitor, target pasar, positioning, dan rekomendasi awal.','/assets/search-kategori-3.jpg',650000,4.58,5,false);

INSERT INTO saved_services (user_id,service_id) VALUES (1,1),(1,5),(1,9);

INSERT INTO orders (user_id,service_id,package_name,status,total_price) VALUES
(1,1,'Standard','In Progress',350000),
(1,5,'Premium','Pending',1500000);

INSERT INTO messages (user_id,initial,sender_name,last_message,sent_at) VALUES
(1,'N','Nadia Studio','Logo draft pertama sudah siap untuk ditinjau.','Hari ini'),
(1,'A','Andara Tech','Saya sudah cek brief website Remotiva.','Kemarin');

INSERT INTO user_profiles (user_id,preferences,interests) VALUES
(1,'{"notifications":true,"privacy":"standard","language":"id","currency":"IDR"}','["Buat konten media sosial","Buat desain siap cetak","Kembangkan identitas merek"]');
# WordPress Multi-Site Monitoring Dashboard

Dashboard pemantauan terpusat untuk memantau status keamanan, uptime, dan update plugin untuk 10-50 website WordPress dari satu panel.

Sistem ini terdiri dari dua bagian utama:
1.  **Central Server Dashboard (Node.js + Express + React + SQLite)**: Berjalan di WSL server internal.
2.  **WordPress Agent Plugin (PHP)**: Diinstal pada masing-masing website WordPress yang ingin dipantau.

---

## Fitur MVP
*   **Pemantauan Uptime & Respon**: Secara otomatis mengecek ketersediaan situs (HTTP status & response latency) setiap X menit.
*   **Notifikasi Telegram Bot**: Push notifikasi real-time untuk kejadian penting (situs down/up, deteksi serangan injection, plugin expired).
*   **Audit Keamanan Terpusat**: Mencatat login sukses, login gagal beruntun (potensi brute force), dan deteksi upaya SQLi/XSS/Path Traversal.
*   **Pemantauan Plugin & Lisensi**: Mendeteksi plugin yang kedaluwarsa (expired) atau membutuhkan pembaruan.
*   **Log Error Agregat**: Menangkap log HTTP error 404, 500, dll dari masing-masing WordPress.

---

## Struktur Direktori
*   `backend/`: Server API gateway, database SQLite + Prisma, alert engine, dan scheduler uptime.
*   `frontend/`: Antarmuka panel admin berbasis React, Vite, dan Tailwind CSS.
*   `wp-agent-plugin/`: Plugin WordPress PHP native untuk mengumpulkan data status situs.

---

## Persiapan & Jalankan Lokal (WSL / Windows)

### 1. Instalasi Dependensi & Build Produksi
Jalankan perintah ini di root direktori untuk menginstal semua dependensi backend, frontend, dan melakukan build:

```bash
npm run install:all
npm run build
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env` di dalam folder `backend/` dan sesuaikan nilainya:
```ini
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=admin
JWT_SECRET=ubah-ke-kunci-rahasia-apa-saja
```

### 3. Jalankan Aplikasi

#### Mode Produksi (Rekomendasi untuk WSL Server):
Menjalankan backend Express yang melayani UI frontend yang telah dicompile pada port `3000`:
```bash
npm start
```

#### Mode Pengembangan (Development):
Menjalankan frontend Vite dev server (port `5173`) dan backend Express (port `3000`) secara bersamaan dengan hot-reload:
```bash
npm run dev
```

---

## Panduan Pemasangan WordPress Agent

1.  Buka menu **Sites** di Dashboard utama, lalu klik **Add New Site** untuk mendaftarkan website WordPress baru.
2.  Dashboard akan menampilkan **API Key** unik (misal: `7cfa...`) beserta instruksi pemasangannya.
3.  Salin folder `wp-agent-plugin` ke direktori plugin WordPress Anda (`wp-content/plugins/`).
4.  Tambahkan baris berikut pada file `wp-config.php` di WordPress Anda untuk menghubungkan agent ke Central Server:
    ```php
    define('WP_MONITOR_API_KEY', 'API_KEY_YANG_DIGENERATE');
    define('WP_MONITOR_SERVER_URL', 'http://IP_WSL_SERVER:3000');
    ```
5.  Aktifkan plugin **WordPress Multi-Site Monitor Agent** melalui dashboard WordPress admin Anda.
6.  Agent akan mulai mengirimkan data status situs secara otomatis setiap 15 menit melalui WP-Cron.

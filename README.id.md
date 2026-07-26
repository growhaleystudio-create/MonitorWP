<div align="center">

  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/logo.svg" width="90" height="90" alt="Growhaley Monitor Logo" />

  # 🛡️ Growhaley Monitor

  **Platform Pemantauan Uptime, Keamanan & SEO Engine Multi-Situs (WordPress + Non-WP) Berbasis Open-Source**

  [![License: GPL v3](https://img.shields.io/badge/Lisensi-GPL--3.0-blue.svg)](LICENSE)
  [![Docker Ready](https://img.shields.io/badge/Docker-Ready-099ce5.svg?logo=docker&logoColor=white)](docker-compose.yml)
  [![Version](https://img.shields.io/badge/Versi-v1.0.0-gold.svg)](#)
  [![Dibuat Oleh](https://img.shields.io/badge/Dibuat%20Oleh-Growhaley%20Studio-darkgreen.svg)](https://github.com/growhaleystudio-create)

  ---

  ### 🌐 Pilih Bahasa / Select Language
  [ **🇬🇧 English** ](README.md) | [ **🇮🇩 Bahasa Indonesia** ](README.id.md)

  ---

</div>

## 📌 Ringkasan

<p align="center">
  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docs/dashboard-preview-dark.png" alt="Growhaley Monitor Dark Mode Preview" width="49%" />
  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docs/dashboard-preview-light.png" alt="Growhaley Monitor Light Mode Preview" width="49%" />
</p>

**Growhaley Monitor** adalah platform pemantauan terpusat versi **"WAZUH Lite"** & self-hosted yang dirancang untuk memantau kesehatan website **WordPress** maupun **Non-WordPress** (Node.js, Laravel, React, HTML Statis, dll) dari satu panel terpadu.

Menggabungkan pemantauan Uptime real-time, pelacakan SSL Expiry, audit event keamanan (SQLi, XSS, Brute Force), **Engine Monitoring & Optimasi SEO ala CrawlSEO**, serta notifikasi instan via **Telegram Bot**.

---

## ✨ Fitur Utama

- **🎯 Engine Optimasi SEO & Performa ala CrawlSEO**:
  - **Scanner Audit On-Page**: Pemindaian otomatis untuk tag H1 yang hilang, Meta Description yang kosong (mendukung Yoast, RankMath, AIOSEO), gambar tanpa teks `alt`, serta tag `noindex` tak disengaja.
  - **Core Web Vitals Google**: Mengukur metrik LCP, CLS, INP, TTFB, dan Skor Performa Lighthouse untuk Mobile & Desktop.
  - **Smart SEO Opportunities Engine**: Algoritma deteksi kata kunci *Striking Distance* (peringkat 4-20), artikel *Low CTR*, *Content Decay* (>6 bulan), dan *Keyword Cannibalization*.
- **🛡️ Engine Keamanan "WAZUH Lite"**:
  - **Deteksi Serangan Real-Time**: Mendeteksi percobaan serangan SQL Injection (SQLi), Cross-Site Scripting (XSS), Path Traversal, & Brute Force login secara otomatis.
  - **Audit Keamanan & Integritas File**: Mencatat riwayat login sukses/gagal serta perubahan file mencurigakan tanpa beban server yang berat.
- **⚡ Pemantauan Dua Tipe Situs (WP + Non-WP)**:
  - **WordPress Nodes**: Pembaruan plugin, lisensi kedaluwarsa, pemantauan telemetri memori/CPU.
  - **Website & Aplikasi Non-WP**: Synthetic HTTP ping, hitung mundur masa berlaku Sertifikat SSL, serta pencocokan kata kunci (deteksi defacement).
- **🎨 Dark / Light Mode yang Harmonis**:
  - Pengalih tema dinamis dengan penyimpan preferensi `localStorage` dan desain SaaS modern yang presisi & rapi.
- **🔒 SSL / TLS Certificate Tracker**: Notifikasi peringatan otomatis saat sertifikat SSL tersisa kurang dari 7 atau 14 hari.
- **📲 Notifikasi Telegram Real-Time**: Dapatkan pemberitahuan langsung di Telegram saat situs down, kembali online, atau SSL akan expired.
- **🚀 Instalasi 1-Command**: Jalankan dalam hitungan detik menggunakan Docker, PowerShell, atau script instalasi curl.

---

## 🚀 Panduan Instalasi & Deployment

### ☁️ Pilihan 1: Deployment Cloud 1-Klik (Gratis & Tanpa Perlu Skill Linux/Coding)

Deploy MonitorWP ke cloud secara instan tanpa perlu mengelola server VPS atau perintah Linux:

- **Deploy di Render.com** (Layanan Web Node.js Gratis dengan background process 24 jam):  
  [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/growhaleystudio-create/MonitorWP)

- **Deploy di Railway / Koyeb / Zeabur**:  
  Hubungkan akun GitHub Anda ke [Railway.app](https://railway.app) atau [Koyeb.com](https://koyeb.com) dan pilih repositori `growhaleystudio-create/MonitorWP` untuk menjalankan container dashboard 24/7.

---

### 🪟 Pilihan 2: Instalasi Windows

#### Opsi A: PowerShell 1-Line Installer (Dengan Docker Desktop)
Jalankan perintah ini di PowerShell Windows Anda:
```powershell
iwr -useb https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.ps1 | iex
```

#### Opsi B: Windows Native (Tanpa Docker, Menggunakan Node.js)
Jika Anda tidak menggunakan Docker, pastikan sudah menginstall [Node.js (v18+)](https://nodejs.org/):
```powershell
git clone https://github.com/growhaleystudio-create/MonitorWP.git
cd MonitorWP
npm run install:all
npm run build
npm start
```

---

### 🐧 Instalasi di Linux / macOS

#### Opsi A: Script Installer 1 Baris
```bash
curl -fsSL https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.sh | bash
```

#### Opsi B: Menggunakan Docker Compose
```bash
git clone https://github.com/growhaleystudio-create/MonitorWP.git
cd MonitorWP
docker compose up -d
```

---

### 🔄 Memperbarui ke Versi Terbaru (Update)

Untuk memperbarui instalasi yang sudah ada ke versi terbaru dengan semua fitur & perbaikan bug terbaru:

**Pengguna Docker / Installer 1-Baris:**
```bash
curl -fsSL https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.sh | bash
```

**Pengguna Git / Native Server:**
```bash
cd growhaley-monitor # atau direktori proyek Anda
git pull origin main
npm run build
npm start
```

---

Buka browser Anda dan akses: **`http://localhost:3000`**
- **Username Default**: `admin`
- **Password Default**: `admin`

---

## 🛠️ Panduan Setup Plugin WordPress Agent

1. Di Dashboard, buka menu **Sites** dan klik **Add Website**.
2. Pilih platform **WordPress**.
3. Unduh file plugin `wp-monitor-agent.zip` dari modal dashboard.
4. Upload & aktifkan plugin di WP Admin Anda (**Plugins > Add New > Upload Plugin**).
5. Buka **Settings > WP Monitor Agent** di WP Admin, lalu isi **Dashboard Server URL** dan **API Key**.

### 📡 Menentukan Dashboard Server URL yang Tepat

- **WP Lokal + MonitorWP Lokal (Komputer yang Sama)**:
  Gunakan `http://localhost:3000` (*Catatan: Gunakan Port 3000 untuk Server API backend, bukan 5173*).
- **WP Lokal pada Jaringan LAN / Wifi Lokal**:
  Gunakan IP lokal komputer Anda (contoh: `http://192.168.1.100:3000`).
- **Website WP Online (cPanel/Cloud) → Dashboard MonitorWP di Laptop Lokal**:
  Buka akses port 3000 lokal Anda ke internet via localtunnel/ngrok:
  ```bash
  npx localtunnel --port 3000
  ```
  Tempelkan URL publik HTTPS yang dihasilkan ke kolom **Dashboard Server URL**.
- **Website WP Online → Server Production / Cloud MonitorWP**:
  Gunakan domain publik atau IP VPS Anda (contoh: `https://monitor-wp.vercel.app` atau `http://IP_SERVER_VPS:3000`).

Sebagai alternatif, Anda juga bisa memasukkan kredensial secara permanen melalui file `wp-config.php`:
```php
define('WP_MONITOR_API_KEY', 'API_KEY_HASIL_GENERATE');
define('WP_MONITOR_SERVER_URL', 'http://IP_SERVER_ANDA:3000');
```

---

## 🐛 Troubleshooting & Dokumentasi Bug

Untuk histori lengkap perbaikan bug dan catatan rilis versi, lihat [CHANGELOG.md](CHANGELOG.md).

- **Kendala Docker di macOS**: Jika `install.sh` menemui kendala di Mac, pastikan aplikasi Docker Desktop sudah terpasang dan aktif (`brew install --cask docker` atau buka aplikasi Docker Desktop).
- **Koneksi Database Vercel**: Jika menggunakan deployment Vercel Serverless, pastikan environment variable `DATABASE_URL` dan `DIRECT_URL` sudah terkonfigurasi dengan benar di settings Vercel.
- **Melaporkan Bug Baru**: Menemukan kendala atau bug baru? Silakan buat laporan di [GitHub Issues](https://github.com/growhaleystudio-create/MonitorWP/issues).

---

## 🤝 Kontribusi

Kontribusi dari siapa saja sangat dialu-alukan! Silakan baca [Panduan Kontribusi](CONTRIBUTING.md) sebelum mengirimkan Pull Request.

---

## 📜 Lisensi

Didistribusikan di bawah **GNU General Public License v3.0 (GPL-3.0)**. Lihat file `LICENSE` untuk informasi lebih lanjut.

Dikelola dengan ❤️ oleh **[Growhaley Studio](https://github.com/growhaleystudio-create)**.

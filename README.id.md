
<div align="center">

  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/logo.svg" width="90" height="90" alt="Growhaley Monitor Logo" />

  # 🛡️ Growhaley Monitor

  **Platform Pemantauan Uptime & Keamanan Multi-Situs (WordPress + Non-WP) Berbasis Open-Source**

  [![License: GPL v3](https://img.shields.io/badge/Lisensi-GPL--3.0-blue.svg)](LICENSE)
  [![Docker Ready](https://img.shields.io/badge/Docker-Ready-099ce5.svg?logo=docker&logoColor=white)](docker-compose.yml)
  [![Version](https://img.shields.io/badge/Versi-v1.0.0-gold.svg)](#)
  [![Built By](https://img.shields.io/badge/Dibuat%20Oleh-Growhaley%20Studio-darkgreen.svg)](https://github.com/growhaleystudio)

  ---

  ### 🌐 Pilih Bahasa / Select Language
  [ **🇬🇧 English** ](README.md) | [ **🇮🇩 Bahasa Indonesia** ](README.id.md)

  ---

</div>

## 📌 Ringkasan

<p align="center">
  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docs/dashboard-preview.png" alt="Growhaley Monitor Dashboard Preview" width="100%" />
</p>

**Growhaley Monitor** adalah platform pemantauan terpusat versi **"WAZUH Lite"** & self-hosted yang dirancang untuk memantau status kesehatan website **WordPress** maupun **Non-WordPress** (Node.js, Laravel, React, HTML Statis, dll) dari satu panel terpadu.

Berfungsi sebagai alternatif SIEM & Uptime monitor yang sangat ringan, platform ini menyediakan pemantauan Uptime real-time, pelacakan SSL Expiry, audit event keamanan (SQLi, XSS, Brute Force), **Analitik SEO Ringan**, pembaruan plugin, serta notifikasi instan via **Telegram Bot**.

---

## ✨ Fitur Utama

- **🛡️ Engine Keamanan "WAZUH Lite"**:
  - **Deteksi Serangan Real-Time**: Mendeteksi percobaan serangan SQL Injection (SQLi), Cross-Site Scripting (XSS), Path Traversal, & Brute Force login secara otomatis.
  - **Audit Keamanan & Integritas File**: Mencatat riwayat login sukses/gagal serta perubahan file mencurigakan tanpa beban server yang berat.
- **📈 Analitik SEO Ringan & Pelacakan Konten**:
  - **Monitoring SEO**: Mendeteksi plugin SEO aktif (Yoast, RankMath, AIOSEO, SEOPress) serta kesehatan postingan.
  - **Statistik Konten & Traffic**: Memantau jumlah artikel yang dipublikasikan, update konten terbaru, serta grafik lalu lintas pengunjung.
- **⚡ Pemantauan Dua Tipe Situs (WP + Non-WP)**:
  - **WordPress Nodes**: Pembaruan plugin, lisensi kedaluwarsa, pemantauan telemetri memori/CPU.
  - **Website & Aplikasi Non-WP**: Synthetic HTTP ping, hitung mundur masa berlaku Sertifikat SSL, serta pencocokan kata kunci (deteksi defacement).
- **🔒 SSL / TLS Certificate Tracker**: Notifikasi peringatan otomatis saat sertifikat SSL tersisa kurang dari 7 atau 14 hari.
- **📲 Notifikasi Telegram Real-Time**: Dapatkan pemberitahuan langsung di Telegram saat situs down, kembali online, atau SSL akan expired.
- **🚀 Instalasi 1-Command**: Jalankan dalam hitungan detik menggunakan Docker, PowerShell, atau script instalasi curl.
- **🔄 Auto Update Checker**: Sistem bawaan untuk mendeteksi rilis versi baru dari GitHub Growhaley.

---

## 🚀 Panduan Instalasi Cepat

### 🪟 Instalasi di Windows

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

Buka browser Anda dan akses: **`http://localhost:3000`**
- **Username Default**: `admin`
- **Password Default**: `admin`

---

## 🛠️ Pemasangan Plugin Agent WordPress

1. Di Dashboard, buka menu **Sites** dan klik **Add Website**.
2. Pilih platform **WordPress**.
3. Salin **API Key** yang dihasilkan.
4. Unduh file `wp-agent-plugin.zip` dari dashboard atau menu release.
5. Tambahkan baris berikut pada file `wp-config.php` di WordPress Anda:

```php
define('WP_MONITOR_API_KEY', 'API_KEY_YANG_DIGENERATE');
define('WP_MONITOR_SERVER_URL', 'http://IP_SERVER_ANDA:3000');
```

6. Aktifkan plugin **WordPress Multi-Site Monitor Agent** di panel admin WordPress Anda.

## 🤝 Kontribusi

Kontribusi dari siapa saja sangat dialu-alukan! Silakan baca [Panduan Kontribusi](CONTRIBUTING.md) sebelum mengirimkan Pull Request.

---

## 📜 Lisensi

Didistribusikan di bawah **GNU General Public License v3.0 (GPL-3.0)**. Lihat file `LICENSE` untuk informasi lebih lanjut.

Dikelola dengan ❤️ oleh **[Growhaley Studio](https://github.com/growhaleystudio-create)**.

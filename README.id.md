
<div align="center">

  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/logo.svg" width="90" height="90" alt="Growhaley Monitor Logo" />

  # 🛡️ Growhaley Monitor

  **Platform Pemantauan Uptime & Keamanan Multi-Situs (WordPress + Non-WP) Berbasis Open-Source**

  [![License: MIT](https://img.shields.io/badge/Lisensi-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Docker Ready](https://img.shields.io/badge/Docker-Ready-099ce5.svg?logo=docker&logoColor=white)](docker-compose.yml)
  [![Version](https://img.shields.io/badge/Versi-v1.0.0-gold.svg)](#)
  [![Built By](https://img.shields.io/badge/Dibuat%20Oleh-Growhaley%20Studio-darkgreen.svg)](https://github.com/growhaleystudio)

  ---

  ### 🌐 Pilih Bahasa / Select Language
  [ **🇬🇧 English** ](README.md) | [ **🇮🇩 Bahasa Indonesia** ](README.id.md)

  ---

</div>

## 📌 Ringkasan

**Growhaley Monitor** adalah dashboard pemantauan terpusat ringan yang dirancang untuk memantau status kesehatan website **WordPress** maupun **Non-WordPress** (Node.js, Laravel, React, HTML Statis, dll) dari satu panel terpadu.

Platform ini menyediakan pemantauan Uptime real-time, pelacakan masa aktif sertifikat SSL, audit event keamanan, pemeriksaan pembaruan plugin, serta notifikasi instan via **Telegram Bot**.

---

## ✨ Fitur Utama

- **⚡ Pemantauan Dua Tipe Situs**:
  - **WordPress Nodes**: Pembaruan plugin, lisensi kedaluwarsa, pemantauan memori/CPU, serta audit log keamanan (SQLi, XSS, Brute Force).
  - **Website & Aplikasi Non-WP**: Synthetic HTTP ping, hitung mundur masa berlaku Sertifikat SSL, serta pencocokan kata kunci (deteksi defacement).
- **🔒 SSL / TLS Certificate Tracker**: Notifikasi peringatan otomatis saat sertifikat SSL tersisa kurang dari 7 atau 14 hari.
- **🚀 Instalasi 1-Command**: Jalankan dalam hitungan detik menggunakan Docker atau script instalasi curl.
- **📲 Notifikasi Telegram Real-Time**: Dapatkan pemberitahuan langsung di Telegram saat situs down, kembali online, atau SSL akan expired.
- **🔄 Auto Update Checker**: Sistem bawaan untuk mendeteksi jika ada rilis versi baru aplikasi dari GitHub Growhaley.

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

---

## 📜 Lisensi

Didistribusikan di bawah **Lisensi MIT**. Lihat file `LICENSE` untuk informasi lebih lanjut.

Dikelola dengan ❤️ oleh **[Growhaley Studio](https://github.com/growhaleystudio)**.

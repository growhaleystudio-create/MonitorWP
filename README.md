<div align="center">

  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/logo.svg" width="90" height="90" alt="Growhaley Monitor Logo" />

  # 🛡️ Growhaley Monitor

  **An Open-Source Multi-Site (WordPress + Non-WP) Uptime & Security Monitoring Platform**

  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Docker Ready](https://img.shields.io/badge/Docker-Ready-099ce5.svg?logo=docker&logoColor=white)](docker-compose.yml)
  [![Version](https://img.shields.io/badge/Version-v1.0.0-gold.svg)](#)
  [![Built By](https://img.shields.io/badge/Maintained%20By-Growhaley%20Studio-darkgreen.svg)](https://github.com/growhaleystudio)

  ---

  ### 🌐 Select Language / Pilih Bahasa
  [ **🇬🇧 English** ](README.md) | [ **🇮🇩 Bahasa Indonesia** ](README.id.md)

  ---

</div>

## 📌 Overview

**Growhaley Monitor** is a lightweight, self-hosted monitoring dashboard designed to track **WordPress** and **Non-WordPress** (Node.js, Laravel, React, Static HTML, etc.) websites from a centralized panel.

It provides real-time Uptime monitoring, SSL Certificate Expiry tracking, Security event auditing, Plugin vulnerability checks, and instant **Telegram Bot Alerts**.

---

## ✨ Key Features

- **⚡ Dual Site Monitoring**:
  - **WordPress Nodes**: Plugin updates, license expiration check, memory/CPU telemetry, security audit logs (SQLi, XSS, Brute Force).
  - **Non-WP Websites & Apps**: Synthetic HTTP pings, SSL Certificate Expiry countdown, Keyword matching (Defacement detection).
- **🔒 SSL / TLS Certificate Tracker**: Automatic warning alerts when SSL certificates expire within 7 or 14 days.
- **🚀 1-Command Installation**: Deploy in seconds using Docker or curl installation script.
- **📲 Instant Telegram Notifications**: Get notified on Telegram when a site goes down, comes back online, or SSL is about to expire.
- **🔄 Auto Update Checker**: Built-in GitHub release notification engine to notify you of new software versions.

---

## 🚀 Quick Start (Installation)

### 🪟 Windows Installation

#### Option A: Windows PowerShell 1-Line Installer (Docker Desktop)
Run this command in PowerShell (Admin):
```powershell
iwr -useb https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.ps1 | iex
```

#### Option B: Windows Native (Without Docker, using Node.js)
If you don't use Docker, ensure [Node.js v18+](https://nodejs.org/) is installed:
```powershell
git clone https://github.com/growhaleystudio-create/MonitorWP.git
cd MonitorWP
npm run install:all
npm run build
npm start
```

---

### 🐧 Linux / macOS Installation

#### Option A: One-Line Installer Script
```bash
curl -fsSL https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.sh | bash
```

#### Option B: Docker Compose
```bash
git clone https://github.com/growhaleystudio-create/MonitorWP.git
cd MonitorWP
docker compose up -d
```

---

Open your browser and navigate to: **`http://localhost:3000`**
- **Default Username**: `admin`
- **Default Password**: `admin`

---

## 🛠️ WordPress Agent Plugin Setup

1. In the Dashboard, go to **Sites** and click **Add Website**.
2. Select **WordPress** as the platform.
3. Copy the generated **API Key**.
4. Download the `wp-agent-plugin.zip` from the dashboard or release section.
5. Add the following constants to your WordPress `wp-config.php`:

```php
define('WP_MONITOR_API_KEY', 'YOUR_GENERATED_API_KEY');
define('WP_MONITOR_SERVER_URL', 'http://your-server-ip:3000');
```

6. Activate the **WordPress Multi-Site Monitor Agent** plugin in your WordPress Admin panel.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Maintained with ❤️ by **[Growhaley Studio](https://github.com/growhaleystudio)**.

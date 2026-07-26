<div align="center">

  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/logo.svg" width="90" height="90" alt="Growhaley Monitor Logo" />

  # 🛡️ Growhaley Monitor

  **An Open-Source Multi-Site (WordPress + Non-WP) Uptime, Security & SEO Engine Monitoring Platform**

  [![License: GPL v3](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
  [![Docker Ready](https://img.shields.io/badge/Docker-Ready-099ce5.svg?logo=docker&logoColor=white)](docker-compose.yml)
  [![Version](https://img.shields.io/badge/Version-v1.0.0-gold.svg)](#)
  [![Maintained By](https://img.shields.io/badge/Maintained%20By-Growhaley%20Studio-darkgreen.svg)](https://github.com/growhaleystudio-create)

  ---

  ### 🌐 Select Language / Pilih Bahasa
  [ **🇬🇧 English** ](README.md) | [ **🇮🇩 Bahasa Indonesia** ](README.id.md)

  ---

</div>

## 📌 Overview

<p align="center">
  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docs/dashboard-preview-dark.png" alt="Growhaley Monitor Dark Mode Preview" width="49%" />
  <img src="https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docs/dashboard-preview-light.png" alt="Growhaley Monitor Light Mode Preview" width="49%" />
</p>

**Growhaley Monitor** is a lightweight **"WAZUH Lite"** & self-hosted monitoring dashboard designed to track **WordPress** and **Non-WordPress** (Node.js, Laravel, React, Static HTML, etc.) websites from a single, centralized panel.

Combining Uptime checks, SSL Expiry tracking, SIEM-like Web Application Firewall auditing, **CrawlSEO-inspired SEO & Core Web Vitals Optimization Engine**, and **Telegram Bot Alerts**, it keeps your web infrastructure secure, performant, and search-engine optimized.

---

## ✨ Key Features

- **🎯 CrawlSEO-Inspired SEO & Performance Engine**:
  - **On-Page Audit Scanner**: Automated local scanning for missing H1 tags, missing Meta Descriptions (Yoast, RankMath, AIOSEO support), missing image `alt` attributes, and accidental `noindex` directives.
  - **Google Core Web Vitals**: Measures LCP, CLS, INP, TTFB, and Lighthouse Performance Scores for Mobile & Desktop.
  - **Smart SEO Opportunities Engine**: Algorithmic detection for *Striking Distance* keywords (ranks 4-20), *Low CTR* articles, *Content Decay* (>6 months old), and *Keyword Cannibalization*.
- **🛡️ WAZUH Lite Web Security Engine**:
  - **Attack Detection**: Real-time detection of SQL Injection (SQLi), Cross-Site Scripting (XSS), Path Traversal, & Brute Force login attempts.
  - **File Integrity & Security Audit**: Audit login activity, failed logins, and suspicious file modifications without heavy server overhead.
- **⚡ Dual Site Monitoring (WP + Non-WP)**:
  - **WordPress Nodes**: Plugin updates, license expiration checks, memory/CPU telemetry.
  - **Non-WP Websites & Apps**: Synthetic HTTP pings, SSL Certificate Expiry countdown, Keyword matching (Defacement detection).
- **🎨 Harmonized Dark / Light Mode**:
  - Dynamic theme switcher with `localStorage` persistence and clean, non-bubbly standard SaaS design system.
- **🔒 SSL / TLS Certificate Tracker**: Automatic warning alerts when SSL certificates expire within 7 or 14 days.
- **📲 Instant Telegram Notifications**: Get notified on Telegram when a site goes down, comes back online, or SSL is about to expire.
- **🚀 1-Command Installation**: Deploy in seconds using Docker, PowerShell, or curl installation scripts.

---

## 🚀 Quick Start (Installation & Deployment)

### ☁️ Option 1: 1-Click Free Cloud Deployment (Zero Technical Skills Needed)

Deploy MonitorWP to the cloud in seconds without managing servers or Linux CLI:

- **Deploy on Render.com** (Free Node.js Web Service with 24/7 background process):  
  [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/growhaleystudio-create/MonitorWP)

- **Deploy on Railway / Koyeb / Zeabur**:  
  Connect your GitHub account to [Railway.app](https://railway.app) or [Koyeb.com](https://koyeb.com) and select the `growhaleystudio-create/MonitorWP` repository to launch a 24/7 containerized dashboard.

---

### 🪟 Option 2: Windows Installation

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

### 🔄 Updating to the Latest Version

To update an existing installation to the latest version with all recent features & fixes:

**Docker / 1-Line Installer:**
```bash
curl -fsSL https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.sh | bash
```

**Native / Git Installation:**
```bash
cd growhaley-monitor # or your project directory
git pull origin main
npm run build
npm start
```

---

Open your browser and navigate to: **`http://localhost:3000`**
- **Default Username**: `admin`
- **Default Password**: `admin`

---

## 🛠️ WordPress Agent Plugin Setup

1. In the Dashboard, go to **Sites** and click **Add Website**.
2. Select **WordPress** as the platform.
3. Download the `wp-monitor-agent.zip` plugin from the dashboard modal.
4. Upload & activate the plugin in your WordPress Admin panel (**Plugins > Add New > Upload Plugin**).
5. Open **Settings > WP Monitor Agent** in WP Admin and enter your **Dashboard Server URL** and **API Key**.

### 📡 Choosing the Correct Dashboard Server URL

- **Local WP + Local MonitorWP (Same Computer)**:
  Use `http://localhost:3000` (*Note: Use Port 3000 for backend API, not 5173*).
- **Local WP on LAN / Local Network**:
  Use your local IP address (e.g., `http://192.168.1.100:3000`).
- **Live Online WP Site (cPanel/Cloud) → Local MonitorWP Dashboard**:
  Expose your local port 3000 to the internet via localtunnel/ngrok:
  ```bash
  npx localtunnel --port 3000
  ```
  Paste the generated public HTTPS URL into **Dashboard Server URL**.
- **Live Online WP Site → Production / Cloud MonitorWP**:
  Use your public domain or VPS IP (e.g., `https://monitor-wp.vercel.app` or `http://YOUR_SERVER_IP:3000`).

Alternatively, you can hardcode credentials into `wp-config.php`:
```php
define('WP_MONITOR_API_KEY', 'YOUR_GENERATED_API_KEY');
define('WP_MONITOR_SERVER_URL', 'http://your-server-ip:3000');
```

---

## 🐛 Troubleshooting & Bug Reports

For a complete history of bug fixes and version updates, see [CHANGELOG.md](CHANGELOG.md).

- **macOS Docker Issues**: If `install.sh` fails on macOS, ensure Docker Desktop is installed and running (`brew install --cask docker` or open Docker Desktop app).
- **Vercel Database Timeout**: If deploying on Vercel Serverless, verify your `DATABASE_URL` and `DIRECT_URL` in Vercel Environment Variables.
- **Reporting New Bugs**: Found a bug or issue? Please open a report on [GitHub Issues](https://github.com/growhaleystudio-create/MonitorWP/issues).

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

---

## 📜 License

Distributed under the **GNU General Public License v3.0 (GPL-3.0)**. See `LICENSE` for more information.

Maintained with ❤️ by **[Growhaley Studio](https://github.com/growhaleystudio-create)**.

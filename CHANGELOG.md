# 📜 Changelog

All notable changes, bug fixes, and improvements to **Growhaley Monitor** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 🚀 [v1.2.0] - 2026-08-01

### ✨ Major Features & Enterprise Enhancements
- **🛡️ NVD CVE Vulnerability Intelligence**: Real-time WordPress plugin security audit mapping unpatched & expired plugins directly to verified NIST NVD CVE advisories with CVSS scores and official advisory links.
- **🛑 Central WAF IP Blacklist & Firewall Manager**: Centralized IP banning system in `/security`. WP Agent enforces early `init` hook blocking matching attacker IPs with `HTTP 403 Forbidden` before PHP execution.
- **🦠 Web Shell & PHP Malware Telemetry**: Automated scanner detecting dangerous `.php` files inside `/wp-content/uploads/`, `eval(base64_decode)`, and hidden backdoor file patterns.
- **🔗 Automated Broken Link (404 Error) Scanner**: On-demand and background crawler identifying broken internal/external links and computing Link Health Score %.
- **📄 Agency Client PDF Report Generator**: 1-Click printable PDF report generator compiling Executive Uptime SLA, Core Web Vitals, Security & Malware Telemetry, and CVE Compliance.
- **🔒 SSL Certificate Expiry Sentinel**: Real-time TLS socket inspection tracking SSL certificate expiration dates, issuers, and triggering pre-expiry Telegram alerts.
- **🧹 Centralized WP Database Junk Cleaner**: Remote 1-click database cleanup purging post revisions, trashed posts, spam comments, and expired transients.
- **⏱️ Downtime Root Cause & Incident Diagnostics**: Precision failure classification mapping HTTP status codes to exact root causes (e.g. *502 Bad Gateway / Nginx Failure*, *500 Internal Server Error*, *DNS Failure*, *Connection Refused*).
- **🌐 Google Search Console (GSC) Credentials**: Added Service Account Client Email and Private Key fields in Settings page.

### 🐛 Bug Fixes & UX Polish
- **Sidebar Menu Expansion**: Restored `Plugins & CVEs` (`/plugins`) and `Audit Logs` (`/logs`) links to the left navigation sidebar.
- **Telemetry Loader Overhaul**: Replaced pet sprite loader with a clean, professional dual-ring telemetry spinner across all pages.
- **Search Bar Alignment**: Applied `!pl-9 pointer-events-none` fixes across search inputs on `/seo`, `/security`, and `/logs`.
- **Defensive Safeguards**: Wrapped sub-queries with `Promise.allSettled` and optional chaining (`plugin.site?.name`) to eliminate blank page React crashes.

---

## 🚀 [v1.1.0] - 2026-07-23

### 🐛 Bug Fixes
- **macOS Installer Fix**: Resolved `Unsupported operating system macOS` error when executing `install.sh`. Added automatic detection for macOS (Darwin), Homebrew fallback (`brew install --cask docker`), and automatic Docker Desktop application launching (`open -a Docker`).
- **Dynamic SEO & PageSpeed Telemetry**: Replaced static fallback default metrics (`78/92`, `2.3s` LCP, `0.04` CLS) with **real server-side HTML scraping audit** (checking H1, Meta Description, Image Alt tags, Noindex directives, `robots.txt`, and `sitemap.xml`) and dynamic, site-specific performance calculation.
- **Backend API Resilience (Vercel Serverless 500 Fix)**: Wrapped sub-queries in `/api/dashboard/overview` and `/api/dashboard/sites` with defensive `try-catch` error boundaries to prevent database schema mismatch crashes on Vercel Serverless deployments.
- **100% Dark Mode Color Harmonization**: Eliminated leftover `bg-white` elements across Overview latency charts, availability donut cards, site detail security widgets, SCA audit checklists, top pages tables, and Login form.

### ✨ Features & Improvements
- **🎯 SEO & Vitals Dashboard (`/seo`)**: Dedicated network-wide SEO performance dashboard featuring CrawlSEO-inspired On-Page Audits, PageSpeed Insights, and Smart Growth Opportunities (Striking Distance keywords, Content Decay, Low CTR).
- **🛡️ Security & WAF Threat Center (`/security`)**: Centralized SIEM security dashboard featuring live incident event streams (SQLi, XSS, Brute Force, FIM) and node hardening (SCA) assessment scores.
- **💊 Pill Button Navigation**: Redesigned tab menus in `Overview` and `SiteDetail` into modern, sleek pill buttons with full dark mode support.
- **🛠️ WordPress Agent Plugin v1.1.1**: Updated WP Agent plugin (`wp-monitor-agent.php`) author to `Growhaley Studio` with an interactive, editable settings form under **WP Admin > Settings > WP Monitor Agent**.

---

## 📦 [v1.0.0] - 2026-07-22

### ✨ Initial Open-Source Release
- **Multi-Site Monitoring**: Support for WordPress and Non-WordPress websites (Laravel, Node.js, React, Static HTML).
- **Uptime & SSL Expiry Tracking**: Synthetic HTTP pings with 30s background scheduler and SSL certificate expiry warnings.
- **Telegram Bot Notifications**: Automated instant alerts when sites go offline, come back online, or SSL is about to expire.
- **Docker & 1-Line Installers**: Full Docker Compose setup and PowerShell / Bash installer scripts.

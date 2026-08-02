# ==============================================================================
# WhalePod - Windows PowerShell 1-Line Installer
# Usage: iwr -useb https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.ps1 | iex
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " 🐋 Welcome to WhalePod Windows Installer" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ Docker is not installed or not in PATH. Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

$InstallDir = "$HOME\whalepod"
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
}
Set-Location $InstallDir

Write-Host "📥 Downloading docker-compose.yml..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docker-compose.yml" -OutFile "docker-compose.yml"

Write-Host "⚡ Starting WhalePod containers..." -ForegroundColor Green
docker compose up -d

Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "🎉 WhalePod successfully installed!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host "🌐 Access Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔑 Default Username: admin" -ForegroundColor Yellow
Write-Host "🔑 Default Password: admin" -ForegroundColor Yellow
Write-Host "======================================================`n" -ForegroundColor Green

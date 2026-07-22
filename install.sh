#!/usr/bin/env bash
# ==============================================================================
# Growhaley Monitor - 1-Line Installer Script
# Usage: curl -fsSL https://raw.githubusercontent.com/growhaleystudio/monitor-wp/main/install.sh | bash
# ==============================================================================

set -e

GREEN='\033[0;32m'
TEAL='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${TEAL}"
echo "   ____                      _           _             __  __ ___  _  ______ "
echo "  / ___|_ __ _____      _| |__   __ _| | ___ _   _  |  \/  / _ \| ||_   _|"
echo " | |  _| '__/ _ \ \ /\ / / '_ \ / _\` | |/ _ \ | | | | |\/| | | | | ||_| |  "
echo " | |_| | | | (_) \ V  V /| | | | (_| | |  __/ |_| | | |  | | |_| |  _|| |  "
echo "  \____|_|  \___/ \_/\_/ |_| |_|\__,_|_|\___|\__, | |_|  |_|\___/|_|  |_|  "
echo "                                             |___/                         "
echo -e "${NC}"
echo -e "${GREEN}🚀 Welcome to Growhaley Monitor Installer!${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER || true
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker Compose is not installed. Please install docker-compose to continue.${NC}"
    exit 1
fi

INSTALL_DIR="$HOME/growhaley-monitor"
echo -e "${TEAL}📦 Creating installation directory at ${INSTALL_DIR}...${NC}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${TEAL}📥 Downloading docker-compose.yml...${NC}"
curl -fsSL https://raw.githubusercontent.com/growhaleystudio/monitor-wp/main/docker-compose.yml -o docker-compose.yml

echo -e "${GREEN}⚡ Starting Growhaley Monitor containers...${NC}"
docker compose up -d

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 Growhaley Monitor successfully installed!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "🌐 Access Dashboard: ${TEAL}http://localhost:3000${NC}"
echo -e "🔑 Default Username: ${YELLOW}admin${NC}"
echo -e "🔑 Default Password: ${YELLOW}admin${NC}"
echo -e "${YELLOW}⚠️ Please change the default password in .env or Settings after logging in!${NC}"
echo -e "${GREEN}======================================================${NC}\n"

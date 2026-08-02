#!/usr/bin/env bash
# ==============================================================================
# WhalePod - 1-Line Installer Script (Linux, macOS & VPS Compatible)
# Usage: curl -fsSL https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/install.sh | bash
# ==============================================================================

set -e

GREEN='\033[0;32m'
TEAL='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${TEAL}"
echo " __        __/ _|  |_  | | __/ _ \ / _|"
echo " \ \  /\  / / _ \ / _\` | |/ / | | |  _|"
echo "  \ V  V /| | | | (_| |   <| |_| | |  "
echo "   \_/\_/ |_| |_|\__,_|_|\_\\\___/|_|  "
echo -e "${NC}"
echo -e "${GREEN}🐋 Welcome to WhalePod Installer!${NC}\n"

OS_TYPE="$(uname -s)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker CLI is not installed.${NC}"
    if [ "$OS_TYPE" = "Darwin" ]; then
        echo -e "${TEAL}🍏 macOS detected.${NC}"
        if command -v brew &> /dev/null; then
            echo -e "${TEAL}🍺 Installing Docker Desktop via Homebrew...${NC}"
            brew install --cask docker || {
                echo -e "${RED}❌ Homebrew install failed. Please download Docker Desktop manually.${NC}"
                echo -e "${TEAL}🔗 https://www.docker.com/products/docker-desktop/${NC}"
                exit 1
            }
        else
            echo -e "${RED}❌ Docker is required on macOS.${NC}"
            echo -e "${YELLOW}Please install Docker Desktop for Mac from:${NC} ${TEAL}https://www.docker.com/products/docker-desktop/${NC}"
            echo -e "${YELLOW}Or install Homebrew and run:${NC} ${TEAL}brew install --cask docker${NC}\n"
            exit 1
        fi
    else
        echo -e "${YELLOW}Installing Docker on Linux via get.docker.com...${NC}"
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker "$USER" || true
    fi
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${YELLOW}⚠️ Docker daemon is not running.${NC}"
    if [ "$OS_TYPE" = "Darwin" ]; then
        echo -e "${TEAL}🍏 Launching Docker Desktop on macOS...${NC}"
        open -a Docker || true
        echo -e "${YELLOW}Waiting for Docker daemon to respond (up to 45s)...${NC}"
        for i in {1..30}; do
            if docker info &> /dev/null; then
                echo -e "${GREEN}✅ Docker daemon is active!${NC}"
                break
            fi
            sleep 1.5
        done
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not active. Please start Docker Desktop and run this script again.${NC}"
        exit 1
    fi
fi

# Check Docker Compose availability
COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}❌ Docker Compose is not installed or available.${NC}"
    echo -e "${YELLOW}Please enable Docker Compose or install docker-compose to continue.${NC}"
    exit 1
fi

INSTALL_DIR="$HOME/whalepod"
echo -e "${TEAL}📦 Setting up installation directory at ${INSTALL_DIR}...${NC}"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo -e "${TEAL}📥 Downloading docker-compose.yml...${NC}"
curl -fsSL https://raw.githubusercontent.com/growhaleystudio-create/MonitorWP/main/docker-compose.yml -o docker-compose.yml

echo -e "${GREEN}⚡ Starting WhalePod containers...${NC}"
$COMPOSE_CMD up -d

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 WhalePod successfully installed!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "🌐 Access Dashboard: ${TEAL}http://localhost:3000${NC}"
echo -e "🔑 Default Username: ${YELLOW}admin${NC}"
echo -e "🔑 Default Password: ${YELLOW}admin${NC}"
echo -e "${GREEN}======================================================${NC}\n"

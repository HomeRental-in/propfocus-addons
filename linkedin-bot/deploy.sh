#!/bin/bash
# LinkedIn Bot — EC2 deploy script
# Usage: bash deploy.sh
# Supports: Ubuntu 22.04+ / Debian (apt), Amazon Linux 2 / Amazon Linux 2023 / RHEL-family (dnf/yum)
# Assumes: n8n may already be running elsewhere

set -e
echo "==> LinkedIn bot deploy starting..."

install_chromium_system_deps() {
  echo "==> Installing Chromium system dependencies..."
  if command -v apt-get &> /dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y \
      libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
      libgbm1 libasound2 libxshmfence1 fonts-liberation \
      libappindicator3-1 xdg-utils wget ca-certificates
  elif command -v dnf &> /dev/null || command -v yum &> /dev/null; then
    PM=dnf
    command -v dnf &> /dev/null || PM=yum
    sudo "$PM" install -y \
      nss atk at-spi2-atk cups-libs gtk3 libXcomposite libXcursor libXdamage \
      libXext libXi libXrandr libXScrnSaver libXtst pango alsa-lib mesa-libgbm \
      libxkbcommon libdrm wget ca-certificates liberation-fonts xdg-utils
  else
    echo "ERROR: No apt-get, dnf, or yum found."
    echo "This script supports Ubuntu/Debian or Amazon Linux / RPM-based AMIs."
    echo "Either switch to Ubuntu 22.04 on EC2 or install a package manager manually."
    exit 1
  fi
}

install_nodejs_20() {
  if command -v node &> /dev/null; then
    echo "==> Node.js already installed: $(node -v)"
    return 0
  fi
  echo "==> Installing Node.js 20..."
  if command -v apt-get &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  elif command -v dnf &> /dev/null || command -v yum &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    if command -v dnf &> /dev/null; then
      sudo dnf install -y nodejs
    else
      sudo yum install -y nodejs
    fi
  else
    echo "ERROR: Cannot install Node.js (need apt-get or dnf/yum)."
    exit 1
  fi
}

install_chromium_system_deps
install_nodejs_20

# ── 3. PM2 ───────────────────────────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "==> Installing PM2..."
  sudo npm install -g pm2
else
  echo "==> PM2 already installed"
fi

# ── 4. Project directory ─────────────────────────────────────────────────────
echo "==> Setting up ~/linkedin-bot..."
mkdir -p ~/linkedin-bot
cd ~/linkedin-bot

# ── 5. npm install ───────────────────────────────────────────────────────────
echo "==> Installing npm packages..."
npm install

# ── 6. Playwright Chromium ───────────────────────────────────────────────────
echo "==> Installing Playwright Chromium..."
npx playwright install chromium
# install-deps only maps to apt (Ubuntu/Debian); RPM deps are installed above
if command -v apt-get &> /dev/null; then
  npx playwright install-deps chromium
fi

# ── 7. .env ──────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo "==> .env created from .env.example"
fi

# ── 8. Start with PM2 ────────────────────────────────────────────────────────
echo "==> Starting with PM2..."
pm2 delete linkedin-bot 2>/dev/null || true
pm2 start server.js --name linkedin-bot
pm2 save
pm2 startup | grep "sudo" | bash 2>/dev/null || true

echo ""
echo "✓ Deploy complete"
echo ""
echo "── Next steps ───────────────────────────────────────────────────────────"
echo ""
echo "1. Health check:"
echo "   curl http://localhost:3000/health"
echo ""
echo "2. Login account1:"
echo "   curl -X POST http://localhost:3000/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"acc1@email.com\",\"password\":\"pass1\",\"account\":\"account1\"}'"
echo ""
echo "3. Login account2:"
echo "   curl -X POST http://localhost:3000/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"acc2@email.com\",\"password\":\"pass2\",\"account\":\"account2\"}'"
echo ""
echo "4. Check active accounts:"
echo "   curl http://localhost:3000/accounts"
echo ""
echo "5. PM2 logs:"
echo "   pm2 logs linkedin-bot"

#!/bin/bash
# ─────────────────────────────────────────────────────────────
# PETZ Platform — Post-Create Setup
# Runs ONCE when the Codespace container is first created.
# Installs MySQL, creates the database, pre-resolves dependencies.
# ─────────────────────────────────────────────────────────────

set -e

echo ""
echo "🐾 ─────────────────────────────────────────"
echo "   PETZ — Codespace Setup"
echo "─────────────────────────────────────────────"
echo ""

# ── Install MySQL Server ──────────────────────────────────────
echo "📦 Installing MySQL Server..."
sudo apt-get update -qq
sudo apt-get install -y -qq mysql-server
echo "   ✅ MySQL installed"
echo ""

# ── Start MySQL and create database ──────────────────────────
echo "🗄️  Starting MySQL and creating database..."
sudo service mysql start

# Wait for MySQL to be ready
TRIES=0
until sudo mysqladmin ping --silent 2>/dev/null || (( TRIES++ >= 15 )); do
  sleep 2
done

# Create database and set root to passwordless login
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" 2>/dev/null || true
sudo mysql -e "CREATE DATABASE IF NOT EXISTS petzdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "   ✅ Database 'petzdb' created"
echo ""

# ── Pre-install frontend dependencies ─────────────────────────
echo "📦 Installing Angular dependencies (npm install)..."
cd /workspaces/petz/petz-frontend
npm install --silent
echo "   ✅ Frontend dependencies ready"
echo ""

# ── Pre-resolve backend dependencies ─────────────────────────
echo "📦 Resolving Maven dependencies..."
cd /workspaces/petz/petz-backend
mvn dependency:resolve -q 2>/dev/null || true
echo "   ✅ Backend dependencies ready"
echo ""

echo "✅ ─────────────────────────────────────────"
echo "   Setup complete!"
echo "   Run: bash .devcontainer/startup.sh"
echo "─────────────────────────────────────────────"
echo ""

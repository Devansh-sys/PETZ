#!/bin/bash
# ─────────────────────────────────────────────────────────────
# PETZ Platform — Codespace Startup Script
# Boots MySQL (local) + Spring Boot (port 8081) + Angular (port 4200)
# Usage: bash .devcontainer/startup.sh
# ─────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "🐾 ─────────────────────────────────────────"
echo "   PETZ Platform — Codespace Dev Server"
echo "   ─────────────────────────────────────────"
echo ""

# ── MySQL ─────────────────────────────────────────────────────
echo "🗄️  Ensuring MySQL is running..."

# Start MySQL service if not already running
sudo service mysql start 2>/dev/null || true

# Wait for MySQL to be ready (max 30s)
TRIES=0
until mysqladmin ping -u root --silent 2>/dev/null || (( TRIES++ >= 15 )); do
  sleep 2
done

# Create the database if it doesn't exist
mysql -u root -e "CREATE DATABASE IF NOT EXISTS petzdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
echo "   ✅ MySQL is up — database 'petzdb' ready"
echo ""

# ── Backend ──────────────────────────────────────────────────
echo "🚀 Starting Spring Boot backend..."
echo "   Profile : codespace (MySQL localhost)"
echo "   Port    : 8081"
echo ""

cd "$ROOT/petz-backend"
mvn spring-boot:run \
  -Dspring-boot.run.profiles=codespace \
  > /tmp/petz-backend.log 2>&1 &
BACKEND_PID=$!

# Wait until the backend responds (max 120s)
echo "   ⏳ Waiting for backend to be ready..."
TRIES=0
until curl -sf "http://localhost:8081/api/v1/public/health" > /dev/null 2>&1 \
   || curl -sf "http://localhost:8081/api/v1/actuator/health" > /dev/null 2>&1 \
   || (( TRIES++ >= 60 )); do
  sleep 2
done

if kill -0 $BACKEND_PID 2>/dev/null; then
  echo "   ✅ Backend is up!"
else
  echo "   ❌ Backend failed to start. Check /tmp/petz-backend.log"
  tail -30 /tmp/petz-backend.log
  exit 1
fi

echo ""

# ── Frontend ─────────────────────────────────────────────────
echo "🌐 Starting Angular frontend..."
echo "   Port : 4200"
echo ""

cd "$ROOT/petz-frontend"
# --host 0.0.0.0   → makes it reachable via Codespace forwarded URL
# --disable-host-check → prevents "Invalid Host header" errors in Codespace
npx ng serve --host 0.0.0.0 --port 4200 --disable-host-check &
FRONTEND_PID=$!

echo ""
echo "✅ ─────────────────────────────────────────"
echo "   All services are running!"
echo ""
echo "   🗄️  MySQL     → localhost:3306  (DB: petzdb)"
echo "   📡 Backend   → Ports tab → port 8081"
echo "   🌍 Frontend  → Ports tab → port 4200"
echo ""
echo "   Logs:"
echo "   Backend  : tail -f /tmp/petz-backend.log"
echo "   Frontend : output above (this terminal)"
echo "─────────────────────────────────────────────"
echo ""

# Keep the script alive so both processes stay up
wait $BACKEND_PID $FRONTEND_PID

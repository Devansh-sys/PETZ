#!/bin/bash
# ─────────────────────────────────────────────────────────────
# PETZ Platform — Codespace Startup Script
# Boots Spring Boot (H2, port 8081) + Angular (port 4200)
# Usage: bash .devcontainer/startup.sh
# ─────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "🐾 ─────────────────────────────────────────"
echo "   PETZ Platform — Codespace Dev Server"
echo "   ─────────────────────────────────────────"
echo ""

# ── Backend ──────────────────────────────────────────────────
echo "🚀 Starting Spring Boot backend..."
echo "   Profile : codespace (H2 in-memory DB)"
echo "   Port    : 8081"
echo ""

cd "$ROOT/petz-backend"
mvn spring-boot:run \
  -Dspring-boot.run.profiles=codespace \
  > /tmp/petz-backend.log 2>&1 &
BACKEND_PID=$!

# Wait until the backend responds (max 90s)
echo "   ⏳ Waiting for backend to be ready..."
TRIES=0
until curl -sf "http://localhost:8081/api/v1/public/health" > /dev/null 2>&1 \
   || curl -sf "http://localhost:8081/api/v1/actuator/health" > /dev/null 2>&1 \
   || (( TRIES++ >= 45 )); do
  sleep 2
done

if kill -0 $BACKEND_PID 2>/dev/null; then
  echo "   ✅ Backend is up!"
else
  echo "   ❌ Backend failed to start. Check /tmp/petz-backend.log"
  cat /tmp/petz-backend.log | tail -30
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
echo "   Both services are running!"
echo ""
echo "   📡 Backend  → Ports tab → port 8081"
echo "   🌍 Frontend → Ports tab → port 4200"
echo ""
echo "   Logs:"
echo "   Backend  : tail -f /tmp/petz-backend.log"
echo "   Frontend : output above (this terminal)"
echo "─────────────────────────────────────────────"
echo ""

# Keep the script alive so both processes stay up
wait $BACKEND_PID $FRONTEND_PID

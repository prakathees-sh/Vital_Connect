#!/bin/bash
set -e

echo "🩸 Starting Vital Connect Platform..."

# 1. Start Python FastAPI Backend
cd /home/arch/Documents/vital-connect4/backend
echo "Starting FastAPI Backend on http://localhost:8000..."
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# 2. Start Next.js Frontend
cd /home/arch/Documents/vital-connect4/frontend
echo "Starting Next.js Frontend on http://localhost:3000/..."
npm run start &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

echo "✅ Vital Connect is operational!"
echo "   Frontend: http://localhost:3000/splash"
echo "   Backend API Docs: http://localhost:8000/docs"

wait

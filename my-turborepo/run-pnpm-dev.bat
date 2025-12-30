@echo off
title Run pmpn dev

echo Cleaning up ports 3000 and 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul

echo Starting Frontend (Next.js)...
start "Frontend - Next.js" cmd /k "cd apps/web && pnpm dev"

echo Starting Backend (Python API)...
start "Backend - FastAPI" cmd /k "cd apps/py-api && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
REM start "Backend - FastAPI" cmd /k "cd apps/py-api && conda run -n my-env uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
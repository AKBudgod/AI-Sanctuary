@echo off
title K'LA OS - App UI Launcher

REM Ensure we are in the directory where the script resides
cd /d "%~dp0"

echo [Booting UI] Starting the AI Sanctuary Next.js App (Port 3000)...
start "Sanctuary React Server" /min cmd /k "npm run dev"

echo [Booting Local API Proxy] Starting Cloudflare Wrangler API layer (Port 8788)...
start "Sanctuary API Router" /min cmd /k "npx wrangler pages dev --proxy 3000"

echo [Booting Nodes] Spinning up DeepSeek Brain and Coqui XTTS...
start "Sanctuary Local Nodes" /min cmd /k "start-csm.bat"

echo [Connecting] Waiting 25 seconds for all servers and APIs to fully load...
timeout /t 25 /nobreak >nul

echo [Launch] Opening K'LA Dashboard...
REM Open pointing to the Wrangler proxy (8788) so API endpoints correctly resolve!
start chrome "http://localhost:8788" --start-maximized

exit

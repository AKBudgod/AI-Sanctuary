@echo off
title Sanctuary — Coqui Voice Node (Port 8001)
color 0A
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   SANCTUARY COQUI XTTS v2 VOICE NODE    ║
echo  ║   Port 8001  ^|  Local Hardware Synth    ║
echo  ╚══════════════════════════════════════════╝
echo.

REM ── Resolve paths ──────────────────────────────────────────────────────────
set "REPO=%~dp0csm-repo"
set "VENV_PYTHON=%~dp0csm-repo\.venv\Scripts\python.exe"

REM ── Sanity check: make sure venv Python exists ─────────────────────────────
IF NOT EXIST "%VENV_PYTHON%" (
    echo  [ERROR] Virtual environment not found at:
    echo          %VENV_PYTHON%
    echo.
    echo  Fix: Run start-csm.bat once to create the venv, then retry.
    pause
    exit /b 1
)

echo  [OK] Venv Python: %VENV_PYTHON%
echo.

REM ── Kill any old instance on port 8001 ────────────────────────────────────
echo  [Node] Clearing port 8001...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8001 " ^| findstr "LISTENING" 2^>nul') do (
    echo  [Node] Killing old process PID %%P...
    taskkill /F /PID %%P >nul 2>&1
)

REM ── Launch Coqui Voice Server (Background) ──────────────────────────────
echo  [Node] Starting Coqui XTTS v2 voice server on Port 8001...
start "Coqui Voice Node" cmd /k "cd /d "%REPO%" && "%VENV_PYTHON%" cloner.py"

echo  [Node] First launch downloads the XTTS model (~2 GB) — wait for "READY" message.
echo.

REM ── Launch Neural Hub Bridge (Foreground) ───────────────────────────────
echo  [Node] Starting Sanctuary Neural Hub Bridge on Port 8000...
echo  [Node] The Cloudflare tunnel routes through this port.
echo.
echo  ─────────────────────────────────────────────────────
echo   Test URL (once running):
echo     http://127.0.0.1:8001/docs   ← Local Swagger UI
echo     https://node.ai-sanctuary.online/api/health ← External Bridge
echo  ─────────────────────────────────────────────────────
echo.
cd /d "%REPO%"
"%VENV_PYTHON%" neural_hub.py

pause

@echo off
title Sanctuary - Local Cloudflare Network
color 0D
echo.
echo  ======================================================
echo   SANCTUARY TUNNEL (FOREGROUND MODE)
echo  ======================================================
echo.
echo  [1] Stopping any frozen background Windows Services...
net stop Cloudflared >nul 2>&1
taskkill /F /IM cloudflared.exe /T >nul 2>&1

echo  [2] Starting Sanctuary Node Direct Connection...
echo  (Leave this black window open to keep the network online!)
echo.
echo  ─────────────────────────────────────────────────────
echo   Waiting for connection...
"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel run sanctuary-node
pause

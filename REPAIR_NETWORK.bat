@echo off
title Sanctuary - Cloudflare Network Repair
color 0B
echo.
echo  ======================================================
echo   SANCTUARY TUNNEL REPAIR PROTOCOL 
echo  ======================================================
echo.
echo  [1] Force-killing stuck Cloudflare agent processes...
taskkill /F /IM cloudflared.exe /T >nul 2>&1
net stop Cloudflared >nul 2>&1

echo  [2] Uninstalling broken remote configuration...
"C:\Program Files (x86)\cloudflared\cloudflared.exe" service uninstall

echo  [3] Injecting configuration into Windows Secure Profile...
mkdir "C:\Windows\System32\config\systemprofile\.cloudflared" 2>nul
copy /Y "C:\Users\Weed j\.cloudflared\config.yml" "C:\Windows\System32\config\systemprofile\.cloudflared\" >nul
copy /Y "C:\Users\Weed j\.cloudflared\*.json" "C:\Windows\System32\config\systemprofile\.cloudflared\" >nul

echo  [4] Re-installing Cloudflare Engine...
"C:\Program Files (x86)\cloudflared\cloudflared.exe" service install

echo  [5] Rebooting Sanctuary Network...
net start Cloudflared

echo.
echo  DONE! You can now safely close this window.
echo  Test the connection: https://node.ai-sanctuary.online/api/health
echo.
pause

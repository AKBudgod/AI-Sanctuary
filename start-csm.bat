@echo off
title K'LA OS - Sanctuary Local Node Launcher
echo.
echo  =================================
echo   Sanctuary Local Node Launcher
echo  =================================
echo.

cd /d "%~dp0csm-repo"

REM Step 1: Set up venv
IF NOT EXIST ".venv" (
    echo [Setup] Creating virtual environment...
    python -m venv .venv
    call ".venv\Scripts\activate.bat"
    echo [Setup] Installing dependencies...
    pip install --upgrade pip
    pip install -r requirements.txt
    pip install SpeechRecognition pyaudio pygame requests
    echo OK > .venv_initialized
) ELSE (
    call ".venv\Scripts\activate.bat"
    IF NOT EXIST ".venv_initialized" (
        echo [Setup] Verifying dependencies...
        pip install -r requirements.txt
        pip install SpeechRecognition pyaudio pygame requests
        echo OK > .venv_initialized
    ) ELSE (
        echo [Setup] Environment ready. Skipping dependency check.
    )
)

REM Step 2: Check Ollama / DeepSeek
echo.
echo [Node Check] Verifying Ollama is running...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
IF %errorlevel% NEQ 0 (
    echo.
    echo  ERROR: Ollama is NOT running!
    echo     - Please start Ollama first from your system tray, or run: ollama serve
    echo     - Then pull the model if needed: ollama pull deepseek-r1:1.5b
    echo.
    pause
    exit /b 1
)
echo [Node Check] Ollama / DeepSeek is online.

REM Step 3: Start Coqui Voice Node in background
echo.
echo [Node] Starting Coqui XTTS v2 Voice Server on port 8001...
start "Coqui Voice Node" cmd /k "cd /d "%~dp0csm-repo" && call .venv\Scripts\activate.bat && python cloner.py"

REM Step 4: Wait for Coqui to warm up
echo [Node] Waiting 10s for Coqui to initialize model...
timeout /t 10 /nobreak >nul

REM Step 5: Start Neural Hub Bridge (Port 8000)
echo [Node] Starting Unified Neural Hub Bridge on port 8000...
start "Sanctuary Neural Hub" cmd /k "cd /d "%~dp0csm-repo" && call .venv\Scripts\activate.bat && python neural_hub.py"

REM Step 6: Start K'LA OS Agent
echo [Node] Launching K'LA OS Agent (DeepSeek R1 1.5B brain)...
echo.
cd /d "%~dp0csm-repo"
python kayla_os_agent.py

pause

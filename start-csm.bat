@echo off
echo Starting Local CSM Voice Engine Setup...

cd csm-repo

IF NOT EXIST ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Installing requirements...
pip install -r requirements.txt
pip install triton-windows

echo Checking HuggingFace Login...
huggingface-cli whoami
if %errorlevel% neq 0 (
    echo ========================================================
    echo YOU MUST BE LOGGED INTO HUGGINGFACE TO DOWNLOAD THE MODEL
    echo Run: huggingface-cli login
    echo ========================================================
    pause
    exit /b
)

echo Starting FastAPI Server...
python server.py

pause

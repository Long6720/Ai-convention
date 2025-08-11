@echo off
echo 🤖 Setting up AI Code Review Agent...
echo ======================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH.
    echo Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

echo ✅ Python is available

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is not installed. Please install pip and try again.
    pause
    exit /b 1
)

echo ✅ pip is available

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ✅ .env file created
    echo ⚠️  Please edit .env file and add your OpenAI API key
) else (
    echo ✅ .env file already exists
)

REM Create chroma_db directory
if not exist "chroma_db" (
    echo 📁 Creating chroma_db directory...
    mkdir chroma_db
    echo ✅ chroma_db directory created
) else (
    echo ✅ chroma_db directory already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env file and add your OpenAI API key
echo 2. Run the test script: python test_agent.py
echo 3. Start the server: python run.py
echo.
echo For more information, see README.md
pause

@echo off
REM =======================================================
REM Start Local Development Server (Windows)
REM =======================================================

echo Starting local server...
echo.
echo Note: Supabase requires HTTPS or localhost
echo Opening http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000


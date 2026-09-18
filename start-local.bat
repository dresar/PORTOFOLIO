@echo off
setlocal
chcp 65001 >nul
title Portofolio Eka Syarif Maulana - Localhost Runner
cd /d "%~dp0"

echo =======================================================
echo   PORTOFOLIO LOCALHOST RUNNER (FULLSTACK)
echo   Backend Server : http://localhost:3004
echo   Frontend Vite  : http://localhost:8084
echo   Media Admin    : http://localhost:8084/admin/media
echo =======================================================
echo.

echo [1/2] Menyiapkan browser lokal ke Media Admin...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:8084/admin/media"

echo [2/2] Menjalankan server backend dan frontend (npm run dev)...
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [Pemberitahuan] Server berhenti atau terjadi error.
)

pause

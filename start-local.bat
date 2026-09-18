@echo off
chcp 65001 >nul
title Portofolio Eka Syarif Maulana - Localhost Runner
cd /d "%~dp0"

echo =======================================================
echo   PORTOFOLIO - RUNNER LOCALHOST (FULLSTACK)
echo   API Server     : http://localhost:3004
echo   Frontend Vite  : http://localhost:8084
echo   Media Admin    : http://localhost:8084/admin/media
echo =======================================================
echo.

:: Tutup port 3004 & 8084 jika masih ada proses lama yang menggantung
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3004" ^| findstr "LISTENING"') do (
    echo [Info] Menutup proses lama di port 3004 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8084" ^| findstr "LISTENING"') do (
    echo [Info] Menutup proses lama di port 8084 (PID: %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

echo [1/2] Menyiapkan browser lokal...
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:8084/admin/media"

echo [2/2] Menjalankan server backend & frontend (npm run dev)...
echo.
npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [Error] Terjadi kesalahan saat menjalankan server lokal.
    pause
)

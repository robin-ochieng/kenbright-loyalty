@echo off
REM Kenbright 360 Database Backup Script (Windows)
set BACKUP_DIR=..\backups\daily
set LOG_DIR=..\backups\logs

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

for /f "tokens=1-3 delims=/" %%a in ('date /t') do set DATE=%%c%%a%%b
for /f "tokens=1-2 delims=:" %%a in ('time /t') do set TIME=%%a%%b
set TIMESTAMP=%DATE%_%TIME: =0%

echo Starting backup at %DATE% %TIME% > "%LOG_DIR%\backup_%TIMESTAMP%.log"

"C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -h localhost -U postgres -d kenbright_360 -F c -b -v -f "%BACKUP_DIR%\kenbright_360_%TIMESTAMP%.backup" >> "%LOG_DIR%\backup_%TIMESTAMP%.log" 2>&1

if %errorlevel% equ 0 (
    echo Backup completed successfully >> "%LOG_DIR%\backup_%TIMESTAMP%.log"
    
    REM Cleanup old backups (keep 7 days)
    forfiles /p "%BACKUP_DIR%" /m "kenbright_360_*.backup" /d -7 /c "cmd /c del @path"
) else (
    echo Backup FAILED >> "%LOG_DIR%\backup_%TIMESTAMP%.log"
    exit /b 1
)

@echo off
echo =========================================
echo   Deploying to VPS 187.124.137.134
echo =========================================

echo [1/4] Pulling latest code on VPS...
ssh -o StrictHostKeyChecking=no root@187.124.137.134 "cd /opt/BESC && git pull origin main"

echo [2/4] Running migration 016 on database...
ssh -o StrictHostKeyChecking=no root@187.124.137.134 "cd /opt/BESC && docker compose exec -T db mysql -u root -pBescSecureRoot2026! competition_platform < backend/database/migrations/016_alter_teams_add_ig_tiktok.sql"

echo [3/4] Rebuilding and restarting containers...
ssh -o StrictHostKeyChecking=no root@187.124.137.134 "cd /opt/BESC && docker compose --env-file .env up -d --build"

echo [4/4] Checking status...
ssh -o StrictHostKeyChecking=no root@187.124.137.134 "cd /opt/BESC && docker compose ps"

echo.
echo =========================================
echo   Deploy Complete!
echo =========================================
echo   Website: https://beschimbio.online
echo =========================================
pause

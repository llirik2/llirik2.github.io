@echo off
chcp 65001 > nul
echo 🚀 Начинаю автоматическое обновление сайта на GitHub...

:: 1. Добавляем все новые и измененные файлы
git add .

:: 2. Создаем коммит с текущей датой и временем
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%a-%%b-%%c)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
git commit -m "Auto-update: %mydate% %mytime%"

:: 3. Отправляем изменения в репозиторий
git push origin main

echo.
echo ✅ Всё готово! Сайт успешно обновлен.
pause
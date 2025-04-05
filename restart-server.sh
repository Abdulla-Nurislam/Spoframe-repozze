#!/bin/bash

# Проверка работоспособности сервера
check_server() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
    if [ "$response" != "200" ]; then
        echo "$(date) - Сервер не отвечает (код: $response). Перезапуск..."
        restart_server
    else
        echo "$(date) - Сервер работает нормально."
    fi
}

# Перезапуск сервера
restart_server() {
    echo "$(date) - Останавливаю сервер..."
    pkill -f "node server.js"
    sleep 2
    echo "$(date) - Запускаю сервер..."
    nohup node server.js > server.log 2>&1 &
    echo "$(date) - Сервер перезапущен."
}

# Основной цикл проверки
while true; do
    check_server
    sleep 300 # Проверка каждые 5 минут
done 
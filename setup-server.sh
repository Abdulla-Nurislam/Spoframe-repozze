#!/bin/bash

# Скрипт автоматизации настройки сервера для Spoframe
# Этот скрипт должен запускаться от имени root или с sudo
# Использование: sudo bash setup-server.sh

# Проверка прав суперпользователя
if [ "$(id -u)" != "0" ]; then
    echo "Этот скрипт должен быть запущен с правами суперпользователя (root)"
    echo "Пожалуйста, используйте: sudo bash setup-server.sh"
    exit 1
fi

# Переменные
DOMAIN="spoframe.com"
EMAIL="admin@spoframe.com"
APP_DIR="/var/www/spoframe"
BACKUP_DIR="/var/backups/spoframe"
NODE_VERSION="20.x"
PORT="3001"

# Функции для логирования
log() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

log_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# Запрос параметров от пользователя
read -p "Введите домен (по умолчанию: $DOMAIN): " input_domain
DOMAIN=${input_domain:-$DOMAIN}

read -p "Введите email для SSL-сертификата (по умолчанию: $EMAIL): " input_email
EMAIL=${input_email:-$EMAIL}

read -p "Введите порт для Node.js приложения (по умолчанию: $PORT): " input_port
PORT=${input_port:-$PORT}

log "Запуск установки сервера для $DOMAIN на порту $PORT"

# 1. Обновление системы
log "Обновление системы..."
apt update && apt upgrade -y

# 2. Установка базовых пакетов
log "Установка базовых пакетов..."
apt install -y curl wget git htop nano unzip zip build-essential software-properties-common

# 3. Настройка времени
log "Настройка времени..."
timedatectl set-timezone Europe/Moscow
apt install -y chrony
systemctl enable chrony
systemctl start chrony

# 4. Установка Node.js
log "Установка Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION | bash -
apt install -y nodejs
npm install -g pm2
pm2 startup

# 5. Установка и настройка Nginx
log "Установка и настройка Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# 6. Настройка брандмауэра
log "Настройка брандмауэра..."
apt install -y ufw
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# 7. Создание конфигурации Nginx
log "Создание конфигурации Nginx для $DOMAIN..."
cat > /etc/nginx/sites-available/spoframe.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Статические файлы напрямую через Nginx
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        root $APP_DIR/dist;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
    
    # Обработка ошибок
    error_page 404 /404.html;
    location = /404.html {
        root $APP_DIR/dist;
    }
    
    error_page 500 502 503 504 /500.html;
    location = /500.html {
        root $APP_DIR/dist;
    }
}
EOF

# Активация конфигурации Nginx
ln -sf /etc/nginx/sites-available/spoframe.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 8. Установка и настройка защиты с fail2ban
log "Установка и настройка fail2ban..."
apt install -y fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
EOF
systemctl enable fail2ban
systemctl restart fail2ban

# 9. Установка SQLite
log "Установка SQLite..."
apt install -y sqlite3

# 10. Создание директорий для приложения
log "Создание директорий для приложения..."
mkdir -p $APP_DIR/data
mkdir -p $BACKUP_DIR

# 11. Настройка SSL с Let's Encrypt
log "Установка Certbot для Let's Encrypt..."
apt install -y certbot python3-certbot-nginx
log_warning "SSL будет настроен после указания DNS-записей на этот сервер."
log_warning "После настройки DNS выполните: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

# 12. Создание скрипта для бэкапа
log "Создание скрипта для бэкапа..."
cat > /usr/local/bin/backup-spoframe.sh << EOF
#!/bin/bash

DATE=\$(date +"%Y-%m-%d")
BACKUP_DIR="$BACKUP_DIR"
APP_DIR="$APP_DIR"
DB_FILE="spoframe.db"

# Архивирование кода
tar -czf "\$BACKUP_DIR/code_\$DATE.tar.gz" -C "\$APP_DIR" .

# Копирование базы данных
cp "\$APP_DIR/data/\$DB_FILE" "\$BACKUP_DIR/db_\$DATE.sqlite" 2>/dev/null || echo "База данных не найдена!"

# Удаление старых бэкапов (старше 30 дней)
find "\$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +30 -delete
find "\$BACKUP_DIR" -type f -name "*.sqlite" -mtime +30 -delete

# Запись лога
echo "Backup completed: \$DATE" >> "\$BACKUP_DIR/backup.log"
EOF

chmod +x /usr/local/bin/backup-spoframe.sh

# Добавление в cron
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-spoframe.sh") | crontab -

# 13. Создание скрипта мониторинга
log "Создание скрипта мониторинга..."
cat > /usr/local/bin/monitor-spoframe.sh << EOF
#!/bin/bash

# Логирование
LOG_FILE="/var/log/spoframe-monitor.log"

# Функция для записи логов
log() {
    echo "\$(date '+%Y-%m-%d %H:%M:%S') - \$1" >> "\$LOG_FILE"
    echo "\$(date '+%Y-%m-%d %H:%M:%S') - \$1"
}

# Проверка доступности API
check_api() {
    response=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health)
    if [ "\$response" != "200" ]; then
        log "API недоступен (код: \$response). Перезапуск..."
        restart_app
    else
        log "API доступен."
    fi
}

# Перезапуск приложения
restart_app() {
    log "Перезапуск приложения..."
    pm2 restart spoframe
    sleep 10
    
    # Проверка после перезапуска
    response=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health)
    if [ "\$response" != "200" ]; then
        log "ОШИБКА: API все еще недоступен после перезапуска!"
    else
        log "Приложение успешно перезапущено."
    fi
}

# Проверка использования памяти
check_memory() {
    memory_usage=\$(pm2 jlist | grep -o '"memory":[0-9]*' | grep -o '[0-9]*' | head -1)
    if [ -n "\$memory_usage" ] && [ "\$memory_usage" -gt 1000000000 ]; then
        log "Высокое использование памяти: \$memory_usage байт. Перезапуск..."
        restart_app
    fi
}

# Основная логика
log "Запуск проверки..."
check_api
check_memory
log "Проверка завершена."
EOF

chmod +x /usr/local/bin/monitor-spoframe.sh

# Добавление в cron
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-spoframe.sh") | crontab -

# 14. Настройка логов и ротации
log "Настройка ротации логов..."
cat > /etc/logrotate.d/spoframe << EOF
/var/log/spoframe-*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# 15. Автоматические обновления безопасности
log "Настройка автообновлений..."
apt install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

# 16. Настройка системного пользователя
log "Настройка системного пользователя для приложения..."
useradd -m -s /bin/bash spoframe
chown -R spoframe:spoframe $APP_DIR
echo "Пользователь spoframe создан"

# 17. Создание инструкций по развертыванию
cat > /root/spoframe-deployment.txt << EOF
=== Инструкции по развертыванию Spoframe ===

1. Клонирование репозитория:
   cd $APP_DIR
   git clone https://github.com/Abdulla-Nurislam/Spoframe-repozze.git .

2. Установка зависимостей:
   npm install

3. Сборка проекта:
   npm run build

4. Настройка окружения:
   cp .env.example .env
   nano .env  # Отредактируйте файл .env с вашими настройками

5. Запуск приложения через PM2:
   pm2 start src/server/server.js --name spoframe
   pm2 save

6. Настройка SSL (если еще не настроен):
   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

7. Проверка работы приложения:
   curl http://localhost:$PORT/api/health

Для мониторинга используйте:
- pm2 monit
- htop
- tail -f /var/log/spoframe-monitor.log

=== Поздравляем! Настройка сервера для Spoframe завершена ===
EOF

log_success "Настройка сервера завершена!"
log_success "Инструкции по развертыванию приложения находятся в файле: /root/spoframe-deployment.txt"
log "IP-адрес сервера: $(curl -s ifconfig.me)"
log "Не забудьте настроить DNS-записи для домена $DOMAIN и запустить сертификаты Let's Encrypt"

exit 0 
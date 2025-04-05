require('dotenv').config();
// Устанавливаем режим разработки, если не задан
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const i18n = require('./i18n');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto'); // Добавляем crypto для генерации случайных токенов
const app = express();

// Настройка защиты заголовков с помощью helmet
// Отключаем CSP для разработки
if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://www.googletagmanager.com", "https://mc.yandex.ru"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
                imgSrc: ["'self'", "data:", "https://mc.yandex.ru"],
                fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
                connectSrc: ["'self'", "https://api.stripe.com"],
                frameSrc: ["'self'", "https://js.stripe.com"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        xssFilter: true,
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));
} else {
    // Для разработки используем минимальную защиту
    app.use(helmet({
        contentSecurityPolicy: false,
        xssFilter: true,
        noSniff: true
    }));
}

// Настройка лимитов запросов для защиты от DDoS
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // лимит запросов с одного IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много запросов, пожалуйста, попробуйте позже' }
});

// Применяем лимит запросов к API маршрутам
app.use('/api/', apiLimiter);

// Более строгий лимит для авторизации
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 10, // 10 попыток в час
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Слишком много попыток входа, пожалуйста, попробуйте позже' }
});

// Применяем строгий лимит к маршрутам авторизации
app.use('/api/auth/', authLimiter);

// Подключение к базе данных
const db = new sqlite3.Database('users.db');

// Middleware для обработки JSON и форм
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init);

// Middleware для определения языка
app.use((req, res, next) => {
    // Определяем язык из параметра запроса, куки или заголовка Accept-Language
    const lang = req.query.lang || req.cookies.locale || req.acceptsLanguages('ru', 'en') || 'ru';
    
    // Устанавливаем язык
    req.setLocale(lang);
    
    // Устанавливаем куки с языком, если его нет
    if (!req.cookies.locale) {
        res.cookie('locale', lang, { maxAge: 900000, httpOnly: true });
    }
    
    next();
});

// API для смены языка
app.get('/api/language/:lang', (req, res) => {
    const lang = req.params.lang;
    let referer = req.headers.referer || '/';
    
    // Заменяем https на http для локальной разработки
    referer = referer.replace('https://', 'http://');
    
    if (['ru', 'en'].includes(lang)) {
        res.cookie('locale', lang, { maxAge: 900000, httpOnly: true });
        res.redirect(referer);
    } else {
        res.status(400).json({ success: false, message: 'Unsupported language' });
    }
});

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Требуется авторизация' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Недействительный или истекший токен' });
        }
        req.user = user;
        next();
    });
};

// Настройка кэширования для статических файлов
const cacheTime = 86400000 * 30; // 30 дней

// Обрабатываем статические файлы из корня проекта
app.use(express.static(__dirname, {
    maxAge: cacheTime,
    setHeaders: (res, path) => {
        // Для HTML файлов не используем кэширование
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(css|js|jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            // Для статических ресурсов используем кэширование
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год
        }
    }
}));

// Существующий код для public директории
app.use('/public', express.static('public', {
    maxAge: cacheTime,
    setHeaders: (res, path) => {
        if (path.match(/\.(css|js|jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год
        }
    }
}));

// Добавляем маршруты для HTML-страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing Page.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'Product Catalog.html'));
});

// Добавляем маршрут с косой чертой в конце
app.get('/catalog/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Product Catalog.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'Product Detail.html'));
});

// Добавляем маршрут с косой чертой в конце
app.get('/product/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Product Detail.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'About Product.html'));
});

// Добавляем маршрут с косой чертой в конце
app.get('/about/', (req, res) => {
    res.sendFile(path.join(__dirname, 'About Product.html'));
});

app.get('/development-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'development-page.html'));
});

// Добавляем маршрут с косой чертой в конце
app.get('/development-page/', (req, res) => {
    res.sendFile(path.join(__dirname, 'development-page.html'));
});

// Создание таблицы пользователей при запуске
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email_verified BOOLEAN DEFAULT 0,
        verification_token TEXT,
        verification_token_expires TIMESTAMP,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMP,
        two_factor_enabled BOOLEAN DEFAULT 0,
        two_factor_code TEXT,
        two_factor_expires TIMESTAMP
    )
`);

// Создание таблицы доверенных устройств
db.run(`
    CREATE TABLE IF NOT EXISTS trusted_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        device_id TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
`);

// Создание таблицы подписчиков
db.run(`
    CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Создаем транспорт для отправки почты
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Функция для валидации входных данных
function validateInput(input, pattern) {
    if (typeof input !== 'string') return false;
    
    const patterns = {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        username: /^[a-zA-Z0-9_-]{3,20}$/,
        password: /^.{8,}$/,
        text: /^[a-zA-Z0-9\s.,!?()-_]{1,500}$/,
        id: /^\d+$/,
        productId: /^[a-zA-Z0-9-_]{1,50}$/
    };
    
    return patterns[pattern] ? patterns[pattern].test(input) : false;
}

// Middleware для валидации входных данных
function validateBody(schema) {
    return (req, res, next) => {
        const errors = [];
        
        for (const [field, pattern] of Object.entries(schema)) {
            if (req.body[field] && !validateInput(req.body[field], pattern)) {
                errors.push(`Недопустимое значение для поля ${field}`);
            }
        }
        
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        
        next();
    };
}

// Функция для генерации случайного токена
function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// Функция для отправки письма верификации
async function sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/verify-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Подтвердите свой email - Spoframe',
        html: `
            <h2>Добро пожаловать в Spoframe!</h2>
            <p>Для завершения регистрации, пожалуйста, подтвердите ваш email, нажав на кнопку ниже:</p>
            <div style="margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; font-weight: 500;">
                    Подтвердить Email
                </a>
            </div>
            <p>Или перейдите по этой ссылке: <a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Ссылка действительна в течение 24 часов.</p>
            <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
            <br>
            <p>С уважением,</p>
            <p>Команда Spoframe</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// Функция для отправки письма восстановления пароля
async function sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Восстановление пароля - Spoframe',
        html: `
            <h2>Восстановление пароля в Spoframe</h2>
            <p>Вы получили это письмо, потому что запросили восстановление пароля для вашей учетной записи.</p>
            <p>Для создания нового пароля, нажмите на кнопку ниже:</p>
            <div style="margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; font-weight: 500;">
                    Сбросить пароль
                </a>
            </div>
            <p>Или перейдите по этой ссылке: <a href="${resetUrl}">${resetUrl}</a></p>
            <p>Ссылка действительна в течение 1 часа.</p>
            <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
            <br>
            <p>С уважением,</p>
            <p>Команда Spoframe</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// API маршруты
app.post('/api/auth/register', validateBody({
    name: 'username',
    email: 'email',
    password: 'password'
}), async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Попытка регистрации:', { name, email });
    
    try {
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.get(checkUserQuery, [email], async (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка сервера при проверке пользователя',
                    details: 'Произошла ошибка при проверке пользователя'
                });
            }

            if (existingUser) {
                console.log('Пользователь уже существует:', email);
                return res.status(400).json({ 
                    status_code: 400,
                    error_type: 'user_exists',
                    message: 'Пользователь с таким email уже существует',
                    details: 'Пожалуйста, используйте другой email'
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const now = new Date().toISOString();
                const insertUserQuery = 'INSERT INTO users (username, email, password, registration_date) VALUES (?, ?, ?, ?)';
                db.run(insertUserQuery, [name, email, hashedPassword, now], function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ 
                            status_code: 500,
                            error_type: 'server_error',
                            message: 'Ошибка при создании пользователя',
                            details: 'Произошла ошибка при создании пользователя'
                        });
                    }
                    console.log('Пользователь успешно создан:', { id: this.lastID, name, email });
                    
                    // Генерируем токен верификации и отправляем письмо
                    const verificationToken = generateToken();
                    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 часа
                    db.run('UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?', 
                           [verificationToken, expires, this.lastID]);
                    sendVerificationEmail(email, verificationToken);
                    
                    res.status(201).json({ 
                        status_code: 201,
                        message: 'Регистрация успешна!'
                    });
                });
            } catch (hashError) {
                console.error('Hashing error:', hashError);
                res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка при обработке пароля',
                    details: 'Произошла ошибка при обработке пароля'
                });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Внутренняя ошибка сервера',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

app.post('/api/auth/login', validateBody({
    email: 'email',
    password: 'password'
}), async (req, res) => {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка сервера',
                    details: 'Произошла ошибка при попытке входа'
                });
            }
            if (!user) {
                return res.status(401).json({ 
                    status_code: 401,
                    error_type: 'authentication_error',
                    message: 'Неверный email или пароль',
                    details: 'Проверьте правильность ввода данных'
                });
            }

            // Проверяем, подтвержден ли email
            if (!user.email_verified) {
                return res.status(403).json({ 
                    status_code: 403,
                    error_type: 'verification_required',
                    message: 'Email не подтвержден',
                    details: 'Пожалуйста, подтвердите ваш email перед входом. Проверьте вашу почту или запросите повторную отправку письма верификации.'
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ 
                    status_code: 401,
                    error_type: 'authentication_error',
                    message: 'Неверный email или пароль',
                    details: 'Проверьте правильность ввода данных'
                });
            }

            // Проверяем, хочет ли пользователь запомнить устройство
            const rememberDevice = req.body.rememberDevice === true;
            
            // Получаем или генерируем deviceId
            let deviceId = req.cookies.device_id;
            if (!deviceId) {
                deviceId = generateDeviceId();
                res.cookie('device_id', deviceId, { httpOnly: true, maxAge: 3650 * 24 * 60 * 60 * 1000 }); // ~10 лет
            }
            
            try {
                // Проверяем, является ли устройство доверенным
                const isTrusted = await isTrustedDevice(user.id, deviceId, ipAddress);
                
                if (!isTrusted) {
                    // Если устройство не доверенное, отправляем код 2FA
                    const twoFactorCode = generate2FACode();
                    
                    // Сохраняем код в базе данных
                    await save2FACode(user.id, twoFactorCode);
                    
                    // Отправляем код на email
                    await send2FACode(user.email, twoFactorCode);
                    
                    // Возвращаем информацию о необходимости 2FA
                    return res.status(200).json({ 
                        status_code: 200,
                        requires_2fa: true,
                        user_id: user.id,
                        message: 'Требуется двухфакторная аутентификация. Код отправлен на ваш email.'
                    });
                }
                
                // Если устройство доверенное или 2FA не включено, создаем JWT токен
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
                
                res.json({ 
                    status_code: 200,
                    message: 'Вход выполнен успешно',
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email
                    },
                    token: token
                });
            } catch (verificationError) {
                console.error('Error during 2FA verification:', verificationError);
                return res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка при проверке устройства',
                    details: 'Произошла ошибка при проверке устройства'
                });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Ошибка при входе',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

// API для верификации 2FA кода
app.post('/api/auth/verify-2fa', validateBody({
    user_id: 'id',
    code: 'text'
}), async (req, res) => {
    const { user_id, code, rememberDevice } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    try {
        // Получаем информацию о пользователе
        db.get(
            'SELECT * FROM users WHERE id = ?',
            [user_id],
            async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ 
                        status_code: 500,
                        error_type: 'server_error',
                        message: 'Ошибка сервера',
                        details: 'Произошла ошибка при проверке кода'
                    });
                }
                
                if (!user) {
                    return res.status(404).json({ 
                        status_code: 404,
                        error_type: 'user_not_found',
                        message: 'Пользователь не найден',
                        details: 'Некорректный ID пользователя'
                    });
                }
                
                // Проверяем, не истек ли срок действия кода
                const now = new Date();
                const codeExpires = new Date(user.two_factor_expires);
                
                if (now > codeExpires) {
                    return res.status(400).json({ 
                        status_code: 400,
                        error_type: 'code_expired',
                        message: 'Истек срок действия кода',
                        details: 'Код подтверждения истек. Повторите попытку входа.'
                    });
                }
                
                // Проверяем правильность кода
                if (user.two_factor_code !== code) {
                    return res.status(400).json({ 
                        status_code: 400,
                        error_type: 'invalid_code',
                        message: 'Неверный код подтверждения',
                        details: 'Введенный код не совпадает с отправленным. Проверьте правильность ввода.'
                    });
                }
                
                // Получаем или генерируем deviceId
                let deviceId = req.cookies.device_id;
                if (!deviceId) {
                    deviceId = generateDeviceId();
                    res.cookie('device_id', deviceId, { httpOnly: true, maxAge: 3650 * 24 * 60 * 60 * 1000 }); // ~10 лет
                }
                
                // Если пользователь хочет запомнить устройство, добавляем его в список доверенных
                if (rememberDevice) {
                    db.run(
                        'INSERT INTO trusted_devices (user_id, device_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                        [user.id, deviceId, ipAddress, userAgent]
                    );
                }
                
                // Инвалидируем код 2FA
                db.run(
                    'UPDATE users SET two_factor_code = NULL, two_factor_expires = NULL WHERE id = ?',
                    [user.id]
                );
                
                // Создаем JWT токен
                const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
                
                res.json({ 
                    status_code: 200,
                    message: 'Вход выполнен успешно',
                    user: { 
                        id: user.id, 
                        username: user.username, 
                        email: user.email
                    },
                    token: token
                });
            }
        );
    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Ошибка при проверке кода',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

// Маршрут для страницы администратора
app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// API для получения списка пользователей
app.get('/api/users', (req, res) => {
    console.log('Запрос списка пользователей');
    const query = `
        SELECT id, username, email, registration_date 
        FROM users 
        ORDER BY registration_date DESC
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                status_code: 500,
                error_type: 'server_error',
                message: 'Ошибка при получении списка пользователей',
                details: 'Произошла ошибка при получении списка пользователей'
            });
        }
        console.log('Найдено пользователей:', rows.length);
        res.json({ 
            status_code: 200,
            users: rows
        });
    });
});

app.post('/api/subscription/subscribe', async (req, res) => {
    const { email } = req.body;

    try {
        db.run('INSERT INTO subscribers (email) VALUES (?)', [email]);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Добро пожаловать в Spoframe!',
            html: `
                <h2>Спасибо за подписку на Spoframe!</h2>
                <p>Мы рады приветствовать вас в нашем сообществе.</p>
                <p>Теперь вы будете получать новости о наших продуктах и специальные предложения.</p>
                <br>
                <p>С уважением,</p>
                <p>Команда Spoframe</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ 
            status_code: 200,
            success: true,
            message: 'Вы успешно подписались на рассылку!'
        });
    } catch (error) {
        console.error('Ошибка при подписке:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Ошибка при подписке на рассылку',
            details: 'Произошла ошибка при подписке на рассылку'
        });
    }
});

// Обработчик формы обратной связи
app.post('/api/contact', validateBody({
    name: 'username',
    email: 'email',
    subject: 'text',
    message: 'text'
}), async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    try {
        // Сохраняем сообщение в базе данных
        db.run(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        db.run(
            'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        
        // Отправляем уведомление на email администратора
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Отправляем на тот же email, с которого отправляем
            subject: `Новое сообщение: ${subject}`,
            html: `
                <h2>Новое сообщение с сайта Spoframe</h2>
                <p><strong>Имя:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Тема:</strong> ${subject}</p>
                <p><strong>Сообщение:</strong></p>
                <p>${message}</p>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        // Отправляем подтверждение отправителю
        const confirmationMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Ваше сообщение получено - Spoframe',
            html: `
                <h2>Спасибо за ваше сообщение!</h2>
                <p>Уважаемый(ая) ${name},</p>
                <p>Мы получили ваше сообщение и ответим на него в ближайшее время.</p>
                <p>Тема вашего сообщения: ${subject}</p>
                <br>
                <p>С уважением,</p>
                <p>Команда Spoframe</p>
            `
        };
        
        await transporter.sendMail(confirmationMailOptions);
        
        res.json({ 
            status_code: 200,
            success: true,
            message: 'Сообщение успешно отправлено!'
        });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Ошибка при отправке сообщения',
            details: 'Произошла ошибка при отправке сообщения'
        });
    }
});

// Эндпоинт для проверки работоспособности сервера
app.get('/api/health', (req, res) => {
    // Проверяем подключение к базе данных
    db.get('SELECT 1', (err) => {
        if (err) {
            console.error('Ошибка подключения к базе данных:', err);
            return res.status(500).json({ 
                status_code: 500,
                error_type: 'server_error',
                message: 'Ошибка подключения к базе данных',
                details: 'Пожалуйста, попробуйте позже.'
            });
        }
        
        res.json({ 
            status_code: 200,
            status: 'ok', 
            message: 'Сервер работает нормально',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        });
    });
});

// Защищенный маршрут для профиля пользователя
app.get('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.get('SELECT id, username, email, registration_date FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ 
                status_code: 500,
                error_type: 'server_error',
                message: 'Ошибка сервера',
                details: 'Произошла ошибка при получении профиля'
            });
        }
        if (!user) {
            return res.status(404).json({ 
                status_code: 404,
                error_type: 'user_not_found',
                message: 'Пользователь не найден',
                details: 'Пожалуйста, проверьте правильность ввода данных'
            });
        }
        
        res.json({ 
            status_code: 200,
            user: user
        });
    });
});

// Маршрут для выхода из системы
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ 
        status_code: 200,
        message: 'Выход выполнен успешно'
    });
});

// Маршрут для обновления профиля
app.put('/api/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { username, email, currentPassword, newPassword } = req.body;
    
    try {
        // Получаем текущие данные пользователя
        db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
            if (err) {
                return res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка сервера',
                    details: 'Произошла ошибка при получении профиля'
                });
            }
            if (!user) {
                return res.status(404).json({ 
                    status_code: 404,
                    error_type: 'user_not_found',
                    message: 'Пользователь не найден',
                    details: 'Пожалуйста, проверьте правильность ввода данных'
                });
            }
            
            // Если пользователь хочет изменить пароль, проверяем текущий пароль
            if (newPassword) {
                const passwordMatch = await bcrypt.compare(currentPassword, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ 
                        status_code: 401,
                        error_type: 'authentication_error',
                        message: 'Неверный текущий пароль',
                        details: 'Пожалуйста, проверьте правильность ввода данных'
                    });
                }
                
                // Хешируем новый пароль
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                // Обновляем данные пользователя
                db.run(
                    'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
                    [username || user.username, email || user.email, hashedPassword, userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ 
                                status_code: 500,
                                error_type: 'server_error',
                                message: 'Ошибка при обновлении профиля',
                                details: 'Произошла ошибка при обновлении профиля'
                            });
                        }
                        
                        res.json({ 
                            status_code: 200,
                            message: 'Профиль успешно обновлен'
                        });
                    }
                );
            } else {
                // Обновляем только имя пользователя и email
                db.run(
                    'UPDATE users SET username = ?, email = ? WHERE id = ?',
                    [username || user.username, email || user.email, userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ 
                                status_code: 500,
                                error_type: 'server_error',
                                message: 'Ошибка при обновлении профиля',
                                details: 'Произошла ошибка при обновлении профиля'
                            });
                        }
                        
                        res.json({ 
                            status_code: 200,
                            message: 'Профиль успешно обновлен'
                        });
                    }
                );
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Ошибка при обновлении профиля',
            details: 'Произошла ошибка при обновлении профиля'
        });
    }
});

// Маршруты для платежей через Stripe
app.post('/api/create-checkout-session', authenticateToken, validateBody({
    productId: 'productId',
    quantity: 'id'
}), async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    
    // Получаем информацию о продукте из базы данных
    // В реальном приложении здесь будет запрос к базе данных
    const products = {
        'frame-classic': {
            name: 'Spoframe Classic',
            price: 3999,
            description: 'Классическая рамка Spoframe с интеграцией Spotify'
        },
        'frame-premium': {
            name: 'Spoframe Premium',
            price: 5999,
            description: 'Премиум рамка Spoframe с расширенными возможностями'
        },
        'frame-limited': {
            name: 'Spoframe Limited Edition',
            price: 7999,
            description: 'Лимитированная версия рамки Spoframe'
        }
    };
    
    const product = products[productId];
    
    if (!product) {
        return res.status(400).json({ 
            status_code: 400,
            error_type: 'product_not_found',
            message: 'Продукт не найден',
            details: 'Пожалуйста, проверьте правильность ввода данных'
        });
    }
    
    try {
        // Создаем сессию оплаты
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'rub',
                        product_data: {
                            name: product.name,
                            description: product.description
                        },
                        unit_amount: product.price * 100, // Цена в копейках
                    },
                    quantity: quantity,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/payment-cancel`,
            customer_email: req.user.email,
            client_reference_id: req.user.id.toString(),
            metadata: {
                productId: productId,
                userId: req.user.id
            }
        });
        
        res.json({ 
            status_code: 200,
            id: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Ошибка при создании сессии оплаты:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Ошибка при создании сессии оплаты',
            details: 'Произошла ошибка при создании сессии оплаты'
        });
    }
});

// Webhook для обработки событий от Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Ошибка подписи webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Обработка успешного платежа
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Сохраняем информацию о заказе в базе данных
        try {
            db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    product_id TEXT NOT NULL,
                    amount INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    payment_id TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);
            
            db.run(
                'INSERT INTO orders (user_id, product_id, amount, status, payment_id) VALUES (?, ?, ?, ?, ?)',
                [
                    session.client_reference_id,
                    session.metadata.productId,
                    session.amount_total,
                    'completed',
                    session.id
                ]
            );
            
            // Отправляем уведомление о заказе
            const userEmail = session.customer_email;
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: 'Ваш заказ в Spoframe успешно оплачен',
                html: `
                    <h2>Спасибо за ваш заказ!</h2>
                    <p>Ваш платеж успешно обработан.</p>
                    <p>Номер заказа: ${session.id}</p>
                    <p>Мы отправим вам уведомление, когда ваш заказ будет отправлен.</p>
                    <br>
                    <p>С уважением,</p>
                    <p>Команда Spoframe</p>
                `
            };
            
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Ошибка при обработке заказа:', error);
        }
    }
    
    res.json({ 
        status_code: 200,
        received: true
    });
});

// Маршрут для получения истории заказов пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, orders) => {
            if (err) {
                return res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка при получении заказов',
                    details: 'Произошла ошибка при получении заказов'
                });
            }
            
            res.json({ 
                status_code: 200,
                orders: orders
            });
        }
    );
});

// Маршрут для верификации email
app.get('/verify-email', (req, res) => {
    const token = req.query.token;
    
    if (!token) {
        return res.status(400).sendFile(path.join(__dirname, 'error-page.html'), {
            query: {
                code: '400',
                message: 'Отсутствует токен верификации',
                details: 'Для подтверждения email необходим действующий токен верификации.'
            }
        });
    }
    
    // Проверяем токен в базе данных
    db.get(
        'SELECT id, email, verification_token_expires FROM users WHERE verification_token = ?',
        [token],
        (err, user) => {
            if (err) {
                console.error('Ошибка при проверке токена:', err);
                return res.status(500).sendFile(path.join(__dirname, 'error-page.html'), {
                    query: {
                        code: '500',
                        message: 'Ошибка сервера при проверке токена',
                        details: 'Пожалуйста, попробуйте позже.'
                    }
                });
            }
            
            if (!user) {
                return res.status(400).sendFile(path.join(__dirname, 'error-page.html'), {
                    query: {
                        code: '400',
                        message: 'Недействительный токен верификации',
                        details: 'Токен не найден или уже был использован.'
                    }
                });
            }
            
            // Проверяем, не истек ли срок действия токена
            const now = new Date();
            const tokenExpires = new Date(user.verification_token_expires);
            
            if (now > tokenExpires) {
                return res.status(400).sendFile(path.join(__dirname, 'error-page.html'), {
                    query: {
                        code: '400',
                        message: 'Истек срок действия токена',
                        details: 'Срок действия токена истек. Запросите новую ссылку для верификации.'
                    }
                });
            }
            
            // Подтверждаем email
            db.run(
                'UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
                [user.id],
                (err) => {
                    if (err) {
                        console.error('Ошибка при подтверждении email:', err);
                        return res.status(500).sendFile(path.join(__dirname, 'error-page.html'), {
                            query: {
                                code: '500',
                                message: 'Ошибка сервера при подтверждении email',
                                details: 'Пожалуйста, попробуйте позже.'
                            }
                        });
                    }
                    
                    // Перенаправляем на страницу успешной верификации
                    res.redirect('/verification-success.html');
                }
            );
        }
    );
});

// API для запроса восстановления пароля
app.post('/api/auth/forgot-password', validateBody({
    email: 'email'
}), async (req, res) => {
    const { email } = req.body;
    
    try {
        // Проверяем, существует ли пользователь с таким email
        db.get('SELECT id, email FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Ошибка базы данных:', err);
                return res.status(500).json({ 
                    status_code: 500,
                    error_type: 'server_error',
                    message: 'Ошибка сервера при проверке пользователя',
                    details: 'Произошла ошибка при проверке пользователя'
                });
            }
            
            // Даже если пользователь не найден, возвращаем успешный ответ для предотвращения утечки информации
            if (!user) {
                console.log('Запрос на сброс пароля для несуществующего пользователя:', email);
                return res.json({ 
                    status_code: 200,
                    message: 'Если учетная запись с указанным email существует, на него отправлено письмо с инструкциями по восстановлению пароля.'
                });
            }
            
            // Генерируем токен для сброса пароля
            const resetToken = generateToken();
            const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 час
            
            // Сохраняем токен в базе данных
            db.run(
                'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
                [resetToken, expires, user.id],
                async (err) => {
                    if (err) {
                        console.error('Ошибка при сохранении токена сброса пароля:', err);
                        return res.status(500).json({ 
                            status_code: 500,
                            error_type: 'server_error',
                            message: 'Ошибка при генерации нового токена',
                            details: 'Произошла ошибка при генерации нового токена'
                        });
                    }
                    
                    try {
                        // Отправляем письмо с инструкциями
                        await sendPasswordResetEmail(email, resetToken);
                        
                        res.json({ 
                            status_code: 200,
                            message: 'На ваш email отправлено письмо с инструкциями по восстановлению пароля.'
                        });
                    } catch (emailError) {
                        console.error('Ошибка при отправке письма для сброса пароля:', emailError);
                        res.status(500).json({ 
                            status_code: 500,
                            error_type: 'server_error',
                            message: 'Ошибка при отправке письма',
                            details: 'Произошла ошибка при отправке письма для сброса пароля'
                        });
                    }
                }
            );
        });
    } catch (error) {
        console.error('Ошибка сервера при сбросе пароля:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Внутренняя ошибка сервера',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

// Маршрут для сброса пароля
app.post('/reset-password', validateBody({
    token: 'text',
    password: 'password'
}), async (req, res) => {
    const { token, password } = req.body;
    
    try {
        // Проверяем токен в базе данных
        db.get(
            'SELECT id, email, password_reset_expires FROM users WHERE password_reset_token = ?',
            [token],
            async (err, user) => {
                if (err) {
                    console.error('Ошибка при проверке токена:', err);
                    return res.status(500).json({ 
                        status_code: 500,
                        error_type: 'server_error',
                        message: 'Ошибка сервера при проверке токена',
                        details: 'Пожалуйста, попробуйте позже.'
                    });
                }
                
                if (!user) {
                    return res.status(400).json({ 
                        status_code: 400,
                        error_type: 'invalid_token',
                        message: 'Недействительный токен сброса пароля',
                        details: 'Токен не найден или уже был использован.'
                    });
                }
                
                // Проверяем, не истек ли срок действия токена
                const now = new Date();
                const tokenExpires = new Date(user.password_reset_expires);
                
                if (now > tokenExpires) {
                    return res.status(400).json({ 
                        status_code: 400,
                        error_type: 'token_expired',
                        message: 'Истек срок действия токена',
                        details: 'Срок действия токена истек. Запросите новую ссылку для сброса пароля.'
                    });
                }
                
                // Хешируем новый пароль
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Обновляем пароль в базе данных
                db.run(
                    'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
                    [hashedPassword, user.id],
                    (err) => {
                        if (err) {
                            console.error('Ошибка при обновлении пароля:', err);
                            return res.status(500).json({ 
                                status_code: 500,
                                error_type: 'server_error',
                                message: 'Ошибка при обновлении пароля',
                                details: 'Произошла ошибка при обновлении пароля'
                            });
                        }
                        
                        res.json({ 
                            status_code: 200,
                            message: 'Пароль успешно сброшен'
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Ошибка сервера при сбросе пароля:', error);
        res.status(500).json({ 
            status_code: 500,
            error_type: 'server_error',
            message: 'Внутренняя ошибка сервера',
            details: 'Произошла внутренняя ошибка сервера'
        });
    }
});

// Создаем страницу успешной верификации
app.get('/verification-success.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email подтвержден - Spoframe</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }
                
                body {
                    background-color: #f9fafb;
                    color: #333;
                    line-height: 1.6;
                    padding: 20px;
                }
                
                .success-container {
                    max-width: 600px;
                    margin: 50px auto;
                    text-align: center;
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 40px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .success-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 20px;
                    background-color: #f3f4f6;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 40px;
                    color: #22c55e;
                }
                
                .success-title {
                    font-size: 24px;
                    margin-bottom: 20px;
                    color: #333;
                }
                
                .success-message {
                    font-size: 16px;
                    margin-bottom: 30px;
                    color: #666;
                }
                
                .success-button {
                    display: inline-block;
                    background-color: #7c3aed;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background-color 0.3s;
                }
                
                .success-button:hover {
                    background-color: #6d28d9;
                }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        </head>
        <body>
            <div class="success-container">
                <div class="success-icon">✓</div>
                <h1 class="success-title">Email успешно подтвержден!</h1>
                <p class="success-message">Ваш email был успешно подтвержден. Теперь вы можете войти в систему, используя свои учетные данные.</p>
                <a href="/" class="success-button">Вернуться на главную</a>
            </div>
        </body>
        </html>
    `);
});

// Обработка ошибок для отсутствующих файлов
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ 
        status_code: 500,
        error_type: 'server_error',
        message: 'Ошибка сервера',
        details: 'Произошла внутренняя ошибка сервера'
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

// Функция для генерации 6-значного кода
function generate2FACode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Функция для проверки, является ли устройство доверенным
function isTrustedDevice(userId, deviceId, ipAddress) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM trusted_devices WHERE user_id = ? AND device_id = ? AND ip_address = ?',
            [userId, deviceId, ipAddress],
            (err, device) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(!!device);
            }
        );
    });
}

// Функция для создания уникального ID устройства
function generateDeviceId() {
    return crypto.randomBytes(16).toString('hex');
}

// Функция для отправки 2FA кода
async function send2FACode(email, code) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Код подтверждения - Spoframe',
        html: `
            <h2>Код подтверждения для входа в Spoframe</h2>
            <p>Ваш код подтверждения:</p>
            <div style="margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
                ${code}
            </div>
            <p>Код действителен в течение 10 минут.</p>
            <p>Если вы не пытались войти в систему, проигнорируйте это письмо.</p>
            <br>
            <p>С уважением,</p>
            <p>Команда Spoframe</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// Функция для сохранения 2FA кода в базе данных
function save2FACode(userId, code) {
    return new Promise((resolve, reject) => {
        const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 минут
        
        db.run(
            'UPDATE users SET two_factor_code = ?, two_factor_expires = ? WHERE id = ?',
            [code, expires, userId],
            function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes);
            }
        );
    });
}
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
require('dotenv').config();
const path = require('path');
const app = express();

// Настройка защиты заголовков с помощью helmet
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
    
    if (['ru', 'en'].includes(lang)) {
        res.cookie('locale', lang, { maxAge: 900000, httpOnly: true });
        res.json({ success: true, language: lang });
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
app.use(express.static('.', {
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
app.use('/public', express.static('public', {
    maxAge: cacheTime,
    setHeaders: (res, path) => {
        if (path.match(/\.(css|js|jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 год
        }
    }
}));

// Создание таблицы пользователей при запуске
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                return res.status(500).json({ message: 'Ошибка сервера при проверке пользователя' });
            }

            if (existingUser) {
                console.log('Пользователь уже существует:', email);
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const now = new Date().toISOString();
                const insertUserQuery = 'INSERT INTO users (username, email, password, registration_date) VALUES (?, ?, ?, ?)';
                db.run(insertUserQuery, [name, email, hashedPassword, now], function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ message: 'Ошибка при создании пользователя' });
                    }
                    console.log('Пользователь успешно создан:', { id: this.lastID, name, email });
                    res.status(201).json({ 
                        message: 'Регистрация успешна!'
                    });
                });
            } catch (hashError) {
                console.error('Hashing error:', hashError);
                res.status(500).json({ message: 'Ошибка при обработке пароля' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
});

app.post('/api/auth/login', validateBody({
    email: 'email',
    password: 'password'
}), async (req, res) => {
    const { email, password } = req.body;
    
    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 });
            res.json({ 
                message: 'Вход выполнен успешно',
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email
                },
                token: token
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
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
            return res.status(500).json({ error: 'Ошибка при получении списка пользователей' });
        }
        console.log('Найдено пользователей:', rows.length);
        res.json(rows);
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
        res.json({ success: true, message: 'Вы успешно подписались на рассылку!' });
    } catch (error) {
        console.error('Ошибка при подписке:', error);
        res.status(500).json({ success: false, message: 'Ошибка при подписке на рассылку' });
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
        
        res.json({ success: true, message: 'Сообщение успешно отправлено!' });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ success: false, message: 'Ошибка при отправке сообщения' });
    }
});

// Эндпоинт для проверки работоспособности сервера
app.get('/api/health', (req, res) => {
    // Проверяем подключение к базе данных
    db.get('SELECT 1', (err) => {
        if (err) {
            console.error('Ошибка подключения к базе данных:', err);
            return res.status(500).json({ 
                status: 'error', 
                message: 'Ошибка подключения к базе данных',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({ 
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
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json({ user });
    });
});

// Маршрут для выхода из системы
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: 'Выход выполнен успешно' });
});

// Маршрут для обновления профиля
app.put('/api/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { username, email, currentPassword, newPassword } = req.body;
    
    try {
        // Получаем текущие данные пользователя
        db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка сервера' });
            }
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            // Если пользователь хочет изменить пароль, проверяем текущий пароль
            if (newPassword) {
                const passwordMatch = await bcrypt.compare(currentPassword, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Неверный текущий пароль' });
                }
                
                // Хешируем новый пароль
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                // Обновляем данные пользователя
                db.run(
                    'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
                    [username || user.username, email || user.email, hashedPassword, userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Ошибка при обновлении профиля' });
                        }
                        
                        res.json({ message: 'Профиль успешно обновлен' });
                    }
                );
            } else {
                // Обновляем только имя пользователя и email
                db.run(
                    'UPDATE users SET username = ?, email = ? WHERE id = ?',
                    [username || user.username, email || user.email, userId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Ошибка при обновлении профиля' });
                        }
                        
                        res.json({ message: 'Профиль успешно обновлен' });
                    }
                );
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Ошибка при обновлении профиля' });
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
        return res.status(400).json({ error: 'Продукт не найден' });
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
        
        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Ошибка при создании сессии оплаты:', error);
        res.status(500).json({ error: 'Ошибка при создании сессии оплаты' });
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
    
    res.json({ received: true });
});

// Маршрут для получения истории заказов пользователя
app.get('/api/orders', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при получении заказов' });
            }
            
            res.json({ orders });
        }
    );
});

// Запуск сервера
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
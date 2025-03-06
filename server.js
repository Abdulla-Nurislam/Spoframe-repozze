const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');
const app = express();

// Подключение к базе данных - используем in-memory SQLite для Vercel
const db = process.env.NODE_ENV === 'production' 
    ? new sqlite3.Database(':memory:')
    : new sqlite3.Database('users.db');

// Middleware для обработки JSON и форм
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка статических файлов
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Создание таблиц при запуске
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Основные маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing Page.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'Product Catalog.html'));
});

app.get('/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'Product Detail.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'About Product.html'));
});

// Создаем транспорт для отправки почты
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // ваш gmail
        pass: process.env.EMAIL_PASS  // пароль приложения gmail
    }
});

// API маршруты
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.get(checkUserQuery, [email], async (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Ошибка сервера при проверке пользователя' });
            }

            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const insertUserQuery = 'INSERT INTO users (username, email, password, registration_date) VALUES (?, ?, ?, ?)';
                db.run(insertUserQuery, [name, email, hashedPassword, new Date().toISOString()], function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Ошибка при создании пользователя' });
                    }
                    res.status(201).json({ 
                        message: 'Регистрация успешна',
                        userId: this.lastID 
                    });
                });
            } catch (hashError) {
                console.error('Hashing error:', hashError);
                res.status(500).json({ error: 'Ошибка при обработке пароля' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.post('/api/auth/login', async (req, res) => {
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

            res.json({ 
                message: 'Вход выполнен успешно', 
                user: { 
                    id: user.id, 
                    username: user.username, 
                    email: user.email 
                } 
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка при входе' });
    }
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

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Экспорт для Vercel
module.exports = app;
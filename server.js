const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config();
const path = require('path');
const app = express();

// Подключение к базе данных
const db = new sqlite3.Database('users.db');

// Middleware для обработки JSON и форм
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));
app.use('/public', express.static('public'));

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

// Добавьте это к существующим CREATE TABLE запросам
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
        user: process.env.EMAIL_USER, // ваш gmail
        pass: process.env.EMAIL_PASS  // пароль приложения gmail
    }
});

// Маршрут для регистрации
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        // Проверяем, существует ли пользователь
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
                // Хешируем пароль
                const hashedPassword = await bcrypt.hash(password, 10);

                // Добавляем пользователя
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

// Маршрут для входа (соответствует пути в HTML форме)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        res.json({ message: 'Вход выполнен успешно', user: { id: user.id, username: user.username, email: user.email } });
    });
});

// Маршрут для получения списка пользователей
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Маршрут для подписки на рассылку
app.post('/api/subscription/subscribe', async (req, res) => {
    const { email } = req.body;

    try {
        // Сохраняем email в базу данных
        db.run('INSERT INTO subscribers (email) VALUES (?)', [email]);

        // Отправляем приветственное письмо
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

// Маршрут для страницы администратора
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});
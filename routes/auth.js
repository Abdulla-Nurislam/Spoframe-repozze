const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const emailService = require('../services/emailService');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Сохранение пользователя
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            async function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(409).json({ message: 'Email уже зарегистрирован' });
                    }
                    return res.status(500).json({ message: 'Ошибка при регистрации' });
                }

                // Отправка приветственного письма
                await emailService.queue.add('welcome-email', { email, name });

                res.status(201).json({ message: 'Регистрация успешна' });
            });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Маршрут для входа
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Поиск пользователя
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка сервера' });
            }
            
            if (!user) {
                return res.status(401).json({ message: 'Неверный email или пароль' });
            }

            // Проверка пароля
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Неверный email или пароль' });
            }

            // Создание JWT токена
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Установка куки
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 24 часа
            });

            res.json({ 
                message: 'Вход выполнен успешно',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Маршрут для получения данных профиля
router.get('/profile', authMiddleware, (req, res) => {
    db.get('SELECT id, name, email FROM users WHERE id = ?', 
        [req.user.userId], 
        (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка сервера' });
            }
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json({ user });
        }
    );
});

// Маршрут для выхода
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Выход выполнен успешно' });
});

module.exports = router; 
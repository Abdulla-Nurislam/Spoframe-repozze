require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Статические файлы
app.use(express.static('public'));
app.use('/js', express.static('public/js'));

// Маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscription', require('./routes/subscription'));

// Обработка HTML страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing Page.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 
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
app.use(express.static(path.join(__dirname, 'public')));

// ... rest of the existing code ... 
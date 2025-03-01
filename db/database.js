const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
    if (err) {
        console.error('Ошибка при подключении к базе данных:', err);
        return;
    }
    console.log('Подключено к базе данных SQLite');
    
    // Создаем таблицы если они не существуют
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        unsubscribe_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db; 
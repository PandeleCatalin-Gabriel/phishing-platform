const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/database.db');

// Creare conexiune la baza de date
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Eroare la conectarea la baza de date:', err);
    } else {
        console.log('✅ Conectat la baza de date SQLite');
    }
});

// Activare foreign keys
db.run('PRAGMA foreign_keys = ON');

// Funcții helper pentru query-uri
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const getOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const getAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    db,
    runQuery,
    getOne,
    getAll
};
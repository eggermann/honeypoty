const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'honeypoty',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
let pool;

async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('Database connection pool created');
        return pool;
    } catch (error) {
        console.error('Error creating database connection pool:', error);
        throw error;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initializeDatabase() first.');
    }
    return pool;
}

module.exports = {
    initializeDatabase,
    getPool
};

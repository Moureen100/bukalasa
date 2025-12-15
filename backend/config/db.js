const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: process.env.DB_PORT || 3306, // Add this line
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bukalasa_diaspora',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});



// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('🔧 Please check:');
        console.log('1. XAMPP MySQL service is running');
        console.log('2. Database name: bukalasa_diaspora');
        console.log('3. Username: root (default)');
        console.log('4. Password: (empty by default)');
    } else {
        console.log('✅ Database connected successfully!');
        connection.release();
    }
});

module.exports = pool.promise();
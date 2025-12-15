const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to MySQL server');
    
    // Create database
    connection.query('CREATE DATABASE IF NOT EXISTS bukalasa_diaspora', (err) => {
        if (err) {
            console.error('❌ Error creating database:', err.message);
            connection.end();
            process.exit(1);
        }
        
        console.log('✅ Database created or already exists');
        
        // Use the database
        connection.query('USE bukalasa_diaspora', (err) => {
            if (err) {
                console.error('❌ Error selecting database:', err.message);
                connection.end();
                process.exit(1);
            }
            
            console.log('✅ Using database: bukalasa_diaspora');
            
            // Create users table
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    biodata_completed BOOLEAN DEFAULT FALSE,
                    reset_token VARCHAR(255),
                    reset_token_expiry DATETIME,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;
            
            connection.query(createUsersTable, (err) => {
                if (err) {
                    console.error('❌ Error creating users table:', err.message);
                    connection.end();
                    process.exit(1);
                }
                
                console.log('✅ Users table created or already exists');
                
                // Create biodata table
                const createBiodataTable = `
                    CREATE TABLE IF NOT EXISTS biodata (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        user_id INT,
                        surname VARCHAR(50) NOT NULL,
                        middle_name VARCHAR(50),
                        second_name VARCHAR(50) NOT NULL,
                        age INT NOT NULL,
                        marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed') NOT NULL,
                        gender ENUM('Male', 'Female', 'Other') NOT NULL,
                        telephone VARCHAR(20) NOT NULL,
                        address TEXT NOT NULL,
                        next_of_kin VARCHAR(100) NOT NULL,
                        email VARCHAR(100),
                        profile_image VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                `;
                
                connection.query(createBiodataTable, (err) => {
                    if (err) {
                        console.error('❌ Error creating biodata table:', err.message);
                        connection.end();
                        process.exit(1);
                    }
                    
                    console.log('✅ Biodata table created or already exists');
                    console.log('\n🎉 Database setup completed successfully!');
                    console.log('\n📊 Tables created:');
                    console.log('   - users');
                    console.log('   - biodata');
                    console.log('\n🔑 Default credentials:');
                    console.log('   Host: localhost');
                    console.log('   User: root');
                    console.log('   Password: (empty)');
                    console.log('   Database: bukalasa_diaspora');
                    
                    connection.end();
                });
            });
        });
    });
});
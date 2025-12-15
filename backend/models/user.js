const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async create(email, password) {
        try {
            console.log('🔧 Creating user with email:', email);
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await db.execute(
                'INSERT INTO users (email, password, biodata_completed) VALUES (?, ?, ?)',
                [email, hashedPassword, false]
            );
            
            console.log('✅ User created with ID:', result.insertId);
            return result.insertId;
        } catch (error) {
            console.error('❌ Error creating user:', error.message);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            console.log('🔧 Finding user by email:', email);
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            console.log('✅ Found user:', rows[0] ? 'Yes' : 'No');
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding user:', error.message);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding user by ID:', error.message);
            throw error;
        }
    }

    static async updateResetToken(email, token, expiry) {
        try {
            await db.execute(
                'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
                [token, expiry, email]
            );
            console.log('✅ Reset token updated for:', email);
        } catch (error) {
            console.error('❌ Error updating reset token:', error.message);
            throw error;
        }
    }

    static async findByResetToken(token) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
                [token]
            );
            return rows[0];
        } catch (error) {
            console.error('❌ Error finding by reset token:', error.message);
            throw error;
        }
    }

    static async updatePassword(id, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
                'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
                [hashedPassword, id]
            );
            console.log('✅ Password updated for user ID:', id);
        } catch (error) {
            console.error('❌ Error updating password:', error.message);
            throw error;
        }
    }

    static async updateBiodataStatus(id, completed) {
        try {
            await db.execute(
                'UPDATE users SET biodata_completed = ?, updated_at = NOW() WHERE id = ?',
                [completed, id]
            );
            console.log('✅ Biodata status updated for user ID:', id, 'Status:', completed);
        } catch (error) {
            console.error('❌ Error updating biodata status:', error.message);
            throw error;
        }
    }

    static async comparePassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('❌ Error comparing passwords:', error.message);
            throw error;
        }
    }
}

module.exports = User;
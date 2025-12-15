const db = require('../config/db');
const User = require('./User');

class Biodata {
    static async createOrUpdate(user_id, data) {
        try {
            console.log('🔧 [BIODATA] Starting save for user:', user_id);
            
            // Check if biodata exists for this user
            const [existing] = await db.execute(
                'SELECT id FROM biodata WHERE user_id = ?',
                [user_id]
            );

            let result;
            if (existing.length > 0) {
                console.log('🔄 [BIODATA] Updating existing record');
                // Update existing biodata
                [result] = await db.execute(
                    `UPDATE biodata SET 
                        surname = ?, 
                        middle_name = ?, 
                        second_name = ?, 
                        age = ?, 
                        marital_status = ?, 
                        gender = ?, 
                        telephone = ?, 
                        address = ?, 
                        next_of_kin = ?, 
                        email = ?,
                        updated_at = NOW()
                    WHERE user_id = ?`,
                    [
                        data.surname,
                        data.middle_name || null,
                        data.second_name,
                        data.age,
                        data.marital_status,
                        data.gender,
                        data.telephone,
                        data.address,
                        data.next_of_kin,
                        data.email,
                        user_id
                    ]
                );
                console.log('✅ [BIODATA] Update successful, rows affected:', result.affectedRows);
            } else {
                console.log('🆕 [BIODATA] Creating new record');
                // Create new biodata
                [result] = await db.execute(
                    `INSERT INTO biodata 
                    (user_id, surname, middle_name, second_name, age, marital_status, gender, telephone, address, next_of_kin, email) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user_id,
                        data.surname,
                        data.middle_name || null,
                        data.second_name,
                        data.age,
                        data.marital_status,
                        data.gender,
                        data.telephone,
                        data.address,
                        data.next_of_kin,
                        data.email
                    ]
                );
                console.log('✅ [BIODATA] Insert successful, ID:', result.insertId);
            }

            // Update biodata completion status
            await User.updateBiodataStatus(user_id, true);
            console.log('✅ [BIODATA] User status updated');

            return result;
        } catch (error) {
            console.error('❌ [BIODATA] Error:', error.message);
            console.error('🔧 SQL Error details:', {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState
            });
            throw error;
        }
    }

    static async findByUserId(user_id) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM biodata WHERE user_id = ?',
                [user_id]
            );
            return rows[0];
        } catch (error) {
            console.error('❌ [BIODATA] Find error:', error.message);
            throw error;
        }
    }
}

module.exports = Biodata;
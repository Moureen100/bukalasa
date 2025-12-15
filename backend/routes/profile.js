const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const db = require('../config/db'); // Add this import

router.post('/biodata', protect, profileController.saveBiodata);
router.get('/biodata', protect, profileController.getBiodata);
router.get('/check-biodata', protect, profileController.checkBiodataStatus);

// Debug endpoint
router.get('/debug/db', protect, async (req, res) => {
    try {
        console.log('🔍 Debug DB endpoint called');
        
        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [biodata] = await db.execute('SELECT COUNT(*) as count FROM biodata');
        const [userList] = await db.execute('SELECT id, email, biodata_completed FROM users LIMIT 10');
        const [biodataList] = await db.execute('SELECT id, user_id, surname, second_name FROM biodata LIMIT 10');
        
        res.json({
            success: true,
            database: 'bukalasa_diaspora',
            users_count: users[0].count,
            biodata_count: biodata[0].count,
            users: userList,
            biodata_records: biodataList,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Debug endpoint error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message,
            error: error.stack
        });
    }
});

module.exports = router;
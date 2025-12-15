const Biodata = require('../models/Biodata');
const User = require('../models/user');

exports.saveBiodata = async (req, res) => {
    console.log('=== BIODATA SAVE REQUEST START ===');
    console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
    console.log('User from middleware:', req.user);
    console.log('Request body:', req.body);
    
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            console.log('❌ No user in request');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated. Please login again.'
            });
        }

        const userId = req.user.id;
        const biodata = req.body;

        console.log('Processing biodata for user ID:', userId);
        console.log('Biodata received:', biodata);

        // Validate required fields
        const requiredFields = ['surname', 'second_name', 'age', 'marital_status', 'gender', 'telephone', 'address', 'next_of_kin', 'email'];
        const missingFields = [];

        requiredFields.forEach(field => {
            if (!biodata[field] || biodata[field].toString().trim() === '') {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            console.log('❌ Missing fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields',
                missingFields: missingFields
            });
        }

        console.log('All validations passed. Saving to database...');

        // Save biodata to database
        const result = await Biodata.createOrUpdate(userId, biodata);
        console.log('Database save result:', result);

        // Update user's biodata completion status
        await User.updateBiodataStatus(userId, true);
        console.log('User biodata status updated');

        console.log('=== BIODATA SAVE REQUEST END - SUCCESS ===');
        res.json({ 
            success: true,
            message: 'Biodata saved successfully!',
            data: {
                userId: userId,
                biodataId: result.insertId || result.affectedRows
            }
        });

    } catch (error) {
        console.error('=== BIODATA SAVE REQUEST END - ERROR ===');
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({ 
            success: false,
            message: 'Server error while saving biodata',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.getBiodata = async (req, res) => {
    try {
        console.log('Getting biodata for user:', req.user.id);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const userId = req.user.id;
        const biodata = await Biodata.findByUserId(userId);

        if (!biodata) {
            console.log('No biodata found for user:', userId);
            return res.json({
                success: true,
                message: 'No biodata found',
                data: null
            });
        }

        console.log('Biodata found:', biodata);
        res.json({
            success: true,
            data: biodata
        });

    } catch (error) {
        console.error('Get biodata error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching biodata',
            error: error.message
        });
    }
};

exports.checkBiodataStatus = async (req, res) => {
    try {
        console.log('Checking biodata status for user:', req.user.id);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const userId = req.user.id;
        const biodata = await Biodata.findByUserId(userId);
        
        // Check if biodata is complete
        let requiresBiodata = true;
        if (biodata && biodata.surname && biodata.second_name && biodata.age) {
            requiresBiodata = false;
        }
        
        console.log('Biodata status:', requiresBiodata ? 'Required' : 'Completed');
        
        res.json({
            success: true,
            requiresBiodata: requiresBiodata,
            hasBiodata: !!biodata,
            biodata: biodata || null
        });

    } catch (error) {
        console.error('Check biodata status error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Error checking biodata status',
            error: error.message
        });
    }
};
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyAdmin = require('../middleware/verifyAdmin');

// @route   POST /api/upload/image
// @desc    Upload a single image and return its URL
router.post('/image', verifyAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        // The path the frontend will use to access the image
        const imageUrl = `/assets/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
const express = require('express');
const ProfileController = require('../Controllers/ProfileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All profile routes require authentication
router.use(authMiddleware);

// GET /api/profile - Get user profile
router.get('/', ProfileController.getProfile);

// PUT /api/profile - Update user profile (with optional file upload)
router.put('/', upload.single('profilePicture'), ProfileController.updateProfile);

module.exports = router;
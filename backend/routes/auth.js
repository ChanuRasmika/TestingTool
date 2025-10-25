const express = require('express');
const authController = require('../Controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);


router.get('/', (req, res) => {
	res.json({ message: 'Auth API is running' });
});

module.exports = router;

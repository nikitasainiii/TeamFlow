const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');
const { signupValidation, loginValidation } = require('../utils/validators');

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getMe);

module.exports = router;

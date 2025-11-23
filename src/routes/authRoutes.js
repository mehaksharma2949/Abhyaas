// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// Teacher quick-login route (environment-based)
router.post('/teacher/login', (req, res) => {
  // agar tumne teacher login route as earlier rakha hai toh yeh chalta rahega
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success:false, message:'Missing credentials' });

  if (email !== process.env.TEACHER_EMAIL || password !== process.env.TEACHER_PASSWORD) {
    return res.status(401).json({ success:false, message:'Invalid teacher credentials' });
  }

  const payload = { id: 'teacher-001', role: 'teacher', email };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });

  return res.json({ success:true, token, user: payload });
});

// Student register -> uses authController.registerStudent
router.post('/student/register', authController.registerStudent);

// Teacher register (if you want separate signup page for teachers)
router.post('/teacher/register', authController.registerTeacher);

// add near other routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// existing: router.post('/student/register', authController.registerStudent);


// Login (common)
router.post('/login', authController.login);

// Get current user (optional) - requires auth middleware if implemented
router.get('/me', authController.me);

module.exports = router;

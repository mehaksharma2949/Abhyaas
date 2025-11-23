const express = require('express');
const router = express.Router();
const { getFeatures } = require('../controllers/teacherController');

// GET features list (frontend uses this)
router.get('/features', getFeatures);

module.exports = router;

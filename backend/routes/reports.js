const express = require('express');
const ReportController = require('../Controllers/ReportController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All report routes require authentication
router.use(authMiddleware);

// GET /api/reports/monthly - Download monthly report PDF
router.get('/monthly', ReportController.downloadMonthlyReport);

module.exports = router;
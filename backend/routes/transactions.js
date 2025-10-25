const express = require('express');
const TransactionController = require('../Controllers/TransactionController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.use(authMiddleware);

router.post('/', TransactionController.createTransaction);


router.get('/', TransactionController.getUserTransactions);


router.get('/balance', TransactionController.getUserBalance);

module.exports = router;
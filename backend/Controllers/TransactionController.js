const TransactionService = require('../Services/TransactionService');
const { TransactionCreateDTO, TransactionFilterDTO } = require('../Dto/Transaction.Dto');

class TransactionController {
  static async createTransaction(req, res) {
    try {
      const { error, value } = TransactionCreateDTO.validate({
        ...req.body,
        userId: req.user.id
      });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await TransactionService.createTransaction(value);
      
      res.status(201).json({
        message: 'Transaction created successfully',
        ...result
      });
    } catch (err) {
      console.error('Create transaction error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserTransactions(req, res) {
    try {
      const { error, value } = TransactionFilterDTO.validate({
        ...req.query,
        userId: req.user.id
      });

      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const result = await TransactionService.getUserTransactions(req.user.id, value);
      
      res.json(result);
    } catch (err) {
      console.error('Get transactions error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserBalance(req, res) {
    try {
      const balance = await TransactionService.getUserBalance(req.user.id);
      res.json({ balance });
    } catch (err) {
      console.error('Get balance error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = TransactionController;
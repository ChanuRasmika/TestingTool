const TransactionRepository = require('../Repositories/TransactionRepository');
const { mapTransactionToResponseDTO } = require('../Dto/Transaction.Dto');

class TransactionService {
  static async createTransaction(transactionData) {
    const { userId, date, description, amount, category } = transactionData;
    
    // Get current bank balance
    const currentBalance = await TransactionRepository.getUserBankBalance(userId);
    
    // Calculate new balance
    const newBalance = parseFloat(currentBalance) + parseFloat(amount);
    
    // Create transaction
    const transaction = await TransactionRepository.create({
      user_id: userId,
      date,
      description,
      amount,
      category
    });

    // Update user's bank balance
    await TransactionRepository.updateUserBankBalance(userId, newBalance);

    return {
      transaction: mapTransactionToResponseDTO(transaction),
      newBalance
    };
  }

  static async getUserTransactions(userId, filters = {}) {
    const transactions = await TransactionRepository.findByUserId(userId, filters);
    const currentBalance = await TransactionRepository.getUserBankBalance(userId);
    
    return {
      transactions: transactions.map(mapTransactionToResponseDTO),
      currentBalance
    };
  }

  static async getUserBalance(userId) {
    return await TransactionRepository.getUserBankBalance(userId);
  }
}

module.exports = TransactionService;
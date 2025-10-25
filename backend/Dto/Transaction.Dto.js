const Joi = require('joi');


const TransactionCreateDTO = Joi.object({
  userId: Joi.number().integer().required(),
  date: Joi.date().required(),
  description: Joi.string().max(255).required(),
  amount: Joi.number().precision(2).required(),
  category: Joi.string().max(100).optional()
});


const TransactionFilterDTO = Joi.object({
  userId: Joi.number().integer().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  category: Joi.string().optional()
});


const mapTransactionToResponseDTO = (tx) => ({
  id: tx.id,
  userId: tx.user_id,
  date: tx.date,
  description: tx.description,
  amount: tx.amount,
  category: tx.category,
  createdAt: tx.created_at
});

module.exports = {
  TransactionCreateDTO,
  TransactionFilterDTO,
  mapTransactionToResponseDTO
};

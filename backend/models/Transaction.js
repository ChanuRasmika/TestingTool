class Transaction {
  constructor({
    id,
    user_id,
    date,
    description,
    amount,
    category,
    created_at
  }) {
    this.id = id;
    this.user_id = user_id;
    this.date = date;
    this.description = description;
    this.amount = amount;
    this.category = category;
    this.created_at = created_at;
  }
}

module.exports = Transaction;
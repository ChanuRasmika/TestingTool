function TransactionList({ transactions }) {
  const formatAmount = (amount) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by making your first transaction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction.amount >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.amount >= 0 ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDate(transaction.date)}</span>
                {transaction.category && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                      {transaction.category}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`text-lg font-semibold ${
            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatAmount(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;
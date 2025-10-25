const PDFDocument = require('pdfkit');
const TransactionRepository = require('../Repositories/TransactionRepository');
const UserRepository = require('../Repositories/UserRepository');

class ReportService {
  static async generateMonthlyReport(userId, year, month) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await TransactionRepository.findByUserId(userId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    const doc = new PDFDocument({ margin: 50 });
    
    // Header with background
    doc.rect(0, 0, doc.page.width, 100).fill('#f8f9fa');
    doc.fillColor('#000');
    doc.fontSize(24).font('Helvetica-Bold').text('QuickBank', 50, 30);
    doc.fontSize(18).font('Helvetica').text('Monthly Report', 50, 60);
    
    // User info
    doc.fontSize(12).text(`Account Holder: ${user.name}`, 400, 30);
    doc.text(`Report Period: ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 400, 45);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 400, 60);
    
    // Summary section with boxes
    let yPos = 130;
    const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0) || 0;
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    const bankBalance = parseFloat(user.bank_balance) || 0;
    
    doc.fontSize(16).font('Helvetica-Bold').text('Account Summary', 50, yPos);
    yPos += 30;
    
    // Summary boxes
    const boxWidth = 150;
    const boxHeight = 60;
    
    // Bank Balance box
    doc.rect(50, yPos, boxWidth, boxHeight).stroke('#ddd');
    doc.rect(50, yPos, boxWidth, 25).fill('#e3f2fd');
    doc.fillColor('#000').fontSize(10).font('Helvetica-Bold').text('Current Balance', 60, yPos + 8);
    doc.fontSize(14).font('Helvetica').text(`$${bankBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 60, yPos + 35);
    
    // Income box
    doc.rect(220, yPos, boxWidth, boxHeight).stroke('#ddd');
    doc.rect(220, yPos, boxWidth, 25).fill('#e8f5e8');
    doc.fillColor('#000').fontSize(10).font('Helvetica-Bold').text('Total Income', 230, yPos + 8);
    doc.fontSize(14).font('Helvetica').text(`$${totalIncome.toFixed(2)}`, 230, yPos + 35);
    
    // Expenses box
    doc.rect(390, yPos, boxWidth, boxHeight).stroke('#ddd');
    doc.rect(390, yPos, boxWidth, 25).fill('#ffebee');
    doc.fillColor('#000').fontSize(10).font('Helvetica-Bold').text('Total Expenses', 400, yPos + 8);
    doc.fontSize(14).font('Helvetica').text(`$${totalSpent.toFixed(2)}`, 400, yPos + 35);
    
    yPos += 100;
    
    // Transactions section
    doc.fontSize(16).font('Helvetica-Bold').text('Transaction Details', 50, yPos);
    yPos += 30;
    
    if (transactions.length === 0) {
      doc.fontSize(12).font('Helvetica').text('No transactions found for this period.', 50, yPos);
    } else {
      // Table header
      doc.rect(50, yPos, 495, 25).fill('#f5f5f5');
      doc.fillColor('#000').fontSize(10).font('Helvetica-Bold');
      doc.text('Date', 60, yPos + 8);
      doc.text('Description', 140, yPos + 8);
      doc.text('Category', 350, yPos + 8);
      doc.text('Amount', 480, yPos + 8);
      yPos += 25;
      
      transactions.forEach((transaction, index) => {
        if (yPos > 720) {
          doc.addPage();
          yPos = 50;
        }
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.rect(50, yPos, 495, 20).fill('#fafafa');
        }
        
        const date = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const amt = parseFloat(transaction.amount);
        const amount = amt >= 0 ? `+$${amt.toFixed(2)}` : `-$${Math.abs(amt).toFixed(2)}`;
        const amountColor = amt >= 0 ? '#2e7d32' : '#d32f2f';
        
        doc.fillColor('#000').fontSize(9).font('Helvetica');
        doc.text(date, 60, yPos + 6);
        doc.text(transaction.description.substring(0, 25), 140, yPos + 6);
        doc.text(transaction.category || 'Other', 350, yPos + 6);
        doc.fillColor(amountColor).text(amount, 480, yPos + 6);
        
        yPos += 20;
      });
    }
    
    // Footer
    doc.fontSize(8).fillColor('#666').text(
      'This report is generated automatically by QuickBank. For questions, contact support.',
      50, doc.page.height - 50
    );

    return doc;
  }
}

module.exports = ReportService;
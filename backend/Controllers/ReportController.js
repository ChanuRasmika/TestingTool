const ReportService = require('../Services/ReportService');

class ReportController {
  static async downloadMonthlyReport(req, res) {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
      }

      const doc = await ReportService.generateMonthlyReport(req.user.id, parseInt(year), parseInt(month));
      
      const filename = `monthly-report-${year}-${month.padStart(2, '0')}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      doc.pipe(res);
      doc.end();
    } catch (err) {
      console.error('Download report error:', err);
      if (err.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ReportController;
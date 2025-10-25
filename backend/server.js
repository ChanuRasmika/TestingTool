const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const profileRoutes = require('./routes/profile');
const reportRoutes = require('./routes/reports');

// Serve static files
app.use('/uploads', express.static('uploads'));

app.use('/api', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);

// JSON parse error handler: return a clean 400 response for malformed JSON
// This prevents body-parser SyntaxError stack traces from being printed to stdout
// during tests while keeping other error handling intact.
app.use((err, req, res, next) => {
	if (err && err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ success: false, message: 'Invalid JSON' });
	}
	// forward other errors
	next(err);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

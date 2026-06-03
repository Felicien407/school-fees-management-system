import { Router } from 'express';
import { query } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { paymentSelect, toPaymentApi } from '../utils/mappers.js';

const router = Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'Query params start and end (yyyy-mm-dd) are required' });
    }

    const startDate = new Date(String(start));
    const endDate = new Date(String(end));
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format; use yyyy-mm-dd' });
    }

    const rows = await query(
      `${paymentSelect} WHERE p.payment_date BETWEEN ? AND ? ORDER BY p.payment_date DESC`,
      [String(start), String(end)]
    );
    const payments = rows.map(toPaymentApi);
    const total = payments.reduce((sum, row) => sum + (row.amount || 0), 0);

    return res.json({
      start: String(start),
      end: String(end),
      payments,
      total_amount_paid: total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to build report' });
  }
});

export default router;

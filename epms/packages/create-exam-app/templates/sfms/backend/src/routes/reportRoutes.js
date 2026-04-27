import { Router } from 'express';
import { Payment } from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

function toApi(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  const st = o.student && typeof o.student === 'object' ? o.student : null;
  return {
    id: o._id,
    student_id: o.student?._id ?? o.student,
    amount: o.amount,
    payment_date: o.paymentDate?.toISOString?.().slice(0, 10) ?? o.paymentDate,
    created_at: o.created_at,
    student: st
      ? { id: st._id, full_name: st.fullName, class: st.className }
      : undefined,
  };
}

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

    // Iherezo ry'itariki: umunsi wuzura (intera ndangagaciro)
    endDate.setHours(23, 59, 59, 999);

    const rows = await Payment.find({
      paymentDate: { $gte: startDate, $lte: endDate },
    })
      .populate('student', 'fullName className')
      .sort({ paymentDate: -1 });

    const total = rows.reduce((sum, row) => sum + (row.amount || 0), 0);

    return res.json({
      start: String(start),
      end: String(end),
      payments: rows.map(toApi),
      total_amount_paid: total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to build report' });
  }
});

export default router;

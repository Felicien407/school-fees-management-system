import { Router } from 'express';
import { query } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { paymentSelect, toPaymentApi } from '../utils/mappers.js';

const router = Router();
router.use(protect);

router.get('/', async (_req, res) => {
  try {
    const rows = await query(`${paymentSelect} ORDER BY p.payment_date DESC`);
    return res.json(rows.map(toPaymentApi));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list payments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { student_id, amount, payment_date } = req.body;
    if (!student_id || amount === undefined || amount === null || !payment_date) {
      return res.status(400).json({ message: 'Student, amount and payment date are required' });
    }
    const students = await query('SELECT id FROM students WHERE id = ?', [student_id]);
    if (!students.length) return res.status(404).json({ message: 'Student not found' });

    const num = Number(amount);
    if (Number.isNaN(num) || num < 0) {
      return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
    }

    const result = await query(
      'INSERT INTO payments (student_id, amount, payment_date) VALUES (?, ?, ?)',
      [student_id, num, payment_date]
    );
    const rows = await query(`${paymentSelect} WHERE p.id = ?`, [result.insertId]);
    return res.status(201).json(toPaymentApi(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create payment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Payment not found' });

    const { student_id, amount, payment_date } = req.body;
    const current = existing[0];

    if (student_id !== undefined) {
      const students = await query('SELECT id FROM students WHERE id = ?', [student_id]);
      if (!students.length) return res.status(404).json({ message: 'Student not found' });
    }
    if (amount !== undefined) {
      const num = Number(amount);
      if (Number.isNaN(num) || num < 0) {
        return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
      }
    }

    await query(
      'UPDATE payments SET student_id = ?, amount = ?, payment_date = ? WHERE id = ?',
      [
        student_id !== undefined ? student_id : current.student_id,
        amount !== undefined ? Number(amount) : current.amount,
        payment_date !== undefined ? payment_date : current.payment_date,
        req.params.id,
      ]
    );
    const rows = await query(`${paymentSelect} WHERE p.id = ?`, [req.params.id]);
    return res.json(toPaymentApi(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update payment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM payments WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Payment not found' });
    return res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

export default router;

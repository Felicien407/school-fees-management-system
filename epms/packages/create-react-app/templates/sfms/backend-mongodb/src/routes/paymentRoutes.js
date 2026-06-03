import { Router } from 'express';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment.js';
import { Student } from '../models/Student.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

function toApi(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  const st = o.student && typeof o.student === 'object' ? o.student : null;
  return {
    id: o._id,
    student_id: o.student?._id ?? o.student,
    amount: o.amount,
    payment_date: o.paymentDate?.toISOString?.().slice(0, 10) ?? o.paymentDate,
    created_at: o.created_at,
    student: st
      ? {
          id: st._id,
          full_name: st.fullName,
          class: st.className,
          parent_phone: st.parentPhone,
        }
      : undefined,
  };
}

router.get('/', async (req, res) => {
  try {
    const rows = await Payment.find()
      .populate('student', 'fullName className parentPhone')
      .sort({ paymentDate: -1 });
    return res.json(rows.map(toApi));
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
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ message: 'Invalid student id' });
    }
    const student = await Student.findById(student_id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const num = Number(amount);
    if (Number.isNaN(num) || num < 0) {
      return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
    }

    const payment = await Payment.create({
      student: student_id,
      amount: num,
      paymentDate: new Date(payment_date),
    });
    await payment.populate('student', 'fullName className parentPhone');
    return res.status(201).json(toApi(payment));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create payment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { student_id, amount, payment_date } = req.body;
    const patch = {};
    if (student_id !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({ message: 'Invalid student id' });
      }
      const student = await Student.findById(student_id);
      if (!student) return res.status(404).json({ message: 'Student not found' });
      patch.student = student_id;
    }
    if (amount !== undefined) {
      const num = Number(amount);
      if (Number.isNaN(num) || num < 0) {
        return res.status(400).json({ message: 'Amount must be a valid non-negative number' });
      }
      patch.amount = num;
    }
    if (payment_date !== undefined) patch.paymentDate = new Date(payment_date);

    const payment = await Payment.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    }).populate('student', 'fullName className parentPhone');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    return res.json(toApi(payment));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update payment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    return res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

export default router;

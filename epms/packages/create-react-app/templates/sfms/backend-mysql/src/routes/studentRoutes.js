import { Router } from 'express';
import { query } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import { toStudentApi } from '../utils/mappers.js';

const router = Router();
router.use(protect);

router.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM students ORDER BY created_at DESC');
    return res.json(rows.map(toStudentApi));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list students' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { full_name, class: className, parent_phone } = req.body;
    if (!full_name || !className || !parent_phone) {
      return res.status(400).json({ message: 'Full name, class and parent phone are required' });
    }
    const result = await query(
      'INSERT INTO students (full_name, class_name, parent_phone) VALUES (?, ?, ?)',
      [String(full_name).trim(), String(className).trim(), String(parent_phone).trim()]
    );
    const rows = await query('SELECT * FROM students WHERE id = ?', [result.insertId]);
    return res.status(201).json(toStudentApi(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create student' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Student not found' });

    const { full_name, class: className, parent_phone } = req.body;
    const current = rows[0];
    await query(
      'UPDATE students SET full_name = ?, class_name = ?, parent_phone = ? WHERE id = ?',
      [
        full_name !== undefined ? String(full_name).trim() : current.full_name,
        className !== undefined ? String(className).trim() : current.class_name,
        parent_phone !== undefined ? String(parent_phone).trim() : current.parent_phone,
        req.params.id,
      ]
    );
    const updated = await query('SELECT * FROM students WHERE id = ?', [req.params.id]);
    return res.json(toStudentApi(updated[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update student' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Student not found' });
    return res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Student has payments; delete payments first' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

export default router;

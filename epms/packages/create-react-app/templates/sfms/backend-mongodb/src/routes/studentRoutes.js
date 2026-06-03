import { Router } from 'express';
import { Student } from '../models/Student.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

function toApi(doc) {
  if (!doc) return null;
  const o = doc.toObject ? doc.toObject() : doc;
  return {
    id: o._id,
    full_name: o.fullName,
    class: o.className,
    parent_phone: o.parentPhone,
    created_at: o.created_at,
  };
}

router.get('/', async (req, res) => {
  try {
    const rows = await Student.find().sort({ created_at: -1 });
    return res.json(rows.map(toApi));
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
    const student = await Student.create({
      fullName: String(full_name).trim(),
      className: String(className).trim(),
      parentPhone: String(parent_phone).trim(),
    });
    return res.status(201).json(toApi(student));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create student' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { full_name, class: className, parent_phone } = req.body;
    const patch = {};
    if (full_name !== undefined) patch.fullName = String(full_name).trim();
    if (className !== undefined) patch.className = String(className).trim();
    if (parent_phone !== undefined) patch.parentPhone = String(parent_phone).trim();

    const student = await Student.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.json(toApi(student));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update student' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete' });
  }
});

export default router;

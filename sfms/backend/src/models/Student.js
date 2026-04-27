import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export const Student = mongoose.model('Student', studentSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'staff'], default: 'admin' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
);

export const User = mongoose.model('User', userSchema);

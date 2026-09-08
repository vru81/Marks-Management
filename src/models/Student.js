import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    class: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    division: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    }
  },
  { timestamps: true }
);

studentSchema.index({ class: 1, division: 1, rollNumber: 1 }, { unique: true });

export const Student = mongoose.model('Student', studentSchema);

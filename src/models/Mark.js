import mongoose from 'mongoose';

const markSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
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
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    exam: {
      type: String,
      required: true,
      trim: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

markSchema.index(
  { teacher: 1, student: 1, class: 1, division: 1, subject: 1, exam: 1 },
  { unique: true }
);

export const Mark = mongoose.model('Mark', markSchema);

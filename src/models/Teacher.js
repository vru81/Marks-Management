import mongoose from 'mongoose';

const classDivisionSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
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
    subjects: {
      type: [String],
      required: true,
      validate: {
        validator: (subjects) => Array.isArray(subjects) && subjects.length > 0,
        message: 'At least one subject is required'
      }
    }
  },
  { _id: false }
);

const teacherSchema = new mongoose.Schema(
  {
    externalId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    classTeacherOf: {
      type: [classDivisionSchema],
      default: []
    },
    assignments: {
      type: [assignmentSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Teacher = mongoose.model('Teacher', teacherSchema);

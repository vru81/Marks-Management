import { Mark } from '../models/Mark.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { canTeachAssignment, normalizeDivision } from '../utils/teacherAccess.js';

function httpError(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}

async function saveTeacherMark(teacher, body = {}) {
  const { studentId, class: classNumber, division, subject, exam, marksObtained, maxMarks } = body;

  if (!studentId || !classNumber || !division || !subject || !exam || marksObtained === undefined || !maxMarks) {
    throw httpError('studentId, class, division, subject, exam, marksObtained, and maxMarks are required', 400);
  }

  const numericMarksObtained = Number(marksObtained);
  const numericMaxMarks = Number(maxMarks);

  if (!Number.isFinite(numericMarksObtained) || !Number.isFinite(numericMaxMarks)) {
    throw httpError('marksObtained and maxMarks must be valid numbers', 400);
  }

  if (numericMarksObtained < 0 || numericMaxMarks < 1 || numericMarksObtained > numericMaxMarks) {
    throw httpError('marksObtained must be between 0 and maxMarks, and maxMarks must be at least 1', 400);
  }

  if (!canTeachAssignment(teacher, classNumber, division, subject)) {
    throw httpError('Teacher can add marks only for assigned class, division, and subject', 403);
  }

  const normalizedDivision = normalizeDivision(division);
  const student = await Student.findOne({
    _id: studentId,
    class: Number(classNumber),
    division: normalizedDivision
  });

  if (!student) {
    throw httpError('Student not found in this class and division', 404);
  }

  return Mark.findOneAndUpdate(
    {
      teacher: teacher._id,
      student: student._id,
      class: Number(classNumber),
      division: normalizedDivision,
      subject: subject.trim(),
      exam: exam.trim()
    },
    {
      teacher: teacher._id,
      student: student._id,
      class: Number(classNumber),
      division: normalizedDivision,
      subject: subject.trim(),
      exam: exam.trim(),
      marksObtained: numericMarksObtained,
      maxMarks: numericMaxMarks
    },
    { new: true, runValidators: true, upsert: true }
  ).populate('student', 'name rollNumber class division');
}

async function findTeacherMarks(teacher, queryParams) {
  const { class: classNumber, division, subject, exam } = queryParams;

  if (!classNumber || !division || !subject) {
    throw httpError('class, division, and subject query params are required', 400);
  }

  if (!canTeachAssignment(teacher, classNumber, division, subject)) {
    throw httpError('Teacher can view marks only for assigned class, division, and subject', 403);
  }

  const query = {
    teacher: teacher._id,
    class: Number(classNumber),
    division: normalizeDivision(division),
    subject: subject.trim()
  };

  if (exam) {
    query.exam = exam.trim();
  }

  return Mark.find(query)
    .populate('student', 'name rollNumber class division')
    .sort({ createdAt: -1 });
}

export const addOrUpdateMark = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.teacherId);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  const mark = await saveTeacherMark(teacher, req.body);

  res.status(201).json({ mark });
});

export const addOrUpdateMyMark = asyncHandler(async (req, res) => {
  const mark = await saveTeacherMark(req.teacher, req.body);

  res.status(201).json({ mark });
});

export const getMarksForTeacherScope = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.teacherId);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  const marks = await findTeacherMarks(teacher, req.query);

  res.json({ marks });
});

export const getMyMarksForScope = asyncHandler(async (req, res) => {
  const marks = await findTeacherMarks(req.teacher, req.query);

  res.json({ marks });
});

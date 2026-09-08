import { Router } from 'express';
import {
  getAssignableStudents,
  getTeacherApiData,
  getTeacherAssignments,
  getTeacherById,
  getTeachers
} from '../controllers/teacherController.js';
import { addOrUpdateMark, getMarksForTeacherScope } from '../controllers/markController.js';
import { ensureOwnTeacherId, protectTeacher } from '../middleware/authMiddleware.js';

export const teacherRouter = Router();

teacherRouter.get('/', getTeachers);
teacherRouter.get('/data', getTeacherApiData);
teacherRouter.get('/:teacherId', getTeacherById);
teacherRouter.get('/:teacherId/assignments', protectTeacher, ensureOwnTeacherId, getTeacherAssignments);
teacherRouter.get('/:teacherId/students', protectTeacher, ensureOwnTeacherId, getAssignableStudents);
teacherRouter.get('/:teacherId/marks', protectTeacher, ensureOwnTeacherId, getMarksForTeacherScope);
teacherRouter.post('/:teacherId/marks', protectTeacher, ensureOwnTeacherId, addOrUpdateMark);

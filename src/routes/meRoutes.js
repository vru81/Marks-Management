import { Router } from 'express';
import { getMyAssignableStudents, getMyAssignments } from '../controllers/teacherController.js';
import { addOrUpdateMyMark, getMyMarksForScope } from '../controllers/markController.js';

export const meRouter = Router();

meRouter.get('/assignments', getMyAssignments);
meRouter.get('/students', getMyAssignableStudents);
meRouter.get('/marks', getMyMarksForScope);
meRouter.post('/marks', addOrUpdateMyMark);

import { Router } from 'express';
import {
  createSubmission,
  getMySubmissions,
  getSubmission,
  getAssignmentSubmissions,
  getSubmissionVersions,
  getAllSubmissions,
  getTeacherAssignmentsWithSubmissions,
  getStudentAssignmentsWithSubmissions,
} from '../controllers/submission.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacher, requireStudent } from '../middleware/role.middleware';
import { validate } from '../middleware/error.middleware';
import { handleSubmissionUpload } from '../middleware/upload.middleware';
import {
  createSubmissionSchema,
  getSubmissionsSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/', requireTeacher, getAllSubmissions);
router.get('/my', getMySubmissions);
router.get('/teacher/assignments-with-submissions', requireTeacher, getTeacherAssignmentsWithSubmissions);
router.get('/student/assignments-with-my-submissions', requireStudent, getStudentAssignmentsWithSubmissions);
router.get('/:id', validate(idParamSchema), getSubmission);

router.post('/:assignmentId', requireStudent, handleSubmissionUpload, validate(createSubmissionSchema), createSubmission);

router.get('/assignment/:assignmentId', requireTeacher, validate(getSubmissionsSchema), getAssignmentSubmissions);
router.get('/versions/:assignmentId', validate(idParamSchema), getSubmissionVersions);

export default router;

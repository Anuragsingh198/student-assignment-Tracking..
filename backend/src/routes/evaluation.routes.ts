import { Router } from 'express';
import {
  evaluateSubmission,
  getSubmissionFeedback,
  updateFeedback,
} from '../controllers/evaluation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacher } from '../middleware/role.middleware';
import { validate } from '../middleware/error.middleware';
import {
  evaluateSubmissionSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

router.use(authenticate);

router.get('/feedback/:submissionId', validate(idParamSchema), getSubmissionFeedback);

router.post('/:submissionId', requireTeacher, validate(evaluateSubmissionSchema), evaluateSubmission);
router.put('/feedback/:submissionId', requireTeacher, validate(idParamSchema), updateFeedback);

export default router;

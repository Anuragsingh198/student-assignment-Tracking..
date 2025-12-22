import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  unpublishAssignment,
} from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacher } from '../middleware/role.middleware';
import { validate } from '../middleware/error.middleware';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  idParamSchema,
} from '../utils/validation';

const router = Router();

router.use(authenticate);

router.post('/', requireTeacher, validate(createAssignmentSchema), createAssignment);
router.put('/:id', requireTeacher, validate(updateAssignmentSchema), updateAssignment);
router.delete('/:id', requireTeacher, validate(idParamSchema), deleteAssignment);
router.patch('/:id/publish', requireTeacher, validate(idParamSchema), publishAssignment);
router.patch('/:id/unpublish', requireTeacher, validate(idParamSchema), unpublishAssignment);

router.get('/', getAssignments);
router.get('/:id', validate(idParamSchema), getAssignment);

export default router;

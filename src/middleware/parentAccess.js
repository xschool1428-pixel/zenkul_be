import { assertParentCanAccessStudent, getParentStudentIds } from '../services/rbac.service.js';
import { ForbiddenError } from '../utils/errors.js';

export async function requireParentChildAccess(req, res, next) {
  try {
    const studentId = req.params.studentId || req.body.studentId || req.query.studentId;
    if (!studentId) {
      return next(new ForbiddenError('studentId required'));
    }
    await assertParentCanAccessStudent(req.userId, studentId);
    req.studentId = studentId;
    next();
  } catch (err) {
    next(err);
  }
}

export async function loadParentContext(req, res, next) {
  try {
    req.parentStudentIds = await getParentStudentIds(req.userId);
    next();
  } catch (err) {
    next(err);
  }
}

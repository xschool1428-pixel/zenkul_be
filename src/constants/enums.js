export const ENTITY_STATUS = ['active', 'inactive', 'suspended', 'pending'];
export const SUBSCRIPTION_STATUS = ['trialing', 'active', 'past_due', 'canceled', 'paused'];
export const INVOICE_STATUS = ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void', 'refunded'];
export const PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded'];
export const ENROLLMENT_STATUS = ['active', 'promoted', 'transferred', 'withdrawn', 'alumni'];
export const ATTENDANCE_STATUS = ['present', 'absent', 'late', 'half_day', 'leave', 'holiday'];
export const ROLE_SCOPE = ['organization', 'school', 'class', 'section'];
export const PERMISSION_EFFECT = ['allow', 'deny'];

export const PAYMENT_PURPOSE = {
  STUDENT_FEE: 'student_fee',
  PLATFORM_SUBSCRIPTION: 'platform_subscription',
};

export const RAZORPAY_LINKED_ACCOUNT_STATUS = ['created', 'activated', 'suspended', 'rejected'];

/** @deprecated use RATING_TYPE + performance instead */
export const RATING_CATEGORIES = [
  'behavior',
  'academic',
  'discipline',
  'sports',
  'attendance',
  'overall',
];

/** Industrial performance bands (CBSE/ICSE-style descriptors) */
export const RATING_PERFORMANCE = [
  'excellent',
  'very_good',
  'good',
  'satisfactory',
  'needs_improvement',
  'unsatisfactory',
];

/** Flags for dashboards, alerts, remedial tracking */
export const RATING_FLAG = [
  'normal',
  'on_track',
  'improvement_needed',
  'concern',
  'excellence',
  'remedial',
];

/** Assessment / rating type */
export const RATING_TYPE = [
  'formative',
  'summative',
  'chapter_assessment',
  'topic_quiz',
  'assignment',
  'project',
  'oral',
  'practical',
  'unit_test',
  'homework',
];

export const RATING_STATUS = ['draft', 'published', 'archived'];

export const NOTIFICATION_CHANNELS = ['in_app', 'email', 'sms', 'push'];

export const CLASSROOM_MATERIAL_TYPES = [
  'note',
  'homework',
  'revision',
  'important',
  'announcement',
  'assignment',
];

export const CLASSROOM_INVITE_STATUS = ['pending', 'accepted', 'expired', 'revoked'];

export const CLASSROOM_MEMBER_ROLES = ['student', 'teacher', 'admin'];

export const MATERIAL_PUBLISH_STATUS = ['draft', 'published', 'archived'];

export const SUBMISSION_STATUS = ['submitted', 'late', 'graded', 'returned'];

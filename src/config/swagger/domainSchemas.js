/**
 * OpenAPI schemas for domain APIs — mirrors Joi validators and model shapes.
 */
import { objectIdSchema as OID } from './billingSchemas.js';

const ts = { type: 'string', format: 'date-time' };
const date = { type: 'string', format: 'date' };

// ─── Shared fragments ───────────────────────────────────────────────

export const studentProfileSchema = {
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    dateOfBirth: date,
    gender: { type: 'string' },
    aadhaar: { type: 'string', pattern: '^\\d{12}$' },
  },
};

export const enrollmentInputSchema = {
  type: 'object',
  required: ['academicYearId', 'schoolClassId', 'sectionId'],
  properties: {
    academicYearId: OID,
    schoolClassId: OID,
    sectionId: OID,
    rollNumber: { type: 'string' },
  },
};

export const guardianInputSchema = {
  type: 'object',
  required: ['phone'],
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    relationship: { type: 'string' },
    aadhaar: { type: 'string', pattern: '^\\d{12}$' },
  },
};

export const invoiceLineInputSchema = {
  type: 'object',
  required: ['description', 'lineTotalPaise'],
  properties: {
    description: { type: 'string' },
    lineTotalPaise: { type: 'integer', minimum: 1 },
    feeCategoryId: OID,
  },
};

export const topicInputSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string' },
    sortOrder: { type: 'integer' },
  },
};

// ─── Request bodies ─────────────────────────────────────────────────

export const createOrganizationRequest = {
  type: 'object',
  required: ['name', 'slug', 'email'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 200 },
    slug: { type: 'string', minLength: 2, maxLength: 80 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    countryCode: { type: 'string', minLength: 2, maxLength: 2, default: 'IN' },
    city: { type: 'string' },
  },
};

export const createSchoolRequest = {
  type: 'object',
  required: ['organizationId', 'name', 'code', 'email'],
  properties: {
    organizationId: OID,
    name: { type: 'string', minLength: 2, maxLength: 200 },
    code: { type: 'string', minLength: 2, maxLength: 50 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    city: { type: 'string' },
  },
};

export const updateSchoolRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 200 },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    city: { type: 'string' },
  },
};

export const createStudentRequest = {
  type: 'object',
  required: ['admissionNumber'],
  properties: {
    admissionNumber: { type: 'string' },
    userId: OID,
    admissionDate: date,
    profile: studentProfileSchema,
    enrollment: enrollmentInputSchema,
    guardian: guardianInputSchema,
  },
};

export const updateStudentRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    status: { type: 'string', enum: ['active', 'inactive', 'graduated', 'transferred'] },
    admissionNumber: { type: 'string' },
    profile: { type: 'object', additionalProperties: true },
  },
};

export const updateStudentAadhaarRequest = {
  type: 'object',
  properties: {
    aadhaar: { type: 'string', pattern: '^\\d{12}$', example: '123456789012' },
  },
};

export const createEnrollmentRequest = {
  type: 'object',
  required: ['academicYearId', 'schoolClassId', 'sectionId'],
  properties: {
    studentId: OID,
    academicYearId: OID,
    schoolClassId: OID,
    sectionId: OID,
    rollNumber: { type: 'string' },
  },
};

export const promoteStudentRequest = {
  type: 'object',
  required: ['newClassId', 'newSectionId'],
  properties: {
    newClassId: OID,
    newSectionId: OID,
    newYearId: OID,
  },
};

export const createTeacherRequest = {
  type: 'object',
  required: ['userId', 'employeeCode'],
  properties: {
    userId: OID,
    employeeCode: { type: 'string' },
    joiningDate: date,
    qualification: { type: 'string' },
    department: { type: 'string' },
    employmentType: { type: 'string', enum: ['full_time', 'part_time', 'contract'] },
  },
};

export const updateTeacherRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    qualification: { type: 'string' },
    department: { type: 'string' },
    status: { type: 'string' },
    employmentType: { type: 'string' },
  },
};

export const createSubjectRequest = {
  type: 'object',
  required: ['code', 'name'],
  properties: {
    code: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    isElective: { type: 'boolean' },
  },
};

export const updateSubjectRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    code: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
  },
};

export const createGuardianRequest = {
  type: 'object',
  required: ['firstName', 'lastName', 'phone'],
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    aadhaar: { type: 'string', pattern: '^\\d{12}$' },
  },
};

export const linkGuardianRequest = {
  type: 'object',
  required: ['guardianId'],
  properties: {
    guardianId: OID,
    relationship: { type: 'string', default: 'guardian' },
    isPrimary: { type: 'boolean' },
  },
};

export const createAcademicYearRequest = {
  type: 'object',
  required: ['name', 'startDate', 'endDate'],
  properties: {
    name: { type: 'string', example: '2025-26' },
    startDate: date,
    endDate: date,
    isCurrent: { type: 'boolean' },
  },
};

export const createSchoolClassRequest = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', example: 'Class 10' },
    sortOrder: { type: 'integer' },
  },
};

export const createSectionRequest = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', example: 'A' },
    capacity: { type: 'integer', minimum: 1 },
  },
};

export const createTermRequest = {
  type: 'object',
  required: ['academicYearId', 'name', 'code', 'startDate', 'endDate'],
  properties: {
    academicYearId: OID,
    name: { type: 'string' },
    code: { type: 'string' },
    startDate: date,
    endDate: date,
    sortOrder: { type: 'integer', default: 1 },
    isCurrent: { type: 'boolean', default: false },
  },
};

export const createChapterRequest = {
  type: 'object',
  required: ['academicYearId', 'subjectId', 'chapterNumber', 'chapterName'],
  properties: {
    academicYearId: OID,
    subjectId: OID,
    schoolClassId: OID,
    chapterNumber: { type: 'integer', minimum: 1 },
    chapterName: { type: 'string' },
    topics: { type: 'array', items: topicInputSchema },
    plannedHours: { type: 'number' },
  },
};

export const updateRatingRequest = {
  type: 'object',
  minProperties: 1,
  properties: {
    performance: {
      type: 'string',
      enum: ['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
    },
    score: { type: 'number', minimum: 0 },
    maxScore: { type: 'number', minimum: 1 },
    flag: {
      type: 'string',
      enum: ['normal', 'on_track', 'improvement_needed', 'concern', 'excellence', 'remedial'],
    },
    remarks: { type: 'string', maxLength: 2000 },
    chapter: { type: 'string' },
    topic: { type: 'string' },
    ratedDate: date,
    status: { type: 'string', enum: ['draft', 'published', 'archived'] },
  },
};

export const markAttendanceRequest = {
  type: 'object',
  required: ['studentId', 'attendanceDate', 'status'],
  properties: {
    studentId: OID,
    attendanceDate: date,
    status: {
      type: 'string',
      enum: ['present', 'absent', 'late', 'excused', 'half_day'],
    },
    remarks: { type: 'string' },
  },
};

export const createExamRequest = {
  type: 'object',
  required: ['name', 'academicYearId'],
  properties: {
    name: { type: 'string' },
    academicYearId: OID,
    examType: { type: 'string' },
    startDate: date,
    endDate: date,
  },
};

export const upsertExamResultRequest = {
  type: 'object',
  required: ['examId', 'studentId', 'subjectId'],
  properties: {
    examId: OID,
    studentId: OID,
    subjectId: OID,
    marksObtained: { type: 'number', minimum: 0 },
    grade: { type: 'string' },
    isAbsent: { type: 'boolean' },
    remarks: { type: 'string' },
    published: { type: 'boolean' },
  },
};

export const createFeeCategoryRequest = {
  type: 'object',
  required: ['code', 'name'],
  properties: {
    code: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
  },
};

export const createFeeStructureRequest = {
  type: 'object',
  required: ['feeCategoryId', 'academicYearId', 'amountPaise'],
  properties: {
    feeCategoryId: OID,
    academicYearId: OID,
    schoolClassId: OID,
    amountPaise: { type: 'integer', minimum: 0 },
    dueDayOfMonth: { type: 'integer', minimum: 1, maximum: 31 },
  },
};

export const createInvoiceRequest = {
  type: 'object',
  required: ['studentId', 'academicYearId', 'dueAt', 'lines'],
  properties: {
    studentId: OID,
    academicYearId: OID,
    dueAt: date,
    lines: { type: 'array', minItems: 1, items: invoiceLineInputSchema },
  },
};

export const assignRoleRequest = {
  type: 'object',
  required: ['userId', 'roleId'],
  properties: {
    userId: OID,
    roleId: OID,
    organizationId: OID,
    schoolId: OID,
  },
};

export const refreshTokenRequest = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string' },
  },
};

export const joinClassroomRequest = {
  type: 'object',
  required: ['inviteCode'],
  properties: {
    inviteCode: { type: 'string' },
    studentId: OID,
  },
};

export const submitHomeworkRequest = {
  type: 'object',
  properties: {
    studentId: OID,
    content: { type: 'string' },
    attachments: { type: 'array', items: { type: 'object' } },
  },
};

export const initiateFeePaymentRequest = {
  type: 'object',
  required: ['invoiceId'],
  properties: {
    invoiceId: OID,
    idempotencyKey: { type: 'string' },
  },
};

export const ratingQueryParams = [
  { in: 'query', name: 'studentId', schema: OID },
  { in: 'query', name: 'academicYearId', schema: OID },
  { in: 'query', name: 'sessionId', schema: OID },
  { in: 'query', name: 'schoolClassId', schema: OID },
  { in: 'query', name: 'sectionId', schema: OID },
  { in: 'query', name: 'subjectId', schema: OID },
  { in: 'query', name: 'chapter', schema: { type: 'string' } },
  { in: 'query', name: 'topic', schema: { type: 'string' } },
  {
    in: 'query',
    name: 'flag',
    schema: {
      type: 'string',
      enum: ['normal', 'on_track', 'improvement_needed', 'concern', 'excellence', 'remedial'],
    },
  },
  {
    in: 'query',
    name: 'performance',
    schema: {
      type: 'string',
      enum: ['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
    },
  },
  { in: 'query', name: 'ratingType', schema: { type: 'string' } },
  { in: 'query', name: 'status', schema: { type: 'string', enum: ['draft', 'published', 'archived'] } },
  { in: 'query', name: 'from', schema: date },
  { in: 'query', name: 'to', schema: date },
];

export const invoiceListQueryParams = [
  { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
  { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
  { in: 'query', name: 'studentId', schema: OID },
  {
    in: 'query',
    name: 'status',
    schema: {
      type: 'string',
      enum: ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'],
    },
  },
];

// ─── Entity / response schemas ──────────────────────────────────────

export const organization = {
  type: 'object',
  properties: {
    _id: OID,
    name: { type: 'string' },
    slug: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    countryCode: { type: 'string' },
    city: { type: 'string' },
    status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending'] },
    createdAt: ts,
    updatedAt: ts,
  },
};

export const school = {
  type: 'object',
  properties: {
    _id: OID,
    organizationId: OID,
    name: { type: 'string' },
    code: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phone: { type: 'string' },
    city: { type: 'string' },
    status: { type: 'string' },
    razorpayLinkedAccountId: { type: 'string' },
    razorpayAccountStatus: { type: 'string' },
    createdAt: ts,
    updatedAt: ts,
  },
};

export const student = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    userId: OID,
    admissionNumber: { type: 'string' },
    admissionDate: date,
    status: { type: 'string', enum: ['active', 'inactive', 'graduated', 'transferred'] },
    profile: studentProfileSchema,
    createdAt: ts,
    updatedAt: ts,
  },
};

export const studentEnrollment = {
  type: 'object',
  properties: {
    _id: OID,
    studentId: OID,
    academicYearId: OID,
    schoolClassId: OID,
    sectionId: OID,
    rollNumber: { type: 'string' },
    status: { type: 'string' },
    createdAt: ts,
  },
};

export const teacher = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    userId: OID,
    employeeCode: { type: 'string' },
    joiningDate: date,
    qualification: { type: 'string' },
    department: { type: 'string' },
    employmentType: { type: 'string' },
    status: { type: 'string' },
    createdAt: ts,
  },
};

export const subject = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    code: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    isElective: { type: 'boolean' },
    createdAt: ts,
  },
};

export const guardian = {
  type: 'object',
  properties: {
    _id: OID,
    userId: OID,
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    createdAt: ts,
  },
};

export const studentGuardianLink = {
  type: 'object',
  properties: {
    guardianId: OID,
    relationship: { type: 'string' },
    isPrimary: { type: 'boolean' },
    guardian: guardian,
  },
};

export const academicYear = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    name: { type: 'string' },
    startDate: date,
    endDate: date,
    isCurrent: { type: 'boolean' },
  },
};

export const schoolClass = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    name: { type: 'string' },
    sortOrder: { type: 'integer' },
  },
};

export const section = {
  type: 'object',
  properties: {
    _id: OID,
    schoolClassId: OID,
    name: { type: 'string' },
    capacity: { type: 'integer' },
  },
};

export const term = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    academicYearId: OID,
    name: { type: 'string' },
    code: { type: 'string' },
    startDate: date,
    endDate: date,
    sortOrder: { type: 'integer' },
    isCurrent: { type: 'boolean' },
  },
};

export const academicStructure = {
  type: 'object',
  properties: {
    academicYears: { type: 'array', items: academicYear },
    classes: { type: 'array', items: schoolClass },
    sections: { type: 'array', items: section },
    terms: { type: 'array', items: term },
  },
};

export const subjectChapter = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    academicYearId: OID,
    subjectId: OID,
    schoolClassId: OID,
    chapterNumber: { type: 'integer' },
    chapterName: { type: 'string' },
    topics: { type: 'array', items: topicInputSchema },
    plannedHours: { type: 'number' },
  },
};

export const studentRating = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    studentId: OID,
    academicYearId: OID,
    sessionId: OID,
    schoolClassId: OID,
    sectionId: OID,
    subjectId: OID,
    chapter: { type: 'string' },
    topic: { type: 'string' },
    ratedDate: date,
    score: { type: 'number' },
    maxScore: { type: 'number' },
    performance: { type: 'string' },
    flag: { type: 'string' },
    ratingType: { type: 'string' },
    status: { type: 'string' },
    remarks: { type: 'string' },
    teacherId: OID,
    createdAt: ts,
  },
};

export const ratingSummary = {
  type: 'object',
  properties: {
    studentId: OID,
    totalRatings: { type: 'integer' },
    averageScore: { type: 'number' },
    byPerformance: { type: 'object', additionalProperties: { type: 'integer' } },
    byFlag: { type: 'object', additionalProperties: { type: 'integer' } },
  },
};

export const classroom = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    name: { type: 'string' },
    description: { type: 'string' },
    academicYearId: OID,
    sessionId: OID,
    schoolClassId: OID,
    sectionId: OID,
    primaryTeacherId: OID,
    inviteCode: { type: 'string' },
    memberCount: { type: 'integer' },
    createdAt: ts,
  },
};

export const classroomMaterial = {
  type: 'object',
  properties: {
    _id: OID,
    classroomId: OID,
    subjectId: OID,
    materialType: {
      type: 'string',
      enum: ['note', 'homework', 'revision', 'important', 'announcement', 'assignment'],
    },
    title: { type: 'string' },
    content: { type: 'string' },
    chapter: { type: 'string' },
    topic: { type: 'string' },
    dueAt: ts,
    isImportant: { type: 'boolean' },
    status: { type: 'string' },
    publishedAt: ts,
    createdAt: ts,
  },
};

export const classroomInvite = {
  type: 'object',
  properties: {
    _id: OID,
    classroomId: OID,
    inviteCode: { type: 'string' },
    status: { type: 'string' },
    expiresAt: ts,
    createdAt: ts,
  },
};

export const attendanceRecord = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    studentId: OID,
    enrollmentId: OID,
    attendanceDate: date,
    status: { type: 'string' },
    remarks: { type: 'string' },
    markedBy: OID,
    createdAt: ts,
  },
};

export const exam = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    name: { type: 'string' },
    academicYearId: OID,
    examType: { type: 'string' },
    startDate: date,
    endDate: date,
    publishedAt: ts,
    status: { type: 'string' },
    createdAt: ts,
  },
};

export const examResult = {
  type: 'object',
  properties: {
    _id: OID,
    examId: OID,
    studentId: OID,
    subjectId: OID,
    marksObtained: { type: 'number' },
    grade: { type: 'string' },
    isAbsent: { type: 'boolean' },
    remarks: { type: 'string' },
    published: { type: 'boolean' },
  },
};

export const feeCategory = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    code: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
  },
};

export const feeStructure = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    feeCategoryId: OID,
    academicYearId: OID,
    schoolClassId: OID,
    amountPaise: { type: 'integer' },
    dueDayOfMonth: { type: 'integer' },
  },
};

export const invoice = {
  type: 'object',
  properties: {
    _id: OID,
    schoolId: OID,
    studentId: OID,
    academicYearId: OID,
    invoiceNumber: { type: 'string' },
    status: {
      type: 'string',
      enum: ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'],
    },
    totalPaise: { type: 'integer' },
    amountPaidPaise: { type: 'integer' },
    dueAt: date,
    lines: { type: 'array', items: invoiceLineInputSchema },
    createdAt: ts,
  },
};

export const paymentInitiation = {
  type: 'object',
  properties: {
    orderId: { type: 'string' },
    amountPaise: { type: 'integer' },
    currency: { type: 'string', example: 'INR' },
    razorpayKeyId: { type: 'string' },
    invoiceId: OID,
    organizationId: OID,
    seatCount: { type: 'integer' },
  },
};

export const billableSeats = {
  type: 'object',
  properties: {
    organizationId: OID,
    seatCount: { type: 'integer' },
    breakdown: {
      type: 'object',
      properties: {
        students: { type: 'integer' },
        teachers: { type: 'integer' },
        staff: { type: 'integer' },
      },
    },
  },
};

export const notification = {
  type: 'object',
  properties: {
    _id: OID,
    userId: OID,
    title: { type: 'string' },
    body: { type: 'string' },
    channel: { type: 'string' },
    readAt: ts,
    createdAt: ts,
  },
};

export const userProfile = {
  type: 'object',
  properties: {
    id: OID,
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    phone: { type: 'string' },
    status: { type: 'string' },
  },
};

export const loginResponse = {
  type: 'object',
  properties: {
    accessToken: { type: 'string' },
    refreshToken: { type: 'string' },
    user: userProfile,
  },
};

export const authContext = {
  type: 'object',
  properties: {
    roles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          roleCode: { type: 'string' },
          roleName: { type: 'string' },
          scopeLevel: { type: 'string' },
          schoolId: OID,
          organizationId: OID,
          abacScope: { type: 'object' },
        },
      },
    },
    permissions: { type: 'array', items: { type: 'string', example: 'student.read' } },
    entitledPermissions: { type: 'array', items: { type: 'string', example: 'student.read' } },
    subscription: {
      oneOf: [
        { $ref: '#/components/schemas/SubscriptionAccessSnapshot' },
        {
          type: 'object',
          properties: {
            access: { type: 'string', enum: ['full'] },
            phase: { type: 'string', enum: ['platform'] },
            canUsePortal: { type: 'boolean' },
          },
        },
      ],
    },
    schools: { type: 'array', items: school },
    organizations: { type: 'array', items: organization },
    guardian: {
      type: 'object',
      nullable: true,
      properties: {
        id: OID,
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    },
    children: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          studentId: OID,
          admissionNumber: { type: 'string' },
          school: school,
          relationship: { type: 'string' },
          isPrimary: { type: 'boolean' },
        },
      },
    },
    isParent: { type: 'boolean' },
  },
};

export const role = {
  type: 'object',
  properties: {
    _id: OID,
    name: { type: 'string' },
    code: { type: 'string' },
    scopeLevel: { type: 'string' },
    organizationId: OID,
    schoolId: OID,
    permissionIds: { type: 'array', items: OID },
    isSystem: { type: 'boolean' },
  },
};

export const userRoleAssignment = {
  type: 'object',
  properties: {
    _id: OID,
    userId: OID,
    roleId: OID,
    organizationId: OID,
    schoolId: OID,
    status: { type: 'string' },
    role: role,
  },
};

export const subscriptionPlan = {
  type: 'object',
  properties: {
    _id: OID,
    code: { type: 'string' },
    name: { type: 'string' },
    billingInterval: { type: 'string', enum: ['monthly', 'yearly'] },
    pricePerUserPaise: { type: 'integer' },
    permissionIds: { type: 'array', items: OID },
    maxSchools: { type: 'integer' },
    isActive: { type: 'boolean' },
  },
};

export const dashboardStats = {
  type: 'object',
  properties: {
    students: { type: 'integer' },
    teachers: { type: 'integer' },
    schools: { type: 'integer' },
    revenuePaise: { type: 'integer' },
    pendingInvoices: { type: 'integer' },
  },
};

export const parentDashboard = {
  type: 'object',
  properties: {
    children: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          student: student,
          school: school,
          attendanceSummary: { type: 'object' },
          recentRatings: { type: 'array', items: studentRating },
          pendingFees: { type: 'array', items: invoice },
        },
      },
    },
  },
};

export const parentChildDetail = {
  type: 'object',
  properties: {
    student: student,
    enrollments: { type: 'array', items: studentEnrollment },
    attendance: { type: 'array', items: attendanceRecord },
    ratings: { type: 'array', items: studentRating },
    examResults: { type: 'array', items: examResult },
    invoices: { type: 'array', items: invoice },
  },
};

export const aadhaarView = {
  type: 'object',
  properties: {
    aadhaar: { type: 'string', example: 'XXXX-XXXX-1234' },
    masked: { type: 'boolean' },
  },
};

export const razorpayOnboardResult = {
  type: 'object',
  properties: {
    linkedAccountId: { type: 'string' },
    status: { type: 'string' },
    onboardingUrl: { type: 'string' },
  },
};

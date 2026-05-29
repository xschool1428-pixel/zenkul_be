import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';
import { swaggerPaths } from './swagger/paths.js';
import * as billingSchemas from './swagger/billingSchemas.js';
import * as domainSchemas from './swagger/domainSchemas.js';

const API_PREFIX = '/api';

function countPaths(paths) {
  let count = 0;
  for (const pathItem of Object.values(paths || {})) {
    count += Object.keys(pathItem).filter((m) =>
      ['get', 'post', 'put', 'patch', 'delete'].includes(m)
    ).length;
  }
  return count;
}

export const SWAGGER_OPERATION_COUNT = countPaths(swaggerPaths);

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'School Education SaaS API',
    version: '2.1.0',
    description: `
Multi-tenant school ERP API — **${SWAGGER_OPERATION_COUNT} endpoints** documented with request/response field schemas.

**Base path:** \`${API_PREFIX}\`

### Authentication
1. \`POST /api/auth/login\` → copy \`accessToken\`
2. Click **Authorize** → enter \`Bearer <token>\`
3. \`GET /api/auth/context\` → copy \`schoolId\` for school routes

### Headers
| Header | When |
|--------|------|
| \`Authorization: Bearer <token>\` | Protected routes |
| \`x-school-id\` | School-scoped modules |
| \`x-organization-id\` | Org billing & admin org routes |

### Pagination
List APIs: \`?page=1&limit=20\` → response includes \`meta\` object.

**Full docs:** [docs/API_REFERENCE.md](../docs/API_REFERENCE.md)
    `,
    contact: { name: 'School SaaS' },
  },
  servers: [
    { url: `http://localhost:${config.port}`, description: 'Local development' },
    { url: '/', description: 'Current host' },
  ],
  tags: [
    { name: '01 - System', description: 'Root, health (outside /api)' },
    { name: '02 - Auth', description: 'Register, login, JWT, roles context' },
    { name: '03 - Organizations', description: 'Multi-tenant organizations' },
    { name: '04 - Schools', description: 'Schools under organization' },
    { name: '05 - Students', description: 'Students, enrollments, Aadhaar' },
    { name: '06 - Parents', description: 'Parent dashboard, multi-child' },
    { name: '07 - Academics', description: 'Years, classes, sections, terms' },
    { name: '08 - Attendance', description: 'Student attendance' },
    { name: '09 - Ratings', description: 'Chapter/topic student ratings' },
    { name: '10 - Chapters', description: 'Subject chapter curriculum' },
    { name: '11 - Classrooms', description: 'Notes, homework, revision, invites' },
    { name: '12 - Invoices', description: 'Fee invoices' },
    { name: '13 - Payments', description: 'Razorpay fees & platform billing' },
    { name: '14 - Notifications', description: 'In-app notifications' },
    { name: '15 - Webhooks', description: 'Razorpay webhooks' },
    { name: '16 - Admin', description: 'Roles, dashboard, audit logs' },
    { name: '17 - Teachers', description: 'Teacher CRUD' },
    { name: '18 - Subjects', description: 'Subject CRUD' },
    { name: '19 - Fees', description: 'Fee categories & structures' },
    { name: '20 - Exams', description: 'Exams & results' },
    { name: '21 - Guardians', description: 'Guardians & student links' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from POST /api/auth/login',
      },
    },
    parameters: {
      schoolIdHeader: {
        in: 'header',
        name: 'x-school-id',
        required: true,
        schema: { type: 'string', pattern: '^[a-f0-9]{24}$' },
        description: 'School MongoDB ObjectId (from GET /api/auth/context)',
      },
      organizationIdHeader: {
        in: 'header',
        name: 'x-organization-id',
        required: true,
        schema: { type: 'string', pattern: '^[a-f0-9]{24}$' },
        description: 'Organization MongoDB ObjectId',
      },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {},
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'array', items: { type: 'object' } },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@demo.edu' },
          password: { type: 'string', example: 'Password123!' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      CreateClassroomRequest: {
        type: 'object',
        required: ['name', 'academicYearId', 'schoolClassId', 'sectionId', 'primaryTeacherId'],
        properties: {
          name: { type: 'string', example: 'Class 10-A Hub' },
          description: { type: 'string' },
          academicYearId: { type: 'string' },
          sessionId: { type: 'string' },
          schoolClassId: { type: 'string' },
          sectionId: { type: 'string' },
          primaryTeacherId: { type: 'string' },
        },
      },
      ClassroomMaterialRequest: {
        type: 'object',
        required: ['subjectId', 'materialType', 'title', 'content'],
        properties: {
          subjectId: { type: 'string' },
          materialType: {
            type: 'string',
            enum: ['note', 'homework', 'revision', 'important', 'announcement', 'assignment'],
          },
          title: { type: 'string' },
          content: { type: 'string' },
          chapter: { type: 'string' },
          topic: { type: 'string' },
          dueAt: { type: 'string', format: 'date-time' },
          isImportant: { type: 'boolean' },
        },
      },
      CreateRatingRequest: {
        type: 'object',
        required: [
          'studentId',
          'academicYearId',
          'sessionId',
          'schoolClassId',
          'sectionId',
          'subjectId',
          'chapter',
          'topic',
          'ratedDate',
          'score',
        ],
        properties: {
          studentId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          academicYearId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          sessionId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          schoolClassId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          sectionId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          subjectId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          chapterId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          chapter: { type: 'string' },
          topic: { type: 'string' },
          ratedDate: { type: 'string', format: 'date' },
          score: { type: 'number', minimum: 0 },
          maxScore: { type: 'number', minimum: 1, default: 100 },
          ratingType: {
            type: 'string',
            enum: [
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
            ],
            default: 'chapter_assessment',
          },
          performance: {
            type: 'string',
            enum: ['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
          },
          flag: {
            type: 'string',
            enum: ['normal', 'on_track', 'improvement_needed', 'concern', 'excellence', 'remedial'],
          },
          remarks: { type: 'string', maxLength: 2000 },
          teacherId: { type: 'string', pattern: '^[a-f0-9]{24}$' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'], default: 'published' },
        },
      },
      CreateSubscriptionPlanRequest: billingSchemas.createSubscriptionPlanRequest,
      UpdateSubscriptionPlanRequest: billingSchemas.updateSubscriptionPlanRequest,
      UpdateOrgBillingRequest: billingSchemas.updateOrgBillingRequest,
      SetOrgPermissionsRequest: billingSchemas.setOrgPermissionsRequest,
      AssignOrgPlanRequest: billingSchemas.assignOrgPlanRequest,
      CreateOrgRoleRequest: billingSchemas.createOrgRoleRequest,
      UpdateOrgRoleRequest: billingSchemas.updateOrgRoleRequest,
      InitiatePlatformPaymentRequest: billingSchemas.initiatePlatformPaymentRequest,
      VerifyRazorpayPaymentRequest: billingSchemas.verifyRazorpayPaymentRequest,
      SubscriptionAccessSnapshot: billingSchemas.subscriptionAccessSnapshot,
      BillingPreviewResponse: billingSchemas.billingPreviewResponse,
      OrgSubscriptionDetailResponse: billingSchemas.orgSubscriptionDetailResponse,
      PermissionCatalogItem: billingSchemas.permissionCatalogItem,
      AuditLogEntry: billingSchemas.auditLogEntry,
      OrganizationListItem: billingSchemas.organizationListItem,
      // Domain request bodies
      CreateOrganizationRequest: domainSchemas.createOrganizationRequest,
      CreateSchoolRequest: domainSchemas.createSchoolRequest,
      UpdateSchoolRequest: domainSchemas.updateSchoolRequest,
      CreateStudentRequest: domainSchemas.createStudentRequest,
      UpdateStudentRequest: domainSchemas.updateStudentRequest,
      UpdateStudentAadhaarRequest: domainSchemas.updateStudentAadhaarRequest,
      CreateEnrollmentRequest: domainSchemas.createEnrollmentRequest,
      PromoteStudentRequest: domainSchemas.promoteStudentRequest,
      CreateTeacherRequest: domainSchemas.createTeacherRequest,
      UpdateTeacherRequest: domainSchemas.updateTeacherRequest,
      CreateSubjectRequest: domainSchemas.createSubjectRequest,
      UpdateSubjectRequest: domainSchemas.updateSubjectRequest,
      CreateGuardianRequest: domainSchemas.createGuardianRequest,
      LinkGuardianRequest: domainSchemas.linkGuardianRequest,
      CreateAcademicYearRequest: domainSchemas.createAcademicYearRequest,
      CreateSchoolClassRequest: domainSchemas.createSchoolClassRequest,
      CreateSectionRequest: domainSchemas.createSectionRequest,
      CreateTermRequest: domainSchemas.createTermRequest,
      CreateChapterRequest: domainSchemas.createChapterRequest,
      UpdateRatingRequest: domainSchemas.updateRatingRequest,
      MarkAttendanceRequest: domainSchemas.markAttendanceRequest,
      CreateExamRequest: domainSchemas.createExamRequest,
      UpsertExamResultRequest: domainSchemas.upsertExamResultRequest,
      CreateFeeCategoryRequest: domainSchemas.createFeeCategoryRequest,
      CreateFeeStructureRequest: domainSchemas.createFeeStructureRequest,
      CreateInvoiceRequest: domainSchemas.createInvoiceRequest,
      AssignRoleRequest: domainSchemas.assignRoleRequest,
      RefreshTokenRequest: domainSchemas.refreshTokenRequest,
      JoinClassroomRequest: domainSchemas.joinClassroomRequest,
      SubmitHomeworkRequest: domainSchemas.submitHomeworkRequest,
      InitiateFeePaymentRequest: domainSchemas.initiateFeePaymentRequest,
      // Domain entities / responses
      Organization: domainSchemas.organization,
      School: domainSchemas.school,
      Student: domainSchemas.student,
      StudentEnrollment: domainSchemas.studentEnrollment,
      Teacher: domainSchemas.teacher,
      Subject: domainSchemas.subject,
      Guardian: domainSchemas.guardian,
      StudentGuardianLink: domainSchemas.studentGuardianLink,
      AcademicYear: domainSchemas.academicYear,
      SchoolClass: domainSchemas.schoolClass,
      Section: domainSchemas.section,
      Term: domainSchemas.term,
      AcademicStructure: domainSchemas.academicStructure,
      SubjectChapter: domainSchemas.subjectChapter,
      StudentRating: domainSchemas.studentRating,
      RatingSummary: domainSchemas.ratingSummary,
      Classroom: domainSchemas.classroom,
      ClassroomMaterial: domainSchemas.classroomMaterial,
      ClassroomInvite: domainSchemas.classroomInvite,
      AttendanceRecord: domainSchemas.attendanceRecord,
      Exam: domainSchemas.exam,
      ExamResult: domainSchemas.examResult,
      FeeCategory: domainSchemas.feeCategory,
      FeeStructure: domainSchemas.feeStructure,
      Invoice: domainSchemas.invoice,
      PaymentInitiation: domainSchemas.paymentInitiation,
      BillableSeats: domainSchemas.billableSeats,
      Notification: domainSchemas.notification,
      UserProfile: domainSchemas.userProfile,
      LoginResponse: domainSchemas.loginResponse,
      AuthContext: domainSchemas.authContext,
      Role: domainSchemas.role,
      UserRoleAssignment: domainSchemas.userRoleAssignment,
      SubscriptionPlan: domainSchemas.subscriptionPlan,
      DashboardStats: domainSchemas.dashboardStats,
      ParentDashboard: domainSchemas.parentDashboard,
      ParentChildDetail: domainSchemas.parentChildDetail,
      AadhaarView: domainSchemas.aadhaarView,
      RazorpayOnboardResult: domainSchemas.razorpayOnboardResult,
    },
  },
  paths: swaggerPaths,
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

/** Count documented operations for sanity check */
export function countSwaggerOperations(spec = swaggerSpec) {
  let count = 0;
  for (const pathItem of Object.values(spec.paths || {})) {
    count += Object.keys(pathItem).filter((m) =>
      ['get', 'post', 'put', 'patch', 'delete'].includes(m)
    ).length;
  }
  return count;
}

export const SWAGGER_UI_PATH = '/api/docs';
export const SWAGGER_JSON_PATH = '/api/docs.json';

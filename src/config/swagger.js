import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index.js';
import { swaggerPaths } from './swagger/paths.js';

const API_PREFIX = '/api';
const objectIdSchema = {
  type: 'string',
  pattern: '^[a-f0-9]{24}$',
  example: '6a145fbd3d6747a666b7ae3d',
};

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'School Education SaaS API',
    version: '2.1.0',
    description: `
Multi-tenant school ERP API — **105 endpoints** documented.

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
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 100 },
              totalPages: { type: 'integer', example: 5 },
            },
          },
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
      CreateSchoolRequest: {
        type: 'object',
        required: ['organizationId', 'name', 'code', 'email'],
        properties: {
          organizationId: objectIdSchema,
          name: { type: 'string', minLength: 2, maxLength: 200, example: 'Demo Public School' },
          code: { type: 'string', minLength: 2, maxLength: 50, example: 'SCH-001' },
          email: { type: 'string', format: 'email', example: 'office@demoschool.edu' },
          phone: { type: 'string', example: '9876543210' },
          city: { type: 'string', example: 'Mumbai' },
        },
      },
      UpdateSchoolRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 200, example: 'Demo Public School Senior Wing' },
          email: { type: 'string', format: 'email', example: 'office@demoschool.edu' },
          phone: { type: 'string', example: '9876543210' },
          city: { type: 'string', example: 'Mumbai' },
        },
      },
      CreateStudentRequest: {
        type: 'object',
        required: ['admissionNumber'],
        properties: {
          admissionNumber: { type: 'string', example: 'ADM-2026-001' },
          userId: objectIdSchema,
          admissionDate: { type: 'string', format: 'date', example: '2026-04-01' },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string', example: 'Aarav' },
              lastName: { type: 'string', example: 'Sharma' },
              dateOfBirth: { type: 'string', format: 'date', example: '2015-08-12' },
              gender: { type: 'string', example: 'male' },
              aadhaar: { type: 'string', pattern: '^\\d{12}$', example: '123456789012' },
            },
          },
          enrollment: {
            type: 'object',
            required: ['academicYearId', 'schoolClassId', 'sectionId'],
            properties: {
              academicYearId: objectIdSchema,
              schoolClassId: objectIdSchema,
              sectionId: objectIdSchema,
              rollNumber: { type: 'string', example: '12' },
            },
          },
          guardian: {
            type: 'object',
            required: ['phone'],
            properties: {
              firstName: { type: 'string', example: 'Raj' },
              lastName: { type: 'string', example: 'Sharma' },
              phone: { type: 'string', example: '9876543210' },
              email: { type: 'string', format: 'email', example: 'parent@example.com' },
              relationship: { type: 'string', example: 'father' },
              aadhaar: { type: 'string', pattern: '^\\d{12}$', example: '234567890123' },
            },
          },
        },
      },
      UpdateStudentRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'graduated', 'transferred'],
            example: 'active',
          },
          admissionNumber: { type: 'string', example: 'ADM-2026-001' },
          profile: {
            type: 'object',
            additionalProperties: true,
            example: { firstName: 'Aarav', lastName: 'Sharma' },
          },
        },
      },
      CreateEnrollmentRequest: {
        type: 'object',
        required: ['academicYearId', 'schoolClassId', 'sectionId'],
        properties: {
          studentId: objectIdSchema,
          academicYearId: objectIdSchema,
          schoolClassId: objectIdSchema,
          sectionId: objectIdSchema,
          rollNumber: { type: 'string', example: '15' },
        },
      },
      PromoteStudentRequest: {
        type: 'object',
        required: ['newClassId', 'newSectionId', 'newYearId'],
        properties: {
          newClassId: objectIdSchema,
          newSectionId: objectIdSchema,
          newYearId: objectIdSchema,
        },
      },
      CreateTeacherRequest: {
        type: 'object',
        required: ['userId', 'employeeCode'],
        properties: {
          userId: objectIdSchema,
          employeeCode: { type: 'string', example: 'T-002' },
          joiningDate: { type: 'string', format: 'date', example: '2025-06-01' },
          qualification: { type: 'string', example: 'B.Ed, M.Sc Mathematics' },
          department: { type: 'string', example: 'Mathematics' },
          employmentType: {
            type: 'string',
            enum: ['full_time', 'part_time', 'contract'],
            example: 'full_time',
          },
        },
      },
      UpdateTeacherRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          qualification: { type: 'string', example: 'B.Ed, M.Sc Mathematics' },
          department: { type: 'string', example: 'Mathematics' },
          status: { type: 'string', example: 'active' },
          employmentType: {
            type: 'string',
            enum: ['full_time', 'part_time', 'contract'],
            example: 'contract',
          },
        },
      },
      CreateSubjectRequest: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: { type: 'string', example: 'SCI' },
          name: { type: 'string', example: 'Science' },
          description: { type: 'string', example: 'Integrated science for middle school' },
          isElective: { type: 'boolean', example: false },
        },
      },
      UpdateSubjectRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          code: { type: 'string', example: 'SCI' },
          name: { type: 'string', example: 'General Science' },
          description: { type: 'string', example: 'Updated description' },
        },
      },
      CreateGuardianRequest: {
        type: 'object',
        required: ['firstName', 'lastName', 'phone'],
        properties: {
          firstName: { type: 'string', example: 'Raj' },
          lastName: { type: 'string', example: 'Sharma' },
          phone: { type: 'string', example: '9876543210' },
          email: { type: 'string', format: 'email', example: 'guardian@example.com' },
          aadhaar: { type: 'string', pattern: '^\\d{12}$', example: '234567890123' },
        },
      },
      LinkGuardianRequest: {
        type: 'object',
        required: ['guardianId'],
        properties: {
          guardianId: objectIdSchema,
          relationship: { type: 'string', example: 'father', default: 'guardian' },
          isPrimary: { type: 'boolean', example: true },
        },
      },
      CreateAcademicYearRequest: {
        type: 'object',
        required: ['name', 'startDate', 'endDate'],
        properties: {
          name: { type: 'string', example: '2026-2027' },
          startDate: { type: 'string', format: 'date', example: '2026-04-01' },
          endDate: { type: 'string', format: 'date', example: '2027-03-31' },
          isCurrent: { type: 'boolean', example: true },
        },
      },
      CreateSchoolClassRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Class 6' },
          sortOrder: { type: 'integer', example: 6 },
        },
      },
      CreateSectionRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'A' },
          capacity: { type: 'integer', minimum: 1, example: 40 },
        },
      },
      CreateTermRequest: {
        type: 'object',
        required: ['academicYearId', 'name', 'code', 'startDate', 'endDate'],
        properties: {
          academicYearId: objectIdSchema,
          name: { type: 'string', example: 'Term 1' },
          code: { type: 'string', example: 'T1' },
          startDate: { type: 'string', format: 'date', example: '2026-04-01' },
          endDate: { type: 'string', format: 'date', example: '2026-09-30' },
          sortOrder: { type: 'integer', default: 1, example: 1 },
          isCurrent: { type: 'boolean', default: false, example: true },
        },
      },
      MarkAttendanceRequest: {
        type: 'object',
        required: ['studentId', 'attendanceDate', 'status'],
        properties: {
          studentId: objectIdSchema,
          attendanceDate: { type: 'string', format: 'date', example: '2026-06-10' },
          status: {
            type: 'string',
            enum: ['present', 'absent', 'late', 'excused', 'half_day'],
            example: 'present',
          },
          remarks: { type: 'string', example: 'Arrived on time' },
        },
      },
      CreateChapterRequest: {
        type: 'object',
        required: ['academicYearId', 'subjectId', 'chapterNumber', 'chapterName'],
        properties: {
          academicYearId: objectIdSchema,
          subjectId: objectIdSchema,
          schoolClassId: objectIdSchema,
          chapterNumber: { type: 'integer', minimum: 1, example: 1 },
          chapterName: { type: 'string', example: 'Numbers and Place Value' },
          topics: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Place value up to lakhs' },
                sortOrder: { type: 'integer', example: 1 },
              },
            },
          },
          plannedHours: { type: 'number', example: 8 },
        },
      },
      UpdateRatingRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          performance: {
            type: 'string',
            enum: ['excellent', 'very_good', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
            example: 'good',
          },
          score: { type: 'number', minimum: 0, example: 42 },
          maxScore: { type: 'number', minimum: 1, example: 50 },
          flag: {
            type: 'string',
            enum: ['normal', 'on_track', 'improvement_needed', 'concern', 'excellence', 'remedial'],
            example: 'on_track',
          },
          remarks: { type: 'string', maxLength: 2000, example: 'Participates well in class' },
          chapter: { type: 'string', example: 'Numbers and Place Value' },
          topic: { type: 'string', example: 'Comparing numbers' },
          ratedDate: { type: 'string', format: 'date', example: '2026-05-15' },
          status: { type: 'string', enum: ['draft', 'published', 'archived'], example: 'published' },
        },
      },
      CreateFeeCategoryRequest: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: { type: 'string', example: 'TRANSPORT' },
          name: { type: 'string', example: 'Transport Fee' },
          description: { type: 'string', example: 'Monthly transport charges' },
        },
      },
      CreateFeeStructureRequest: {
        type: 'object',
        required: ['feeCategoryId', 'academicYearId', 'amountPaise'],
        properties: {
          feeCategoryId: objectIdSchema,
          academicYearId: objectIdSchema,
          schoolClassId: objectIdSchema,
          amountPaise: { type: 'integer', minimum: 0, example: 250000 },
          dueDayOfMonth: { type: 'integer', minimum: 1, maximum: 31, example: 10 },
        },
      },
      CreateExamRequest: {
        type: 'object',
        required: ['name', 'academicYearId'],
        properties: {
          name: { type: 'string', example: 'Mid Term Exam' },
          academicYearId: objectIdSchema,
          examType: { type: 'string', example: 'mid_term' },
          startDate: { type: 'string', format: 'date', example: '2026-09-10' },
          endDate: { type: 'string', format: 'date', example: '2026-09-15' },
        },
      },
      UpsertExamResultRequest: {
        type: 'object',
        required: ['examId', 'studentId', 'subjectId'],
        properties: {
          examId: objectIdSchema,
          studentId: objectIdSchema,
          subjectId: objectIdSchema,
          marksObtained: { type: 'number', minimum: 0, example: 42 },
          grade: { type: 'string', example: 'A' },
          isAbsent: { type: 'boolean', example: false },
          remarks: { type: 'string', example: 'Strong analytical skills' },
          published: { type: 'boolean', example: true },
        },
      },
      CreateInvoiceRequest: {
        type: 'object',
        required: ['studentId', 'academicYearId', 'dueAt', 'lines'],
        properties: {
          studentId: objectIdSchema,
          academicYearId: objectIdSchema,
          dueAt: { type: 'string', format: 'date-time', example: '2026-06-10T00:00:00.000Z' },
          lines: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['description', 'lineTotalPaise'],
              properties: {
                description: { type: 'string', example: 'Term 1 tuition fee' },
                lineTotalPaise: { type: 'integer', minimum: 1, example: 150000 },
                feeCategoryId: objectIdSchema,
              },
            },
          },
        },
      },
      InitiatePlatformPaymentRequest: {
        type: 'object',
        properties: {
          idempotencyKey: { type: 'string', example: 'platform-billing-2026-06' },
          seatCount: { type: 'integer', minimum: 1, example: 125 },
        },
      },
      VerifyPaymentRequest: {
        type: 'object',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
        properties: {
          razorpay_order_id: { type: 'string', example: 'order_Q1AbCdEfGhIjKl' },
          razorpay_payment_id: { type: 'string', example: 'pay_Q1LmNoPqRsTuVw' },
          razorpay_signature: { type: 'string', example: 'generated-signature' },
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
          studentId: { type: 'string' },
          academicYearId: { type: 'string' },
          sessionId: { type: 'string' },
          schoolClassId: { type: 'string' },
          sectionId: { type: 'string' },
          subjectId: { type: 'string' },
          chapter: { type: 'string' },
          topic: { type: 'string' },
          ratedDate: { type: 'string', format: 'date' },
          score: { type: 'number' },
          maxScore: { type: 'number', default: 100 },
          ratingType: { type: 'string', default: 'chapter_assessment' },
        },
      },
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

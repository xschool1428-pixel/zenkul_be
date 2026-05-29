import {
  GET,
  POST,
  PATCH,
  PUT,
  DELETE,
  path,
  schoolPath,
  orgPath,
  mergePaths,
  pathId,
  paginationParams,
  auditLogQueryParams,
  platformAuditLogQueryParams,
  body,
  respData,
  resp201,
  respPaginated,
} from './helpers.js';
import { ratingQueryParams, invoiceListQueryParams } from './domainSchemas.js';

const S = {
  Organization: '#/components/schemas/Organization',
  OrganizationListItem: '#/components/schemas/OrganizationListItem',
  School: '#/components/schemas/School',
  Student: '#/components/schemas/Student',
  StudentEnrollment: '#/components/schemas/StudentEnrollment',
  Teacher: '#/components/schemas/Teacher',
  Subject: '#/components/schemas/Subject',
  Guardian: '#/components/schemas/Guardian',
  StudentGuardianLink: '#/components/schemas/StudentGuardianLink',
  AcademicYear: '#/components/schemas/AcademicYear',
  SchoolClass: '#/components/schemas/SchoolClass',
  Section: '#/components/schemas/Section',
  Term: '#/components/schemas/Term',
  AcademicStructure: '#/components/schemas/AcademicStructure',
  SubjectChapter: '#/components/schemas/SubjectChapter',
  StudentRating: '#/components/schemas/StudentRating',
  RatingSummary: '#/components/schemas/RatingSummary',
  Classroom: '#/components/schemas/Classroom',
  ClassroomMaterial: '#/components/schemas/ClassroomMaterial',
  ClassroomInvite: '#/components/schemas/ClassroomInvite',
  AttendanceRecord: '#/components/schemas/AttendanceRecord',
  Exam: '#/components/schemas/Exam',
  ExamResult: '#/components/schemas/ExamResult',
  FeeCategory: '#/components/schemas/FeeCategory',
  FeeStructure: '#/components/schemas/FeeStructure',
  Invoice: '#/components/schemas/Invoice',
  PaymentInitiation: '#/components/schemas/PaymentInitiation',
  BillableSeats: '#/components/schemas/BillableSeats',
  Notification: '#/components/schemas/Notification',
  UserProfile: '#/components/schemas/UserProfile',
  LoginResponse: '#/components/schemas/LoginResponse',
  AuthContext: '#/components/schemas/AuthContext',
  Role: '#/components/schemas/Role',
  UserRoleAssignment: '#/components/schemas/UserRoleAssignment',
  SubscriptionPlan: '#/components/schemas/SubscriptionPlan',
  DashboardStats: '#/components/schemas/DashboardStats',
  ParentDashboard: '#/components/schemas/ParentDashboard',
  ParentChildDetail: '#/components/schemas/ParentChildDetail',
  AadhaarView: '#/components/schemas/AadhaarView',
  RazorpayOnboardResult: '#/components/schemas/RazorpayOnboardResult',
  PermissionCatalogItem: '#/components/schemas/PermissionCatalogItem',
  AuditLogEntry: '#/components/schemas/AuditLogEntry',
  BillingPreviewResponse: '#/components/schemas/BillingPreviewResponse',
  OrgSubscriptionDetailResponse: '#/components/schemas/OrgSubscriptionDetailResponse',
};

const paginatedAuditResponse = respPaginated(S.AuditLogEntry, 'Paginated audit logs');

const subscriptionDetailResponse = {
  200: {
    description: 'Subscription access + permission grants',
    content: {
      'application/json': {
        schema: { $ref: S.OrgSubscriptionDetailResponse },
      },
    },
  },
};

const billingPreviewResponse = {
  200: {
    description: 'Billing preview with access phase',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: S.BillingPreviewResponse },
          },
        },
      },
    },
  },
};

const T = {
  SYSTEM: '01 - System',
  AUTH: '02 - Auth',
  ORG: '03 - Organizations',
  SCHOOL: '04 - Schools',
  STUDENT: '05 - Students',
  PARENT: '06 - Parents',
  ACADEMIC: '07 - Academics',
  ATTENDANCE: '08 - Attendance',
  RATING: '09 - Ratings',
  CHAPTER: '10 - Chapters',
  CLASSROOM: '11 - Classrooms',
  INVOICE: '12 - Invoices',
  PAYMENT: '13 - Payments',
  NOTIFICATION: '14 - Notifications',
  WEBHOOK: '15 - Webhooks',
  ADMIN: '16 - Admin',
  TEACHER: '17 - Teachers',
  SUBJECT: '18 - Subjects',
  FEE: '19 - Fees',
  EXAM: '20 - Exams',
  GUARDIAN: '21 - Guardians',
};

export const swaggerPaths = mergePaths(
  // ─── System ─────────────────────────────────────────
  {
    '/': path(
      GET(T.SYSTEM, 'Hello — server running', {
        security: [],
        responses: {
          200: {
            description: 'Server is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'School SaaS API is running' },
                  },
                },
              },
            },
          },
        },
      })
    ),
    '/health': path(
      GET(T.SYSTEM, 'Health check (includes MongoDB)', {
        security: [],
        responses: {
          200: {
            description: 'Healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    database: { type: 'string', example: 'connected' },
                    uptime: { type: 'number' },
                  },
                },
              },
            },
          },
          503: { description: 'Degraded — database down' },
        },
      })
    ),
  },

  // ─── Auth ───────────────────────────────────────────
  {
    '/api/auth/register': path(
      POST(T.AUTH, 'Register user', {
        security: [],
        requestBody: body('#/components/schemas/RegisterRequest'),
        responses: resp201(S.UserProfile),
      })
    ),
    '/api/auth/login': path(
      POST(T.AUTH, 'Login', {
        security: [],
        requestBody: body('#/components/schemas/LoginRequest'),
        responses: respData(S.LoginResponse),
      })
    ),
    '/api/auth/refresh': path(
      POST(T.AUTH, 'Refresh access token', {
        security: [],
        requestBody: body('#/components/schemas/RefreshTokenRequest'),
        responses: respData(S.LoginResponse),
      })
    ),
    '/api/auth/logout': path(
      POST(T.AUTH, 'Logout', {
        security: [],
        requestBody: body('#/components/schemas/RefreshTokenRequest'),
        responses: {
          200: {
            description: 'Logged out',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out' },
                  },
                },
              },
            },
          },
        },
      })
    ),
    '/api/auth/me': path(GET(T.AUTH, 'Current user profile', { responses: respData(S.UserProfile) })),
    '/api/auth/context': path(
      GET(T.AUTH, 'Auth context — roles, permissions, subscription, schools, children', {
        responses: respData(S.AuthContext, 'Full auth context'),
      })
    ),
  },

  // ─── Admin ──────────────────────────────────────────
  {
    '/api/admin/permissions': path(
      GET(T.ADMIN, 'List all permissions', {
        responses: respPaginated(S.PermissionCatalogItem),
      })
    ),
    '/api/admin/permissions/catalog': path(
      GET(T.ADMIN, 'Full permission catalog (SUPER_ADMIN)', {
        parameters: [
          { in: 'query', name: 'includePlatformOnly', schema: { type: 'boolean', default: false } },
        ],
        responses: respPaginated(S.PermissionCatalogItem, 'Permission catalog'),
      })
    ),
    '/api/admin/roles': path(
      GET(T.ADMIN, 'List roles', {
        parameters: [
          { in: 'query', name: 'organizationId', schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } },
          { in: 'query', name: 'schoolId', schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } },
        ],
        responses: respPaginated(S.Role),
      })
    ),
    '/api/admin/roles/assign': path(
      POST(T.ADMIN, 'Assign role to user', {
        requestBody: body('#/components/schemas/AssignRoleRequest'),
        responses: resp201(S.UserRoleAssignment),
      })
    ),
    '/api/admin/users/me/roles': path(
      GET(T.ADMIN, 'My role assignments', { responses: respPaginated(S.UserRoleAssignment) })
    ),
    '/api/admin/users/{userId}/roles': path(
      GET(T.ADMIN, 'User role assignments', {
        parameters: [pathId('userId')],
        responses: respPaginated(S.UserRoleAssignment),
      })
    ),
    '/api/admin/subscriptions/plans': path(
      GET(T.ADMIN, 'List subscription plans', { responses: respPaginated(S.SubscriptionPlan) }),
      POST(T.ADMIN, 'Create subscription plan (SUPER_ADMIN)', {
        requestBody: body('#/components/schemas/CreateSubscriptionPlanRequest'),
        responses: resp201(S.SubscriptionPlan),
      })
    ),
    '/api/admin/subscriptions/plans/{id}': path(
      PATCH(T.ADMIN, 'Update subscription plan (SUPER_ADMIN)', {
        parameters: [pathId()],
        requestBody: body('#/components/schemas/UpdateSubscriptionPlanRequest'),
        responses: respData(S.SubscriptionPlan),
      })
    ),
    '/api/admin/platform/organizations/{organizationId}/subscription': path(
      GET(T.ADMIN, 'Organization subscription & portal access (SUPER_ADMIN)', {
        parameters: [pathId('organizationId')],
        responses: subscriptionDetailResponse,
      })
    ),
    '/api/admin/platform/organizations/{organizationId}/billing': path(
      PATCH(T.ADMIN, 'Set org discount / custom price / plan (SUPER_ADMIN)', {
        parameters: [pathId('organizationId')],
        requestBody: body('#/components/schemas/UpdateOrgBillingRequest'),
        responses: subscriptionDetailResponse,
      })
    ),
    '/api/admin/platform/organizations/{organizationId}/permissions': path(
      PUT(T.ADMIN, 'Replace org permission grants (SUPER_ADMIN)', {
        parameters: [pathId('organizationId')],
        requestBody: body('#/components/schemas/SetOrgPermissionsRequest'),
        responses: respData(S.PermissionCatalogItem),
      })
    ),
    '/api/admin/platform/organizations/{organizationId}/plan': path(
      POST(T.ADMIN, 'Assign subscription plan to organization (SUPER_ADMIN)', {
        parameters: [pathId('organizationId')],
        requestBody: body('#/components/schemas/AssignOrgPlanRequest'),
        responses: subscriptionDetailResponse,
      })
    ),
    '/api/admin/organizations/dashboard': orgPath(
      path(GET(T.ADMIN, 'Organization dashboard stats', { responses: respData(S.DashboardStats) }))
    ),
    '/api/admin/organizations/subscription': orgPath(
      path(
        GET(T.ADMIN, 'Organization subscription, access phase & grace status', {
          responses: subscriptionDetailResponse,
        })
      )
    ),
    '/api/admin/organizations/billing/summary': orgPath(
      path(
        GET(T.ADMIN, 'Billing summary — seats, price, amount due, renewal dates', {
          responses: billingPreviewResponse,
        })
      )
    ),
    '/api/admin/organizations/permissions': orgPath(
      path(
        GET(T.ADMIN, 'Entitled permission keys for org (read-only)', {
          responses: {
            200: {
              description: 'Permission keys e.g. student.read',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { type: 'string', example: 'student.read' } },
                    },
                  },
                },
              },
            },
          },
        })
      )
    ),
    '/api/admin/organizations/roles': orgPath(
      path(
        POST(T.ADMIN, 'Create organization role from entitled permissions', {
          requestBody: body('#/components/schemas/CreateOrgRoleRequest'),
          responses: resp201(S.Role),
        })
      )
    ),
    '/api/admin/organizations/roles/{roleId}': orgPath(
      path(
        PATCH(T.ADMIN, 'Update organization role permissions', {
          parameters: [pathId('roleId')],
          requestBody: body('#/components/schemas/UpdateOrgRoleRequest'),
          responses: respData(S.Role),
        })
      )
    ),
    '/api/admin/organizations/audit-logs': orgPath(
      path(
        GET(T.ADMIN, 'Organization audit logs (all schools in org)', {
          parameters: auditLogQueryParams,
          responses: paginatedAuditResponse,
        })
      )
    ),
    '/api/admin/schools/dashboard': schoolPath(
      path(GET(T.ADMIN, 'School dashboard stats', { responses: respData(S.DashboardStats) }))
    ),
    '/api/admin/schools/users': schoolPath(
      path(GET(T.ADMIN, 'List school staff and roles', { responses: respPaginated(S.UserRoleAssignment) }))
    ),
    '/api/admin/schools/audit-logs': schoolPath(
      path(
        GET(T.ADMIN, 'School audit logs (paginated)', {
          parameters: auditLogQueryParams,
          responses: paginatedAuditResponse,
        })
      )
    ),
    '/api/admin/platform/audit-logs': path(
      GET(T.ADMIN, 'Platform audit logs — SUPER_ADMIN only (all tenants)', {
        parameters: platformAuditLogQueryParams,
        responses: paginatedAuditResponse,
      })
    ),
  },

  // ─── Organizations ──────────────────────────────────
  {
    '/api/organizations': path(
      GET(T.ORG, 'List organizations (paginated; SUPER_ADMIN sees all)', {
        parameters: [
          ...paginationParams,
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending'] },
          },
          { in: 'query', name: 'search', schema: { type: 'string', maxLength: 100 }, description: 'Name, slug, or email' },
        ],
        responses: respPaginated(S.OrganizationListItem, 'Paginated organizations'),
      }),
      POST(T.ORG, 'Create organization', {
        requestBody: body('#/components/schemas/CreateOrganizationRequest'),
        responses: resp201(S.Organization),
      })
    ),
    '/api/organizations/{id}': path(
      GET(T.ORG, 'Get organization', { parameters: [pathId()], responses: respData(S.Organization) })
    ),
    '/api/organizations/{id}/schools': path(
      GET(T.ORG, 'List schools in organization', {
        parameters: [pathId()],
        responses: respPaginated(S.School),
      })
    ),
  },

  // ─── Schools ────────────────────────────────────────
  {
    '/api/schools': path(
      POST(T.SCHOOL, 'Create school', {
        requestBody: body('#/components/schemas/CreateSchoolRequest'),
        responses: resp201(S.School),
      }),
      GET(T.SCHOOL, 'List schools', {
        parameters: [{ in: 'query', name: 'organizationId', schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } }],
        responses: respPaginated(S.School),
      })
    ),
    '/api/schools/{id}': path(
      GET(T.SCHOOL, 'Get school', { parameters: [pathId()], responses: respData(S.School) }),
      PATCH(T.SCHOOL, 'Update school', {
        parameters: [pathId()],
        requestBody: body('#/components/schemas/UpdateSchoolRequest'),
        responses: respData(S.School),
      })
    ),
  },

  // ─── Students ───────────────────────────────────────
  {
    '/api/students': schoolPath(
      path(
        GET(T.STUDENT, 'List students (paginated)', {
          parameters: paginationParams,
          responses: respPaginated(S.Student),
        }),
        POST(T.STUDENT, 'Create student (profile, enrollment, guardian)', {
          requestBody: body('#/components/schemas/CreateStudentRequest'),
          responses: resp201(S.Student),
        })
      )
    ),
    '/api/students/{id}': schoolPath(
      path(
        GET(T.STUDENT, 'Get student detail', { parameters: [pathId()], responses: respData(S.Student) }),
        PATCH(T.STUDENT, 'Update student', {
          parameters: [pathId()],
          requestBody: body('#/components/schemas/UpdateStudentRequest'),
          responses: respData(S.Student),
        })
      )
    ),
    '/api/students/{id}/aadhaar': schoolPath(
      path(
        PATCH(T.STUDENT, 'Update Aadhaar (encrypted)', {
          parameters: [pathId()],
          requestBody: body('#/components/schemas/UpdateStudentAadhaarRequest'),
          responses: respData(S.Student),
        }),
        GET(T.STUDENT, 'View decrypted Aadhaar', {
          parameters: [pathId()],
          responses: respData(S.AadhaarView),
        })
      )
    ),
    '/api/students/{studentId}/enrollments': schoolPath(
      path(
        GET(T.STUDENT, 'List student enrollments', {
          parameters: [pathId('studentId')],
          responses: respPaginated(S.StudentEnrollment),
        }),
        POST(T.STUDENT, 'Create enrollment', {
          parameters: [pathId('studentId')],
          requestBody: body('#/components/schemas/CreateEnrollmentRequest'),
          responses: resp201(S.StudentEnrollment),
        })
      )
    ),
    '/api/students/{studentId}/promote': schoolPath(
      path(
        POST(T.STUDENT, 'Promote student to new class/section', {
          parameters: [pathId('studentId')],
          requestBody: body('#/components/schemas/PromoteStudentRequest'),
          responses: respData(S.StudentEnrollment),
        })
      )
    ),
  },

  // ─── Teachers ───────────────────────────────────────
  {
    '/api/teachers': schoolPath(
      path(
        GET(T.TEACHER, 'List teachers (paginated)', {
          parameters: paginationParams,
          responses: respPaginated(S.Teacher),
        }),
        POST(T.TEACHER, 'Create teacher', {
          requestBody: body('#/components/schemas/CreateTeacherRequest'),
          responses: resp201(S.Teacher),
        })
      )
    ),
    '/api/teachers/{id}': schoolPath(
      path(
        GET(T.TEACHER, 'Get teacher', { parameters: [pathId()], responses: respData(S.Teacher) }),
        PATCH(T.TEACHER, 'Update teacher', {
          parameters: [pathId()],
          requestBody: body('#/components/schemas/UpdateTeacherRequest'),
          responses: respData(S.Teacher),
        })
      )
    ),
  },

  // ─── Subjects ─────────────────────────────────────
  {
    '/api/subjects': schoolPath(
      path(
        GET(T.SUBJECT, 'List subjects (paginated)', {
          parameters: paginationParams,
          responses: respPaginated(S.Subject),
        }),
        POST(T.SUBJECT, 'Create subject', {
          requestBody: body('#/components/schemas/CreateSubjectRequest'),
          responses: resp201(S.Subject),
        })
      )
    ),
    '/api/subjects/{id}': schoolPath(
      path(
        GET(T.SUBJECT, 'Get subject', { parameters: [pathId()], responses: respData(S.Subject) }),
        PATCH(T.SUBJECT, 'Update subject', {
          parameters: [pathId()],
          requestBody: body('#/components/schemas/UpdateSubjectRequest'),
          responses: respData(S.Subject),
        }),
        DELETE(T.SUBJECT, 'Delete subject (soft)', { parameters: [pathId()], responses: respData(S.Subject) })
      )
    ),
  },

  // ─── Guardians ──────────────────────────────────────
  {
    '/api/guardians': schoolPath(
      path(
        POST(T.GUARDIAN, 'Create guardian', {
          requestBody: body('#/components/schemas/CreateGuardianRequest'),
          responses: resp201(S.Guardian),
        })
      )
    ),
    '/api/guardians/{id}': schoolPath(
      path(GET(T.GUARDIAN, 'Get guardian', { parameters: [pathId()], responses: respData(S.Guardian) }))
    ),
    '/api/guardians/students/{studentId}/link': schoolPath(
      path(
        POST(T.GUARDIAN, 'Link guardian to student', {
          parameters: [pathId('studentId')],
          requestBody: body('#/components/schemas/LinkGuardianRequest'),
          responses: resp201(S.StudentGuardianLink),
        })
      )
    ),
    '/api/guardians/students/{studentId}': schoolPath(
      path(
        GET(T.GUARDIAN, 'List guardians for student', {
          parameters: [pathId('studentId')],
          responses: respPaginated(S.StudentGuardianLink),
        })
      )
    ),
  },

  // ─── Parents ──────────────────────────────────────
  {
    '/api/parents/dashboard': path(
      GET(T.PARENT, 'Parent dashboard — all linked children', { responses: respData(S.ParentDashboard) })
    ),
    '/api/parents/children/{studentId}': path(
      GET(T.PARENT, 'Single child detail', {
        parameters: [pathId('studentId')],
        responses: respData(S.ParentChildDetail),
      })
    ),
  },

  // ─── Academics ──────────────────────────────────────
  {
    '/api/academics/structure': schoolPath(
      path(
        GET(T.ACADEMIC, 'Full academic structure (years, classes, sections, terms)', {
          responses: respData(S.AcademicStructure),
        })
      )
    ),
    '/api/academics/years': schoolPath(
      path(
        GET(T.ACADEMIC, 'List academic years', { responses: respPaginated(S.AcademicYear) }),
        POST(T.ACADEMIC, 'Create academic year', {
          requestBody: body('#/components/schemas/CreateAcademicYearRequest'),
          responses: resp201(S.AcademicYear),
        })
      )
    ),
    '/api/academics/classes': schoolPath(
      path(
        GET(T.ACADEMIC, 'List classes', { responses: respPaginated(S.SchoolClass) }),
        POST(T.ACADEMIC, 'Create class', {
          requestBody: body('#/components/schemas/CreateSchoolClassRequest'),
          responses: resp201(S.SchoolClass),
        })
      )
    ),
    '/api/academics/classes/{classId}/sections': schoolPath(
      path(
        GET(T.ACADEMIC, 'List sections for class', {
          parameters: [pathId('classId')],
          responses: respPaginated(S.Section),
        }),
        POST(T.ACADEMIC, 'Create section', {
          parameters: [pathId('classId')],
          requestBody: body('#/components/schemas/CreateSectionRequest'),
          responses: resp201(S.Section),
        })
      )
    ),
    '/api/academics/terms': schoolPath(
      path(
        GET(T.ACADEMIC, 'List terms', {
          parameters: [{ in: 'query', name: 'academicYearId', schema: { type: 'string', pattern: '^[a-f0-9]{24}$' } }],
          responses: respPaginated(S.Term),
        }),
        POST(T.ACADEMIC, 'Create term / session', {
          requestBody: body('#/components/schemas/CreateTermRequest'),
          responses: resp201(S.Term),
        })
      )
    ),
  },

  // ─── Chapters ───────────────────────────────────────
  {
    '/api/chapters': schoolPath(
      path(
        GET(T.CHAPTER, 'List subject chapters', { responses: respPaginated(S.SubjectChapter) }),
        POST(T.CHAPTER, 'Create chapter', {
          requestBody: body('#/components/schemas/CreateChapterRequest'),
          responses: resp201(S.SubjectChapter),
        })
      )
    ),
    '/api/chapters/{id}': schoolPath(
      path(GET(T.CHAPTER, 'Get chapter', { parameters: [pathId()], responses: respData(S.SubjectChapter) }))
    ),
  },

  // ─── Ratings ────────────────────────────────────────
  {
    '/api/ratings/student/{studentId}': path(
      GET(T.RATING, 'List ratings for student (parent or staff)', {
        parameters: [pathId('studentId'), ...ratingQueryParams],
        responses: respPaginated(S.StudentRating),
      })
    ),
    '/api/ratings/student/{studentId}/summary': path(
      GET(T.RATING, 'Rating summary for student', {
        parameters: [pathId('studentId'), ...ratingQueryParams],
        responses: respData(S.RatingSummary),
      })
    ),
    '/api/ratings': schoolPath(
      path(
        GET(T.RATING, 'List ratings by filters', {
          parameters: ratingQueryParams,
          responses: respPaginated(S.StudentRating),
        }),
        POST(T.RATING, 'Create rating', {
          requestBody: body('#/components/schemas/CreateRatingRequest'),
          responses: resp201(S.StudentRating),
        })
      )
    ),
    '/api/ratings/class/{classId}/section/{sectionId}': schoolPath(
      path(
        GET(T.RATING, 'List ratings by class and section', {
          parameters: [pathId('classId'), pathId('sectionId'), ...ratingQueryParams],
          responses: respPaginated(S.StudentRating),
        })
      )
    ),
    '/api/ratings/{id}': schoolPath(
      path(
        PATCH(T.RATING, 'Update rating', {
          parameters: [pathId()],
          requestBody: body('#/components/schemas/UpdateRatingRequest'),
          responses: respData(S.StudentRating),
        })
      )
    ),
  },

  // ─── Classrooms ─────────────────────────────────────
  {
    '/api/classrooms/my': path(
      GET(T.CLASSROOM, 'My classrooms (teacher + student)', { responses: respPaginated(S.Classroom) })
    ),
    '/api/classrooms/join': path(
      POST(T.CLASSROOM, 'Join classroom by invite code', {
        requestBody: body('#/components/schemas/JoinClassroomRequest'),
        responses: respData(S.Classroom),
      })
    ),
    '/api/classrooms': schoolPath(
      path(
        GET(T.CLASSROOM, 'List classrooms', { responses: respPaginated(S.Classroom) }),
        POST(T.CLASSROOM, 'Create classroom', {
          requestBody: body('#/components/schemas/CreateClassroomRequest'),
          responses: resp201(S.Classroom),
        })
      )
    ),
    '/api/classrooms/{id}': schoolPath(
      path(GET(T.CLASSROOM, 'Get classroom detail', { parameters: [pathId()], responses: respData(S.Classroom) }))
    ),
    '/api/classrooms/{id}/sync-members': schoolPath(
      path(
        POST(T.CLASSROOM, 'Sync members from enrollment', {
          parameters: [pathId()],
          responses: respData(S.Classroom),
        })
      )
    ),
    '/api/classrooms/{id}/invites': schoolPath(
      path(
        POST(T.CLASSROOM, 'Create classroom invite', {
          parameters: [pathId()],
          responses: resp201(S.ClassroomInvite),
        })
      )
    ),
    '/api/classrooms/{id}/materials': schoolPath(
      path(
        GET(T.CLASSROOM, 'List materials', {
          parameters: [
            pathId(),
            { in: 'query', name: 'materialType', schema: { type: 'string' } },
          ],
          responses: respPaginated(S.ClassroomMaterial),
        }),
        POST(T.CLASSROOM, 'Post note / homework / revision', {
          parameters: [pathId()],
          requestBody: body('#/components/schemas/ClassroomMaterialRequest'),
          responses: resp201(S.ClassroomMaterial),
        })
      )
    ),
    '/api/classrooms/materials/{materialId}/submit': path(
      POST(T.CLASSROOM, 'Submit homework', {
        parameters: [pathId('materialId')],
        requestBody: body('#/components/schemas/SubmitHomeworkRequest'),
        responses: resp201(S.ClassroomMaterial),
      })
    ),
  },

  // ─── Attendance ─────────────────────────────────────
  {
    '/api/attendance/mark': schoolPath(
      path(
        POST(T.ATTENDANCE, 'Mark attendance', {
          requestBody: body('#/components/schemas/MarkAttendanceRequest'),
          responses: resp201(S.AttendanceRecord),
        })
      )
    ),
    '/api/attendance/student/{studentId}': schoolPath(
      path(
        GET(T.ATTENDANCE, 'List attendance for student', {
          parameters: [pathId('studentId')],
          responses: respPaginated(S.AttendanceRecord),
        })
      )
    ),
  },

  // ─── Exams ──────────────────────────────────────────
  {
    '/api/exams': schoolPath(
      path(
        GET(T.EXAM, 'List exams (paginated)', {
          parameters: paginationParams,
          responses: respPaginated(S.Exam),
        }),
        POST(T.EXAM, 'Create exam', {
          requestBody: body('#/components/schemas/CreateExamRequest'),
          responses: resp201(S.Exam),
        })
      )
    ),
    '/api/exams/student/{studentId}/results': schoolPath(
      path(
        GET(T.EXAM, 'Published results for student', {
          parameters: [pathId('studentId')],
          responses: respPaginated(S.ExamResult),
        })
      )
    ),
    '/api/exams/results': schoolPath(
      path(
        POST(T.EXAM, 'Upsert exam result', {
          requestBody: body('#/components/schemas/UpsertExamResultRequest'),
          responses: respData(S.ExamResult),
        })
      )
    ),
    '/api/exams/{id}': schoolPath(
      path(GET(T.EXAM, 'Get exam', { parameters: [pathId()], responses: respData(S.Exam) }))
    ),
    '/api/exams/{id}/publish': schoolPath(
      path(
        POST(T.EXAM, 'Publish exam', {
          parameters: [pathId()],
          responses: respData(S.Exam),
        })
      )
    ),
    '/api/exams/{id}/results': schoolPath(
      path(
        GET(T.EXAM, 'List exam results', {
          parameters: [pathId()],
          responses: respPaginated(S.ExamResult),
        })
      )
    ),
  },

  // ─── Fees ───────────────────────────────────────────
  {
    '/api/fees/categories': schoolPath(
      path(
        GET(T.FEE, 'List fee categories', { responses: respPaginated(S.FeeCategory) }),
        POST(T.FEE, 'Create fee category', {
          requestBody: body('#/components/schemas/CreateFeeCategoryRequest'),
          responses: resp201(S.FeeCategory),
        })
      )
    ),
    '/api/fees/structures': schoolPath(
      path(
        GET(T.FEE, 'List fee structures (paginated)', {
          parameters: paginationParams,
          responses: respPaginated(S.FeeStructure),
        }),
        POST(T.FEE, 'Create fee structure', {
          requestBody: body('#/components/schemas/CreateFeeStructureRequest'),
          responses: resp201(S.FeeStructure),
        })
      )
    ),
    '/api/fees/structures/{id}': schoolPath(
      path(GET(T.FEE, 'Get fee structure', { parameters: [pathId()], responses: respData(S.FeeStructure) }))
    ),
  },

  // ─── Invoices ───────────────────────────────────────
  {
    '/api/invoices': schoolPath(
      path(
        GET(T.INVOICE, 'List invoices (paginated)', {
          parameters: invoiceListQueryParams,
          responses: respPaginated(S.Invoice),
        }),
        POST(T.INVOICE, 'Create invoice', {
          requestBody: body('#/components/schemas/CreateInvoiceRequest'),
          responses: resp201(S.Invoice),
        })
      )
    ),
    '/api/invoices/{id}': schoolPath(
      path(GET(T.INVOICE, 'Get invoice', { parameters: [pathId()], responses: respData(S.Invoice) }))
    ),
  },

  // ─── Payments ───────────────────────────────────────
  {
    '/api/payments/fees/initiate': schoolPath(
      path(
        POST(T.PAYMENT, 'Initiate student fee payment (Razorpay → school)', {
          requestBody: body('#/components/schemas/InitiateFeePaymentRequest'),
          responses: respData(S.PaymentInitiation),
        })
      )
    ),
    '/api/payments/fees/verify': path(
      POST(T.PAYMENT, 'Verify student fee payment', {
        requestBody: body('#/components/schemas/VerifyRazorpayPaymentRequest'),
        responses: respData(S.Invoice),
      })
    ),
    '/api/payments/platform/seats': orgPath(
      path(GET(T.PAYMENT, 'Count billable seats for organization', { responses: respData(S.BillableSeats) }))
    ),
    '/api/payments/platform/billing-preview': orgPath(
      path(
        GET(T.PAYMENT, 'Monthly billing preview — seats × price, discount, access phase & grace days', {
          responses: billingPreviewResponse,
        })
      )
    ),
    '/api/payments/platform/initiate': orgPath(
      path(
        POST(T.PAYMENT, 'Initiate platform subscription payment', {
          requestBody: body('#/components/schemas/InitiatePlatformPaymentRequest'),
          responses: respData(S.PaymentInitiation),
        })
      )
    ),
    '/api/payments/platform/verify': path(
      POST(T.PAYMENT, 'Verify platform subscription payment', {
        requestBody: body('#/components/schemas/VerifyRazorpayPaymentRequest'),
        responses: respData(S.BillingPreviewResponse),
      })
    ),
    '/api/payments/schools/razorpay/onboard': schoolPath(
      path(
        POST(T.PAYMENT, 'Onboard school Razorpay linked account', {
          responses: respData(S.RazorpayOnboardResult),
        })
      )
    ),
    '/api/payments/schools/razorpay/activate': schoolPath(
      path(
        POST(T.PAYMENT, 'Activate school Razorpay account', {
          responses: respData(S.RazorpayOnboardResult),
        })
      )
    ),
  },

  // ─── Notifications ──────────────────────────────────
  {
    '/api/notifications': path(
      GET(T.NOTIFICATION, 'List my notifications', {
        parameters: paginationParams,
        responses: respPaginated(S.Notification),
      })
    ),
    '/api/notifications/{id}/read': path(
      PATCH(T.NOTIFICATION, 'Mark notification as read', {
        parameters: [pathId()],
        responses: respData(S.Notification),
      })
    ),
  },

  // ─── Webhooks ───────────────────────────────────────
  {
    '/api/webhooks/razorpay': path(
      POST(T.WEBHOOK, 'Razorpay webhook', {
        security: [],
        description: 'Requires valid x-razorpay-signature header. Raw JSON body.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Razorpay event payload (order.paid, payment.captured, etc.)',
                additionalProperties: true,
              },
            },
          },
        },
        responses: {
          200: { description: 'Webhook acknowledged' },
        },
      })
    ),
  }
);

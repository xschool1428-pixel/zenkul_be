import {
  GET,
  POST,
  PATCH,
  DELETE,
  path,
  schoolPath,
  orgPath,
  mergePaths,
  pathId,
  paginationParams,
  jsonRef,
} from './helpers.js';

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
        responses: { 200: { description: 'Server is running' } },
      })
    ),
    '/health': path(
      GET(T.SYSTEM, 'Health check (includes MongoDB)', {
        security: [],
        responses: {
          200: { description: 'Healthy' },
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
        requestBody: jsonRef('#/components/schemas/RegisterRequest'),
      })
    ),
    '/api/auth/login': path(
      POST(T.AUTH, 'Login', {
        security: [],
        requestBody: jsonRef('#/components/schemas/LoginRequest'),
      })
    ),
    '/api/auth/refresh': path(
      POST(T.AUTH, 'Refresh access token', {
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { refreshToken: { type: 'string' } } },
            },
          },
        },
      })
    ),
    '/api/auth/logout': path(
      POST(T.AUTH, 'Logout', {
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { refreshToken: { type: 'string' } } },
            },
          },
        },
      })
    ),
    '/api/auth/me': path(GET(T.AUTH, 'Current user profile')),
    '/api/auth/context': path(
      GET(T.AUTH, 'Auth context — roles, permissions, schools, parent children')
    ),
  },

  // ─── Admin ──────────────────────────────────────────
  {
    '/api/admin/permissions': path(GET(T.ADMIN, 'List all permissions')),
    '/api/admin/roles': path(
      GET(T.ADMIN, 'List roles', {
        parameters: [
          { in: 'query', name: 'organizationId', schema: { type: 'string' } },
          { in: 'query', name: 'schoolId', schema: { type: 'string' } },
        ],
      })
    ),
    '/api/admin/roles/assign': path(
      POST(T.ADMIN, 'Assign role to user', {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'roleId'],
                properties: {
                  userId: { type: 'string' },
                  roleId: { type: 'string' },
                  organizationId: { type: 'string' },
                  schoolId: { type: 'string' },
                },
              },
            },
          },
        },
      })
    ),
    '/api/admin/users/me/roles': path(GET(T.ADMIN, 'My role assignments')),
    '/api/admin/users/{userId}/roles': path(
      GET(T.ADMIN, 'User role assignments', { parameters: [pathId('userId')] })
    ),
    '/api/admin/subscriptions/plans': path(GET(T.ADMIN, 'List subscription plans')),
    '/api/admin/organizations/dashboard': orgPath(
      path(GET(T.ADMIN, 'Organization dashboard stats'))
    ),
    '/api/admin/organizations/subscription': orgPath(
      path(GET(T.ADMIN, 'Organization subscription status'))
    ),
    '/api/admin/schools/dashboard': schoolPath(
      path(GET(T.ADMIN, 'School dashboard stats'))
    ),
    '/api/admin/schools/users': schoolPath(path(GET(T.ADMIN, 'List school staff and roles'))),
    '/api/admin/schools/audit-logs': schoolPath(
      path(
        GET(T.ADMIN, 'Audit logs (paginated)', {
          parameters: [...paginationParams, { in: 'query', name: 'entityType', schema: { type: 'string' } }],
        })
      )
    ),
  },

  // ─── Organizations ──────────────────────────────────
  {
    '/api/organizations': path(
      POST(T.ORG, 'Create organization', {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug', 'email'],
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
      })
    ),
    '/api/organizations/{id}': path(
      GET(T.ORG, 'Get organization', { parameters: [pathId()] })
    ),
    '/api/organizations/{id}/schools': path(
      GET(T.ORG, 'List schools in organization', { parameters: [pathId()] })
    ),
  },

  // ─── Schools ────────────────────────────────────────
  {
    '/api/schools': path(
      POST(T.SCHOOL, 'Create school'),
      GET(T.SCHOOL, 'List schools', {
        parameters: [{ in: 'query', name: 'organizationId', schema: { type: 'string' } }],
      })
    ),
    '/api/schools/{id}': path(
      GET(T.SCHOOL, 'Get school', { parameters: [pathId()] }),
      PATCH(T.SCHOOL, 'Update school', { parameters: [pathId()] })
    ),
  },

  // ─── Students ───────────────────────────────────────
  {
    '/api/students': schoolPath(
      path(
        GET(T.STUDENT, 'List students (paginated)', { parameters: paginationParams }),
        POST(T.STUDENT, 'Create student (profile, enrollment, guardian)')
      )
    ),
    '/api/students/{id}': schoolPath(
      path(
        GET(T.STUDENT, 'Get student detail', { parameters: [pathId()] }),
        PATCH(T.STUDENT, 'Update student', { parameters: [pathId()] })
      )
    ),
    '/api/students/{id}/aadhaar': schoolPath(
      path(
        PATCH(T.STUDENT, 'Update Aadhaar (encrypted)', {
          parameters: [pathId()],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { aadhaar: { type: 'string', example: '123456789012' } } },
              },
            },
          },
        }),
        GET(T.STUDENT, 'View decrypted Aadhaar', { parameters: [pathId()] })
      )
    ),
    '/api/students/{studentId}/enrollments': schoolPath(
      path(
        GET(T.STUDENT, 'List student enrollments', { parameters: [pathId('studentId')] }),
        POST(T.STUDENT, 'Create enrollment', { parameters: [pathId('studentId')] })
      )
    ),
    '/api/students/{studentId}/promote': schoolPath(
      path(
        POST(T.STUDENT, 'Promote student to new class/section', {
          parameters: [pathId('studentId')],
        })
      )
    ),
  },

  // ─── Teachers ───────────────────────────────────────
  {
    '/api/teachers': schoolPath(
      path(
        GET(T.TEACHER, 'List teachers (paginated)', { parameters: paginationParams }),
        POST(T.TEACHER, 'Create teacher')
      )
    ),
    '/api/teachers/{id}': schoolPath(
      path(
        GET(T.TEACHER, 'Get teacher', { parameters: [pathId()] }),
        PATCH(T.TEACHER, 'Update teacher', { parameters: [pathId()] })
      )
    ),
  },

  // ─── Subjects ─────────────────────────────────────
  {
    '/api/subjects': schoolPath(
      path(
        GET(T.SUBJECT, 'List subjects (paginated)', { parameters: paginationParams }),
        POST(T.SUBJECT, 'Create subject')
      )
    ),
    '/api/subjects/{id}': schoolPath(
      path(
        GET(T.SUBJECT, 'Get subject', { parameters: [pathId()] }),
        PATCH(T.SUBJECT, 'Update subject', { parameters: [pathId()] }),
        DELETE(T.SUBJECT, 'Delete subject (soft)', { parameters: [pathId()] })
      )
    ),
  },

  // ─── Guardians ──────────────────────────────────────
  {
    '/api/guardians': schoolPath(path(POST(T.GUARDIAN, 'Create guardian'))),
    '/api/guardians/{id}': schoolPath(
      path(GET(T.GUARDIAN, 'Get guardian', { parameters: [pathId()] }))
    ),
    '/api/guardians/students/{studentId}/link': schoolPath(
      path(POST(T.GUARDIAN, 'Link guardian to student', { parameters: [pathId('studentId')] }))
    ),
    '/api/guardians/students/{studentId}': schoolPath(
      path(GET(T.GUARDIAN, 'List guardians for student', { parameters: [pathId('studentId')] }))
    ),
  },

  // ─── Parents ──────────────────────────────────────
  {
    '/api/parents/dashboard': path(GET(T.PARENT, 'Parent dashboard — all linked children')),
    '/api/parents/children/{studentId}': path(
      GET(T.PARENT, 'Single child detail', { parameters: [pathId('studentId')] })
    ),
  },

  // ─── Academics ──────────────────────────────────────
  {
    '/api/academics/structure': schoolPath(
      path(GET(T.ACADEMIC, 'Full academic structure (years, classes, sections, terms)'))
    ),
    '/api/academics/years': schoolPath(
      path(
        GET(T.ACADEMIC, 'List academic years'),
        POST(T.ACADEMIC, 'Create academic year')
      )
    ),
    '/api/academics/classes': schoolPath(
      path(
        GET(T.ACADEMIC, 'List classes'),
        POST(T.ACADEMIC, 'Create class')
      )
    ),
    '/api/academics/classes/{classId}/sections': schoolPath(
      path(
        GET(T.ACADEMIC, 'List sections for class', { parameters: [pathId('classId')] }),
        POST(T.ACADEMIC, 'Create section', { parameters: [pathId('classId')] })
      )
    ),
    '/api/academics/terms': schoolPath(
      path(
        GET(T.ACADEMIC, 'List terms', {
          parameters: [{ in: 'query', name: 'academicYearId', schema: { type: 'string' } }],
        }),
        POST(T.ACADEMIC, 'Create term / session')
      )
    ),
  },

  // ─── Chapters ───────────────────────────────────────
  {
    '/api/chapters': schoolPath(
      path(
        GET(T.CHAPTER, 'List subject chapters'),
        POST(T.CHAPTER, 'Create chapter')
      )
    ),
    '/api/chapters/{id}': schoolPath(
      path(GET(T.CHAPTER, 'Get chapter', { parameters: [pathId()] }))
    ),
  },

  // ─── Ratings ────────────────────────────────────────
  {
    '/api/ratings/student/{studentId}': path(
      GET(T.RATING, 'List ratings for student (parent or staff)', {
        parameters: [pathId('studentId')],
      })
    ),
    '/api/ratings/student/{studentId}/summary': path(
      GET(T.RATING, 'Rating summary for student', { parameters: [pathId('studentId')] })
    ),
    '/api/ratings': schoolPath(
      path(
        GET(T.RATING, 'List ratings by filters'),
        POST(T.RATING, 'Create rating', {
          requestBody: jsonRef('#/components/schemas/CreateRatingRequest'),
        })
      )
    ),
    '/api/ratings/class/{classId}/section/{sectionId}': schoolPath(
      path(
        GET(T.RATING, 'List ratings by class and section', {
          parameters: [pathId('classId'), pathId('sectionId')],
        })
      )
    ),
    '/api/ratings/{id}': schoolPath(
      path(PATCH(T.RATING, 'Update rating', { parameters: [pathId()] }))
    ),
  },

  // ─── Classrooms ─────────────────────────────────────
  {
    '/api/classrooms/my': path(GET(T.CLASSROOM, 'My classrooms (teacher + student)')),
    '/api/classrooms/join': path(
      POST(T.CLASSROOM, 'Join classroom by invite code', {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['inviteCode'],
                properties: { inviteCode: { type: 'string' }, studentId: { type: 'string' } },
              },
            },
          },
        },
      })
    ),
    '/api/classrooms': schoolPath(
      path(
        GET(T.CLASSROOM, 'List classrooms'),
        POST(T.CLASSROOM, 'Create classroom', {
          requestBody: jsonRef('#/components/schemas/CreateClassroomRequest'),
        })
      )
    ),
    '/api/classrooms/{id}': schoolPath(
      path(GET(T.CLASSROOM, 'Get classroom detail', { parameters: [pathId()] }))
    ),
    '/api/classrooms/{id}/sync-members': schoolPath(
      path(POST(T.CLASSROOM, 'Sync members from enrollment', { parameters: [pathId()] }))
    ),
    '/api/classrooms/{id}/invites': schoolPath(
      path(POST(T.CLASSROOM, 'Create classroom invite', { parameters: [pathId()] }))
    ),
    '/api/classrooms/{id}/materials': schoolPath(
      path(
        GET(T.CLASSROOM, 'List materials', {
          parameters: [
            pathId(),
            { in: 'query', name: 'materialType', schema: { type: 'string' } },
          ],
        }),
        POST(T.CLASSROOM, 'Post note / homework / revision', {
          parameters: [pathId()],
          requestBody: jsonRef('#/components/schemas/ClassroomMaterialRequest'),
        })
      )
    ),
    '/api/classrooms/materials/{materialId}/submit': path(
      POST(T.CLASSROOM, 'Submit homework', {
        parameters: [pathId('materialId')],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  studentId: { type: 'string' },
                  content: { type: 'string' },
                  attachments: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
      })
    ),
  },

  // ─── Attendance ─────────────────────────────────────
  {
    '/api/attendance/mark': schoolPath(path(POST(T.ATTENDANCE, 'Mark attendance'))),
    '/api/attendance/student/{studentId}': schoolPath(
      path(GET(T.ATTENDANCE, 'List attendance for student', { parameters: [pathId('studentId')] }))
    ),
  },

  // ─── Exams ──────────────────────────────────────────
  {
    '/api/exams': schoolPath(
      path(
        GET(T.EXAM, 'List exams (paginated)', { parameters: paginationParams }),
        POST(T.EXAM, 'Create exam')
      )
    ),
    '/api/exams/student/{studentId}/results': schoolPath(
      path(GET(T.EXAM, 'Published results for student', { parameters: [pathId('studentId')] }))
    ),
    '/api/exams/results': schoolPath(path(POST(T.EXAM, 'Upsert exam result'))),
    '/api/exams/{id}': schoolPath(
      path(GET(T.EXAM, 'Get exam', { parameters: [pathId()] }))
    ),
    '/api/exams/{id}/publish': schoolPath(
      path(POST(T.EXAM, 'Publish exam', { parameters: [pathId()] }))
    ),
    '/api/exams/{id}/results': schoolPath(
      path(GET(T.EXAM, 'List exam results', { parameters: [pathId()] }))
    ),
  },

  // ─── Fees ───────────────────────────────────────────
  {
    '/api/fees/categories': schoolPath(
      path(
        GET(T.FEE, 'List fee categories'),
        POST(T.FEE, 'Create fee category')
      )
    ),
    '/api/fees/structures': schoolPath(
      path(
        GET(T.FEE, 'List fee structures (paginated)', { parameters: paginationParams }),
        POST(T.FEE, 'Create fee structure')
      )
    ),
    '/api/fees/structures/{id}': schoolPath(
      path(GET(T.FEE, 'Get fee structure', { parameters: [pathId()] }))
    ),
  },

  // ─── Invoices ───────────────────────────────────────
  {
    '/api/invoices': schoolPath(
      path(
        GET(T.INVOICE, 'List invoices (paginated)', { parameters: paginationParams }),
        POST(T.INVOICE, 'Create invoice')
      )
    ),
    '/api/invoices/{id}': schoolPath(
      path(GET(T.INVOICE, 'Get invoice', { parameters: [pathId()] }))
    ),
  },

  // ─── Payments ───────────────────────────────────────
  {
    '/api/payments/fees/initiate': schoolPath(
      path(
        POST(T.PAYMENT, 'Initiate student fee payment (Razorpay → school)', {
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['invoiceId'],
                  properties: {
                    invoiceId: { type: 'string' },
                    idempotencyKey: { type: 'string' },
                  },
                },
              },
            },
          },
        })
      )
    ),
    '/api/payments/fees/verify': path(
      POST(T.PAYMENT, 'Verify student fee payment', {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  razorpay_order_id: { type: 'string' },
                  razorpay_payment_id: { type: 'string' },
                  razorpay_signature: { type: 'string' },
                },
              },
            },
          },
        },
      })
    ),
    '/api/payments/platform/seats': orgPath(
      path(GET(T.PAYMENT, 'Count billable seats for organization'))
    ),
    '/api/payments/platform/initiate': orgPath(
      path(POST(T.PAYMENT, 'Initiate platform subscription payment'))
    ),
    '/api/payments/platform/verify': path(
      POST(T.PAYMENT, 'Verify platform subscription payment')
    ),
    '/api/payments/schools/razorpay/onboard': schoolPath(
      path(POST(T.PAYMENT, 'Onboard school Razorpay linked account'))
    ),
    '/api/payments/schools/razorpay/activate': schoolPath(
      path(POST(T.PAYMENT, 'Activate school Razorpay account'))
    ),
  },

  // ─── Notifications ──────────────────────────────────
  {
    '/api/notifications': path(
      GET(T.NOTIFICATION, 'List my notifications', { parameters: paginationParams })
    ),
    '/api/notifications/{id}/read': path(
      PATCH(T.NOTIFICATION, 'Mark notification as read', { parameters: [pathId()] })
    ),
  },

  // ─── Webhooks ───────────────────────────────────────
  {
    '/api/webhooks/razorpay': path(
      POST(T.WEBHOOK, 'Razorpay webhook', {
        security: [],
        description: 'Requires valid x-razorpay-signature header. Raw JSON body.',
      })
    ),
  }
);

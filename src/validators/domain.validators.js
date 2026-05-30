import Joi from 'joi';
import { objectId, paginationQuery, paginationQuerySchema } from './common.js';

const idParam = Joi.object({ params: Joi.object({ id: objectId.required() }) });
const studentIdParam = Joi.object({
  params: Joi.object({ studentId: objectId.required() }),
});

export const createOrganizationSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    slug: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    countryCode: Joi.string().length(2).default('IN'),
    city: Joi.string().optional(),
  }).required(),
});

export const listOrganizationsQuerySchema = Joi.object({
  query: Joi.object({
    ...paginationQuery,
    status: Joi.string().valid('active', 'inactive', 'suspended', 'pending').optional(),
    search: Joi.string().trim().max(100).optional(),
  }),
});

export const createSubscriptionPlanSchema = Joi.object({
  body: Joi.object({
    code: Joi.string().min(2).max(50).required(),
    name: Joi.string().min(2).max(100).required(),
    billingInterval: Joi.string().valid('monthly', 'yearly').default('monthly'),
    pricePerUserPaise: Joi.number().integer().min(100).required(),
    permissionIds: Joi.array().items(objectId).default([]),
    maxSchools: Joi.number().integer().min(1),
    features: Joi.array().items(
      Joi.object({
        featureCode: Joi.string().required(),
        enabled: Joi.boolean(),
        limitValue: Joi.number(),
      })
    ),
    isActive: Joi.boolean(),
  }).required(),
});

export const updateSubscriptionPlanSchema = Joi.object({
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(100),
    pricePerUserPaise: Joi.number().integer().min(100),
    billingInterval: Joi.string().valid('monthly', 'yearly'),
    permissionIds: Joi.array().items(objectId),
    maxSchools: Joi.number().integer().min(1),
    features: Joi.array(),
    isActive: Joi.boolean(),
  }).min(1),
});

export const updateOrgBillingSchema = Joi.object({
  params: Joi.object({ organizationId: objectId.required() }),
  body: Joi.object({
    planId: objectId,
    discountPercent: Joi.number().min(0).max(100),
    discountPaisePerSeat: Joi.number().integer().min(0),
    customPricePerUserPaise: Joi.number().integer().min(0).allow(null),
  }).min(1),
});

export const setOrgPermissionsSchema = Joi.object({
  params: Joi.object({ organizationId: objectId.required() }),
  body: Joi.object({
    permissionIds: Joi.array().items(objectId).required(),
  }).required(),
});

export const createOrgRoleSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    code: Joi.string().min(2).max(50).required(),
    permissionIds: Joi.array().items(objectId).min(1).required(),
    schoolId: objectId,
  }).required(),
});

export const listAuditLogsQuerySchema = Joi.object({
  query: Joi.object({
    ...paginationQuery,
    entityType: Joi.string().max(80).optional(),
    action: Joi.string().max(80).optional(),
    actorUserId: objectId.optional(),
    organizationId: objectId.optional(),
    schoolId: objectId.optional(),
  }),
});

export const createSchoolSchema = Joi.object({
  body: Joi.object({
    organizationId: objectId.required(),
    name: Joi.string().min(2).max(200).required(),
    code: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    city: Joi.string().optional(),
  }).required(),
});

export const updateSchoolSchema = Joi.object({
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(200),
    email: Joi.string().email(),
    phone: Joi.string(),
    city: Joi.string(),
  }).min(1),
});

export const createStudentSchema = Joi.object({
  body: Joi.object({
    admissionNumber: Joi.string().required(),
    userId: objectId.optional(),
    admissionDate: Joi.date().optional(),
    profile: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      dateOfBirth: Joi.date(),
      gender: Joi.string(),
      aadhaar: Joi.string().length(12).pattern(/^\d+$/),
    }).optional(),
    enrollment: Joi.object({
      academicYearId: objectId.required(),
      schoolClassId: objectId.required(),
      sectionId: objectId.required(),
      rollNumber: Joi.string(),
    }).optional(),
    guardian: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      phone: Joi.string().required(),
      email: Joi.string().email(),
      relationship: Joi.string(),
      aadhaar: Joi.string().length(12).pattern(/^\d+$/),
    }).optional(),
  }).required(),
});

export const updateStudentSchema = Joi.object({
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive', 'graduated', 'transferred'),
    admissionNumber: Joi.string(),
    profile: Joi.object().unknown(true),
  }).min(1),
});

export const createTeacherSchema = Joi.object({
  body: Joi.object({
    userId: objectId.required(),
    employeeCode: Joi.string().required(),
    joiningDate: Joi.date().optional(),
    qualification: Joi.string(),
    department: Joi.string(),
    employmentType: Joi.string().valid('full_time', 'part_time', 'contract'),
  }).required(),
});

export const createSubjectSchema = Joi.object({
  body: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    isElective: Joi.boolean(),
  }).required(),
});

export const createFeeCategorySchema = Joi.object({
  body: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string(),
  }).required(),
});

export const createFeeStructureSchema = Joi.object({
  body: Joi.object({
    feeCategoryId: objectId.required(),
    academicYearId: objectId.required(),
    schoolClassId: objectId.optional(),
    amountPaise: Joi.number().integer().min(0).required(),
    dueDayOfMonth: Joi.number().integer().min(1).max(31),
  }).required(),
});

export const createExamSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    academicYearId: objectId.required(),
    examType: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }).required(),
});

export const upsertExamResultSchema = Joi.object({
  body: Joi.object({
    examId: objectId.required(),
    studentId: objectId.required(),
    subjectId: objectId.required(),
    marksObtained: Joi.number().min(0),
    grade: Joi.string(),
    isAbsent: Joi.boolean(),
    remarks: Joi.string(),
    published: Joi.boolean(),
  }).required(),
});

export const createGuardianSchema = Joi.object({
  body: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email(),
    aadhaar: Joi.string().length(12).pattern(/^\d+$/),
  }).required(),
});

export const linkGuardianSchema = Joi.object({
  params: Joi.object({ studentId: objectId.required() }),
  body: Joi.object({
    guardianId: objectId.required(),
    relationship: Joi.string().default('guardian'),
    isPrimary: Joi.boolean(),
  }).required(),
});

export const createEnrollmentSchema = Joi.object({
  params: Joi.object({ studentId: objectId.required() }),
  body: Joi.object({
    studentId: objectId.optional(),
    academicYearId: objectId.required(),
    schoolClassId: objectId.required(),
    sectionId: objectId.required(),
    rollNumber: Joi.string(),
  }).required(),
});

export const promoteStudentSchema = Joi.object({
  params: Joi.object({ studentId: objectId.required() }),
  body: Joi.object({
    newClassId: objectId.required(),
    newSectionId: objectId.required(),
    newYearId: objectId.optional(),
  }).required(),
});

export const createInvoiceSchema = Joi.object({
  body: Joi.object({
    studentId: objectId.required(),
    academicYearId: objectId.required(),
    dueAt: Joi.date().required(),
    lines: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          lineTotalPaise: Joi.number().integer().min(1).required(),
          feeCategoryId: objectId.optional(),
        })
      )
      .min(1)
      .required(),
  }).required(),
});

export const listInvoiceQuerySchema = Joi.object({
  query: Joi.object({
    ...paginationQuery,
    studentId: objectId.optional(),
    status: Joi.string().valid('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'),
  }),
});

export const assignRoleSchema = Joi.object({
  body: Joi.object({
    userId: objectId.required(),
    roleId: objectId.required(),
    organizationId: objectId.optional(),
    schoolId: objectId.optional(),
  }).required(),
});

export const academicYearSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    isCurrent: Joi.boolean(),
  }).required(),
});

export const schoolClassSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().required(),
    sortOrder: Joi.number().integer(),
  }).required(),
});

export const sectionSchema = Joi.object({
  params: Joi.object({ classId: objectId.required() }),
  body: Joi.object({
    name: Joi.string().required(),
    capacity: Joi.number().integer().min(1),
  }).required(),
});

export const markAttendanceSchema = Joi.object({
  body: Joi.object({
    studentId: objectId.required(),
    attendanceDate: Joi.date().required(),
    status: Joi.string().valid('present', 'absent', 'late', 'excused', 'half_day').required(),
    remarks: Joi.string(),
  }).required(),
});

export { idParam, studentIdParam, paginationQuerySchema, paginationQuery };

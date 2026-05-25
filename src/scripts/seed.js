import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  Permission,
  Role,
  SubscriptionPlan,
  Organization,
  School,
  User,
  OrganizationMember,
  UserSchool,
  UserRole,
  FeeCategory,
  AcademicYear,
  SchoolClass,
  Section,
  Guardian,
  Student,
  StudentProfile,
  StudentGuardian,
  StudentEnrollment,
  Term,
  Subject,
  SubjectChapter,
  StudentRating,
  Teacher,
} from '../models/index.js';
import { encryptAadhaar, aadhaarLast4 } from '../utils/aadhaar.js';

const PERMISSIONS = [
  { resource: 'student', action: 'read' },
  { resource: 'student', action: 'create' },
  { resource: 'student', action: 'manage' },
  { resource: 'invoice', action: 'read' },
  { resource: 'invoice', action: 'manage' },
  { resource: 'fee', action: 'pay' },
  { resource: 'school', action: 'read' },
  { resource: 'school', action: 'manage' },
  { resource: 'organization', action: 'manage' },
  { resource: 'subscription', action: 'manage' },
  { resource: 'attendance', action: 'read' },
  { resource: 'attendance', action: 'mark' },
  { resource: 'rating', action: 'read' },
  { resource: 'rating', action: 'create' },
  { resource: 'exam', action: 'read' },
  { resource: 'exam', action: 'manage' },
  { resource: 'classroom', action: 'read' },
  { resource: 'classroom', action: 'create' },
  { resource: 'classroom', action: 'manage' },
  { resource: 'classroom', action: 'material' },
];

const ROLES = [
  { code: 'SUPER_ADMIN', name: 'Super Admin', scopeLevel: 'organization' },
  { code: 'ORG_ADMIN', name: 'Organization Admin', scopeLevel: 'organization' },
  { code: 'PRINCIPAL', name: 'Principal', scopeLevel: 'school' },
  { code: 'TEACHER', name: 'Teacher', scopeLevel: 'school' },
  { code: 'ACCOUNTANT', name: 'Accountant', scopeLevel: 'school' },
  { code: 'PARENT', name: 'Parent', scopeLevel: 'school' },
  { code: 'STUDENT', name: 'Student', scopeLevel: 'school' },
];

function rolePermissions(code, permMap) {
  const all = Object.keys(permMap);
  const manage = (prefix) => all.filter((k) => k.startsWith(prefix));
  switch (code) {
    case 'SUPER_ADMIN':
    case 'ORG_ADMIN':
      return all.map((k) => ({ permissionId: permMap[k], effect: 'allow' }));
    case 'PRINCIPAL':
      return manage('student.')
        .concat(manage('attendance.'), manage('rating.'), manage('exam.'), manage('school.'), manage('invoice.'), manage('classroom.'))
        .map((k) => ({ permissionId: permMap[k], effect: 'allow' }));
    case 'TEACHER':
      return [
        'student.read',
        'attendance.read',
        'attendance.mark',
        'rating.read',
        'rating.create',
        'exam.read',
        'classroom.read',
        'classroom.create',
        'classroom.material',
      ].map((k) => ({ permissionId: permMap[k], effect: 'allow' }));
    case 'ACCOUNTANT':
      return manage('invoice.').concat(['student.read', 'fee.pay']).map((k) => ({ permissionId: permMap[k], effect: 'allow' }));
    case 'PARENT':
      return ['fee.pay', 'invoice.read', 'rating.read', 'attendance.read', 'classroom.read'].map((k) => ({
        permissionId: permMap[k],
        effect: 'allow',
      }));
    case 'STUDENT':
      return ['rating.read', 'attendance.read', 'invoice.read', 'classroom.read'].map((k) => ({
        permissionId: permMap[k],
        effect: 'allow',
      }));
    default:
      return [];
  }
}

async function seed() {
  await connectDatabase();

  for (const p of PERMISSIONS) {
    await Permission.findOneAndUpdate(
      { resource: p.resource, action: p.action },
      { ...p, isSystem: true },
      { upsert: true }
    );
  }
  const perms = await Permission.find();
  const permMap = Object.fromEntries(perms.map((p) => [`${p.resource}.${p.action}`, p._id]));

  await SubscriptionPlan.findOneAndUpdate(
    { code: 'starter' },
    {
      code: 'starter',
      name: 'Starter',
      billingInterval: 'monthly',
      pricePerUserPaise: 9900,
      currency: 'INR',
      features: [
        { featureCode: 'attendance', enabled: true },
        { featureCode: 'fees', enabled: true },
        { featureCode: 'ratings', enabled: true },
      ],
      isActive: true,
    },
    { upsert: true }
  );

  for (const r of ROLES) {
    await Role.findOneAndUpdate(
      { code: r.code, organizationId: null, schoolId: null },
      { ...r, isSystem: true, permissions: rolePermissions(r.code, permMap) },
      { upsert: true }
    );
  }

  const org = await Organization.findOneAndUpdate(
    { slug: 'demo-district' },
    { name: 'Demo District', slug: 'demo-district', email: 'admin@demo.edu', countryCode: 'IN', city: 'Mumbai' },
    { upsert: true, new: true }
  );

  const school = await School.findOneAndUpdate(
    { organizationId: org._id, code: 'SCH-001' },
    { organizationId: org._id, name: 'Demo Public School', code: 'SCH-001', email: 'office@demoschool.edu', city: 'Mumbai' },
    { upsert: true, new: true }
  );

  const passwordHash = await User.hashPassword('Password123!');
  const admin = await User.findOneAndUpdate(
    { email: 'admin@demo.edu' },
    { email: 'admin@demo.edu', passwordHash, firstName: 'Demo', lastName: 'Admin' },
    { upsert: true, new: true }
  );

  const parentUser = await User.findOneAndUpdate(
    { email: 'parent@demo.edu' },
    { email: 'parent@demo.edu', passwordHash, firstName: 'Raj', lastName: 'Kumar', phone: '9876543210' },
    { upsert: true, new: true }
  );

  await OrganizationMember.findOneAndUpdate(
    { organizationId: org._id, userId: admin._id },
    { organizationId: org._id, userId: admin._id, status: 'active' },
    { upsert: true }
  );

  await UserSchool.findOneAndUpdate(
    { userId: admin._id, schoolId: school._id },
    { userId: admin._id, schoolId: school._id, status: 'active' },
    { upsert: true }
  );

  const orgAdminRole = await Role.findOne({ code: 'ORG_ADMIN' });
  if (orgAdminRole) {
    await UserRole.findOneAndUpdate(
      { userId: admin._id, roleId: orgAdminRole._id, organizationId: org._id },
      { userId: admin._id, roleId: orgAdminRole._id, organizationId: org._id, status: 'active' },
      { upsert: true }
    );
  }

  const year = await AcademicYear.findOneAndUpdate(
    { schoolId: school._id, name: '2025-2026' },
    {
      schoolId: school._id,
      name: '2025-2026',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
    { upsert: true, new: true }
  );

  const cls = await SchoolClass.findOneAndUpdate(
    { schoolId: school._id, name: 'Class 5' },
    { schoolId: school._id, name: 'Class 5', numericLevel: 5 },
    { upsert: true, new: true }
  );

  const section = await Section.findOneAndUpdate(
    { schoolClassId: cls._id, name: 'A' },
    { schoolClassId: cls._id, name: 'A', capacity: 40 },
    { upsert: true, new: true }
  );

  const guardian = await Guardian.findOneAndUpdate(
    { phone: '9876543210' },
    {
      userId: parentUser._id,
      firstName: 'Raj',
      lastName: 'Kumar',
      email: 'parent@demo.edu',
      phone: '9876543210',
      aadhaarEncrypted: encryptAadhaar('234567890123'),
      aadhaarLast4: aadhaarLast4('234567890123'),
    },
    { upsert: true, new: true }
  );

  for (let i = 1; i <= 3; i++) {
    const student = await Student.findOneAndUpdate(
      { schoolId: school._id, admissionNumber: `ADM-2025-00${i}` },
      {
        schoolId: school._id,
        admissionNumber: `ADM-2025-00${i}`,
        admissionDate: new Date('2025-04-01'),
        status: 'active',
      },
      { upsert: true, new: true }
    );

    await StudentProfile.findOneAndUpdate(
      { studentId: student._id },
      {
        studentId: student._id,
        aadhaarEncrypted: encryptAadhaar(`12345678901${i}`),
        aadhaarLast4: aadhaarLast4(`12345678901${i}`),
      },
      { upsert: true }
    );

    await StudentEnrollment.findOneAndUpdate(
      { studentId: student._id, academicYearId: year._id },
      {
        studentId: student._id,
        academicYearId: year._id,
        schoolClassId: cls._id,
        sectionId: section._id,
        rollNumber: String(i),
        status: 'active',
      },
      { upsert: true }
    );

    await StudentGuardian.findOneAndUpdate(
      { studentId: student._id, guardianId: guardian._id },
      {
        studentId: student._id,
        guardianId: guardian._id,
        relationship: i === 1 ? 'father' : 'guardian',
        isPrimary: i === 1,
      },
      { upsert: true }
    );
  }

  const term = await Term.findOneAndUpdate(
    { schoolId: school._id, academicYearId: year._id, code: 'T1' },
    {
      schoolId: school._id,
      academicYearId: year._id,
      name: 'Term 1',
      code: 'T1',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-09-30'),
      sortOrder: 1,
      isCurrent: true,
    },
    { upsert: true, new: true }
  );

  const subject = await Subject.findOneAndUpdate(
    { schoolId: school._id, code: 'MATH' },
    { schoolId: school._id, code: 'MATH', name: 'Mathematics' },
    { upsert: true, new: true }
  );

  const chapter = await SubjectChapter.findOneAndUpdate(
    { schoolId: school._id, academicYearId: year._id, subjectId: subject._id, chapterNumber: 1 },
    {
      schoolId: school._id,
      academicYearId: year._id,
      subjectId: subject._id,
      schoolClassId: cls._id,
      chapterNumber: 1,
      chapterName: 'Numbers and Place Value',
      topics: [
        { name: 'Place value up to lakhs', sortOrder: 1 },
        { name: 'Comparing numbers', sortOrder: 2 },
      ],
    },
    { upsert: true, new: true }
  );

  const teacherUser = await User.findOneAndUpdate(
    { email: 'teacher@demo.edu' },
    {
      email: 'teacher@demo.edu',
      passwordHash,
      firstName: 'Priya',
      lastName: 'Sharma',
    },
    { upsert: true, new: true }
  );

  await UserSchool.findOneAndUpdate(
    { userId: teacherUser._id, schoolId: school._id },
    { userId: teacherUser._id, schoolId: school._id, status: 'active' },
    { upsert: true }
  );

  const teacher = await Teacher.findOneAndUpdate(
    { schoolId: school._id, employeeCode: 'T-001' },
    {
      schoolId: school._id,
      userId: teacherUser._id,
      employeeCode: 'T-001',
      joiningDate: new Date('2024-06-01'),
      department: 'Mathematics',
    },
    { upsert: true, new: true }
  );

  const teacherRole = await Role.findOne({ code: 'TEACHER' });
  if (teacherRole) {
    await UserRole.findOneAndUpdate(
      { userId: teacherUser._id, roleId: teacherRole._id, schoolId: school._id },
      { userId: teacherUser._id, roleId: teacherRole._id, schoolId: school._id, status: 'active' },
      { upsert: true }
    );
  }

  await StudentRating.deleteMany({ schoolId: school._id });

  const students = await Student.find({ schoolId: school._id });
  for (const student of students) {
    const enrollment = await StudentEnrollment.findOne({
      studentId: student._id,
      academicYearId: year._id,
    });
    await StudentRating.create({
      schoolId: school._id,
      studentId: student._id,
      enrollmentId: enrollment._id,
      academicYearId: year._id,
      sessionId: term._id,
      schoolClassId: cls._id,
      sectionId: section._id,
      subjectId: subject._id,
      chapterId: chapter._id,
      chapter: chapter.chapterName,
      topic: 'Place value up to lakhs',
      ratedDate: new Date('2025-05-15'),
      ratingType: 'chapter_assessment',
      performance: 'good',
      score: 42,
      maxScore: 50,
      percentage: 84,
      flag: 'on_track',
      remarks: 'Participates well in class',
      teacherId: teacher._id,
      ratedByUserId: teacherUser._id,
      status: 'published',
      publishedAt: new Date(),
    });
  }

  await FeeCategory.findOneAndUpdate(
    { schoolId: school._id, code: 'TUITION' },
    { schoolId: school._id, code: 'TUITION', name: 'Tuition Fee' },
    { upsert: true }
  );

  const parentRole = await Role.findOne({ code: 'PARENT' });
  if (parentRole) {
    await UserRole.findOneAndUpdate(
      { userId: parentUser._id, roleId: parentRole._id, schoolId: school._id },
      { userId: parentUser._id, roleId: parentRole._id, schoolId: school._id, status: 'active' },
      { upsert: true }
    );
  }

  console.log('\n=== Seed complete ===');
  console.log('Admin:  admin@demo.edu / Password123!');
  console.log('Parent:  parent@demo.edu / Password123! (3 children linked)');
  console.log('Teacher: teacher@demo.edu / Password123!');
  console.log('Org ID:', org._id);
  console.log('School ID:', school._id);
  console.log('Term (session) ID:', term._id);
  console.log('Subject ID:', subject._id);

  await disconnectDatabase();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

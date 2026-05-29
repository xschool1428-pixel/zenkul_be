import { School, UserSchool, OrganizationMember } from '../models/index.js';

export async function countBillableSeats(organizationId) {
  const schools = await School.find({ organizationId, deletedAt: null }).select('_id');
  const schoolIds = schools.map((s) => s._id);

  const schoolUsers = await UserSchool.countDocuments({
    schoolId: { $in: schoolIds },
    status: 'active',
  });
  const orgUsers = await OrganizationMember.countDocuments({
    organizationId,
    status: 'active',
  });

  return Math.max(schoolUsers + orgUsers, 1);
}

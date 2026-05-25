/** System permissions required for SUPER_ADMIN and other built-in roles */
export const SYSTEM_PERMISSIONS = [
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

export function superAdminRolePermissions(permMap) {
  return Object.keys(permMap).map((key) => ({
    permissionId: permMap[key],
    effect: 'allow',
  }));
}

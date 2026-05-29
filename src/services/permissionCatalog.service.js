import { Permission } from '../models/index.js';
import { SYSTEM_PERMISSIONS } from '../bootstrap/constants/systemPermissions.js';
import { NotFoundError } from '../utils/errors.js';

const PLATFORM_ONLY_KEYS = new Set(['organization.manage', 'subscription.manage']);

export function permissionKey(resource, action) {
  return `${resource}.${action}`;
}

export async function ensurePermissionsSeeded() {
  for (const p of SYSTEM_PERMISSIONS) {
    const key = permissionKey(p.resource, p.action);
    await Permission.findOneAndUpdate(
      { resource: p.resource, action: p.action },
      {
        ...p,
        isSystem: true,
        isPlatformOnly: PLATFORM_ONLY_KEYS.has(key),
        isActive: true,
      },
      { upsert: true, new: true }
    );
  }
  return Permission.find({ isActive: true }).sort({ resource: 1, action: 1 });
}

export async function listCatalog({ includePlatformOnly = false } = {}) {
  const q = { isActive: true };
  if (!includePlatformOnly) q.isPlatformOnly = { $ne: true };
  return Permission.find(q).sort({ resource: 1, action: 1 });
}

export async function createPermission({ resource, action, description, category }, actorUserId) {
  const existing = await Permission.findOne({ resource, action });
  if (existing) return existing;

  return Permission.create({
    resource,
    action,
    description,
    category: category || 'custom',
    isSystem: false,
    isPlatformOnly: false,
    isActive: true,
  });
}

export async function getPermissionIdsByKeys(keys = []) {
  if (!keys.length) return [];
  const perms = await Permission.find({ isActive: true });
  const map = new Map(perms.map((p) => [permissionKey(p.resource, p.action), p._id]));
  return keys.map((k) => map.get(k)).filter(Boolean);
}

export async function assertPermissionIdsExist(ids) {
  const found = await Permission.countDocuments({ _id: { $in: ids }, isActive: true });
  if (found !== ids.length) throw new NotFoundError('One or more permissions not found');
}

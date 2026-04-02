import { isAdminEmail, normalizeEmail } from '@/lib/admin';

export const ADMIN_ROLE = {
  FULL: 'full',
  CATALOG: 'catalog',
};

export const ADMIN_PERMISSION = {
  DASHBOARD_VIEW: 'dashboard.view',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',
  ORDERS_VIEW: 'orders.view',
  ORDERS_UPDATE: 'orders.update',
  USERS_VIEW: 'users.view',
  REVIEWS_VIEW: 'reviews.view',
  REVIEWS_DELETE: 'reviews.delete',
  SHIPPING_VIEW: 'shipping.view',
  SHIPPING_UPDATE: 'shipping.update',
  COVER_PHOTOS_VIEW: 'coverPhotos.view',
  COVER_PHOTOS_UPDATE: 'coverPhotos.update',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  ADMINS_MANAGE: 'admins.manage',
};

const ROLE_PERMISSIONS = {
  [ADMIN_ROLE.FULL]: new Set(Object.values(ADMIN_PERMISSION)),
  [ADMIN_ROLE.CATALOG]: new Set([
    ADMIN_PERMISSION.DASHBOARD_VIEW,
    ADMIN_PERMISSION.PRODUCTS_VIEW,
    ADMIN_PERMISSION.PRODUCTS_CREATE,
    ADMIN_PERMISSION.PRODUCTS_UPDATE,
    ADMIN_PERMISSION.CATEGORIES_VIEW,
    ADMIN_PERMISSION.CATEGORIES_CREATE,
    ADMIN_PERMISSION.CATEGORIES_UPDATE,
    ADMIN_PERMISSION.ORDERS_VIEW,
    ADMIN_PERMISSION.ORDERS_UPDATE,
  ]),
};

export function normalizeAdminRole(role) {
  return role === ADMIN_ROLE.CATALOG ? ADMIN_ROLE.CATALOG : ADMIN_ROLE.FULL;
}

export function getAdminRoleLabel(role) {
  return normalizeAdminRole(role) === ADMIN_ROLE.CATALOG ? 'Product & Orders' : 'Full Access';
}

export function getDynamicAdminEntries(settings = null) {
  const legacyEmails = Array.isArray(settings?.adminEmails) ? settings.adminEmails : [];
  const roleEntries = Array.isArray(settings?.adminAccess) ? settings.adminAccess : [];
  const merged = new Map();

  legacyEmails.forEach((email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return;
    merged.set(normalized, { email: normalized, role: ADMIN_ROLE.FULL });
  });

  roleEntries.forEach((entry) => {
    const normalized = normalizeEmail(entry?.email);
    if (!normalized) return;
    merged.set(normalized, {
      email: normalized,
      role: normalizeAdminRole(entry?.role),
    });
  });

  return Array.from(merged.values()).sort((a, b) => a.email.localeCompare(b.email));
}

export function resolveAdminRole(email, settings = null) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  if (isAdminEmail(normalized)) {
    return ADMIN_ROLE.FULL;
  }

  const entry = getDynamicAdminEntries(settings).find((item) => item.email === normalized);
  return entry ? normalizeAdminRole(entry.role) : null;
}

export function hasAdminPermission(role, permission) {
  const normalizedRole = normalizeAdminRole(role);
  return ROLE_PERMISSIONS[normalizedRole]?.has(permission) ?? false;
}

import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION, hasAdminPermission } from '@/lib/adminAccess';

import AdminCategoriesClient from './AdminCategoriesClient';

export default async function AdminCategoriesPage() {
  const session = await requireAdmin(ADMIN_PERMISSION.CATEGORIES_VIEW);

  return (
    <AdminCategoriesClient
      canDeleteCategories={hasAdminPermission(session.user?.adminRole, ADMIN_PERMISSION.CATEGORIES_DELETE)}
    />
  );
}

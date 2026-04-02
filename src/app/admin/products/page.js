import { getAdminProductsPage } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION, hasAdminPermission } from '@/lib/adminAccess';

import AdminProductsClient from './AdminProductsClient';

export default async function AdminProductsPage({ searchParams }) {
  const session = await requireAdmin(ADMIN_PERMISSION.PRODUCTS_VIEW);

  const params = await searchParams;
  const search = String(params?.search || '').trim();
  const status = String(params?.status || 'all').trim() || 'all';
  const stock = String(params?.stock || 'all').trim() || 'all';
  const sort = String(params?.sort || 'newest').trim() || 'newest';
  const page = Math.max(1, Number(params?.page) || 1);
  const result = await getAdminProductsPage({ search, status, stock, sort, page, limit: 12 });

  return (
    <AdminProductsClient
      initialProducts={result.items}
      total={result.total}
      totalPages={result.totalPages}
      currentPage={result.page}
      initialSearchQuery={result.searchTerm}
      initialStatusFilter={result.status}
      initialStockFilter={result.stock}
      initialSortOption={result.sort}
      summary={result.summary}
      canDeleteProducts={hasAdminPermission(session.user?.adminRole, ADMIN_PERMISSION.PRODUCTS_DELETE)}
    />
  );
}

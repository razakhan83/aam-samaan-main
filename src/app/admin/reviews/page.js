import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';
import { getAdminReviewsPage } from '@/lib/data';
import AdminReviewsClient from './AdminReviewsClient';

export const metadata = {
  title: 'Review Management | Admin',
};

export default async function AdminReviewsPage({ searchParams }) {
  await requireAdmin(ADMIN_PERMISSION.REVIEWS_VIEW);

  const params = await searchParams;
  const search = String(params?.search || '').trim();
  const page = Math.max(1, Number(params?.page) || 1);
  const result = await getAdminReviewsPage({ search, page, limit: 12 });

  return (
    <AdminReviewsClient
      initialReviews={result.items}
      total={result.total}
      totalPages={result.totalPages}
      currentPage={result.page}
      initialSearchQuery={result.searchTerm}
      summary={result.summary}
    />
  );
}

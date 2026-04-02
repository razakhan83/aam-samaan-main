import { getAdminCoverPhotos } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';

import CoverPhotosClient from './CoverPhotosClient';

export default async function AdminCoverPhotosPage() {
  await requireAdmin(ADMIN_PERMISSION.COVER_PHOTOS_VIEW);

  return <CoverPhotosContent />;
}

async function CoverPhotosContent() {
  const coverPhotos = await getAdminCoverPhotos();
  return <CoverPhotosClient initialSlides={coverPhotos} />;
}

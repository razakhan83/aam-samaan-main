import { connection } from 'next/server';
import AddProductClient from './AddProductClient';
import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';

export default async function AddProductPage() {
  await connection();
  await requireAdmin(ADMIN_PERMISSION.PRODUCTS_CREATE);
  return <AddProductClient />;
}

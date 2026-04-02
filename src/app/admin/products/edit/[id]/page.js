import { connection } from 'next/server';
import EditProductClient from './EditProductClient';
import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';

export default async function Page({ params }) {
    await connection();
    await requireAdmin(ADMIN_PERMISSION.PRODUCTS_UPDATE);
    const { id } = await params;
    return <EditProductClient id={id} />;
}

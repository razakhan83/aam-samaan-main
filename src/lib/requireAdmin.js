// @ts-nocheck
import 'server-only';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { hasAdminPermission } from '@/lib/adminAccess';

export async function requireAdmin(permission) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    redirect('/admin/login');
  }

  if (permission && !hasAdminPermission(session.user?.adminRole, permission)) {
    redirect('/admin');
  }

  return session;
}

export async function getAdminAccess(permission) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.isAdmin) {
    return { ok: false, status: 401, session: null };
  }

  if (permission && !hasAdminPermission(session.user?.adminRole, permission)) {
    return { ok: false, status: 403, session };
  }

  return {
    ok: true,
    status: 200,
    session,
    role: session.user?.adminRole || null,
  };
}

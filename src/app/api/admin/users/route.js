// @ts-nocheck
import { NextResponse } from 'next/server';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';
import { getAdminAccess } from '@/lib/requireAdmin';

import mongooseConnect from '@/lib/mongooseConnect';
import User from '@/models/User';

export async function GET() {
  try {
    const access = await getAdminAccess(ADMIN_PERMISSION.USERS_VIEW);
    if (!access.ok) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: access.status });
    }

    await mongooseConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        _id: user._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

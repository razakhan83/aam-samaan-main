import { NextResponse } from 'next/server';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';
import { getAdminAccess } from '@/lib/requireAdmin';

import mongooseConnect from '@/lib/mongooseConnect';
import User from '@/models/User';

export async function PATCH(request, { params }) {
  try {
    const access = await getAdminAccess(ADMIN_PERMISSION.USERS_VIEW);
    if (!access.ok) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: access.status });
    }

    const { id } = await params;
    const { disabled, action } = await request.json();
    await mongooseConnect();

    let update = {};
    if (action === 'force-logout') {
      update.forceLogoutAt = new Date();
    } else if (typeof disabled === 'boolean') {
      update.disabled = disabled;
      if (disabled === true) {
        // Automatically invalidate existing sessions when disabling
        update.forceLogoutAt = new Date();
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).lean();

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        _id: user._id.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

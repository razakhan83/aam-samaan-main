import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';
import { getAdminAccess } from '@/lib/requireAdmin';

import mongooseConnect from '@/lib/mongooseConnect';
import Review from '@/models/Review';

export async function DELETE(req, { params }) {
  try {
    const access = await getAdminAccess(ADMIN_PERMISSION.REVIEWS_DELETE);
    if (!access.ok) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: access.status });
    }

    const { id } = await params;
    await mongooseConnect();
    
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    revalidateTag(`reviews-${review.productId?.toString?.() || review.productId}`);

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

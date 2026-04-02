import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
import Settings from '@/models/Settings';
import { getAllAdminEmails, getConfiguredAdminEmails, isAdminEmail, normalizeEmail } from '@/lib/admin';
import { getDynamicAdminEntries, normalizeAdminRole } from '@/lib/adminAccess';

const SETTINGS_KEY = 'site-settings';

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

async function requireAnyAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return null;
  }
  return session;
}

// GET — list current dynamic admin emails
export async function GET() {
  try {
    const session = await requireAnyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await mongooseConnect();
    const settings = await Settings.findOne({ singletonKey: SETTINGS_KEY }).lean();
    const configuredAdmins = getConfiguredAdminEmails();
    const dynamicAdmins = getDynamicAdminEntries(settings);

    return NextResponse.json({
      success: true,
      data: {
        configuredAdmins,
        dynamicAdmins,
        allAdmins: getAllAdminEmails(dynamicAdmins.map((entry) => entry.email)),
      },
    });
  } catch (error) {
    console.error('GET /api/settings/admins error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST — add a new dynamic admin email
export async function POST(req) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const email = normalizeEmail(body.email);
    const role = normalizeAdminRole(body.role);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    await mongooseConnect();
    const settings = await Settings.findOne({ singletonKey: SETTINGS_KEY });
    const nextSettings = settings || new Settings({ singletonKey: SETTINGS_KEY });
    const remainingEntries = getDynamicAdminEntries(nextSettings).filter((entry) => entry.email !== email);

    nextSettings.adminEmails = Array.from(new Set([...(nextSettings.adminEmails || []), email]));
    nextSettings.adminAccess = [...remainingEntries, { email, role }];
    await nextSettings.save();

    return NextResponse.json({ success: true, data: getDynamicAdminEntries(nextSettings) });
  } catch (error) {
    console.error('POST /api/settings/admins error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const email = normalizeEmail(body.email);
    const role = normalizeAdminRole(body.role);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    await mongooseConnect();
    const settings = await Settings.findOne({ singletonKey: SETTINGS_KEY });
    const nextSettings = settings || new Settings({ singletonKey: SETTINGS_KEY });
    const remainingEntries = getDynamicAdminEntries(nextSettings).filter((entry) => entry.email !== email);

    nextSettings.adminEmails = Array.from(new Set([...(nextSettings.adminEmails || []), email]));
    nextSettings.adminAccess = [...remainingEntries, { email, role }];
    await nextSettings.save();

    return NextResponse.json({ success: true, data: getDynamicAdminEntries(nextSettings) });
  } catch (error) {
    console.error('PATCH /api/settings/admins error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE — remove a dynamic admin email
export async function DELETE(req) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const email = normalizeEmail(body.email);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    await mongooseConnect();
    const settings = await Settings.findOne({ singletonKey: SETTINGS_KEY });
    const nextSettings = settings || new Settings({ singletonKey: SETTINGS_KEY });
    nextSettings.adminEmails = (nextSettings.adminEmails || []).filter((entry) => normalizeEmail(entry) !== email);
    nextSettings.adminAccess = getDynamicAdminEntries(nextSettings).filter((entry) => entry.email !== email);
    await nextSettings.save();

    return NextResponse.json({ success: true, data: getDynamicAdminEntries(nextSettings) });
  } catch (error) {
    console.error('DELETE /api/settings/admins error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

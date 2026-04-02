import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongooseConnect from '@/lib/mongooseConnect';
import { getDefaultSavedAddress, normalizeSavedAddresses } from '@/lib/userAddresses';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await mongooseConnect();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      city: user.city || '',
      address: user.address || '',
      landmark: user.landmark || '',
      savedAddresses: normalizeSavedAddresses(user.savedAddresses, {
        fallbackName: user.name,
        fallbackPhone: user.phone,
      }),
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, city, address, landmark, savedAddresses } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const normalizedAddresses = normalizeSavedAddresses(savedAddresses, {
      fallbackName: name,
      fallbackPhone: phone,
    });
    const defaultAddress = getDefaultSavedAddress(normalizedAddresses);

    await mongooseConnect();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name,
        phone: defaultAddress?.phone || phone,
        city: defaultAddress?.city || city,
        address: defaultAddress?.address || address,
        landmark: defaultAddress?.landmark || landmark,
        savedAddresses: normalizedAddresses,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      name: user.name,
      phone: user.phone,
      city: user.city,
      address: user.address,
      landmark: user.landmark,
      savedAddresses: normalizeSavedAddresses(user.savedAddresses, {
        fallbackName: user.name,
        fallbackPhone: user.phone,
      }),
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

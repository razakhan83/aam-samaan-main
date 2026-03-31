import { Suspense } from 'react';

import CheckoutPageSkeleton from '@/components/CheckoutPageSkeleton';
import { getStoreSettings } from '@/lib/data';

import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Checkout',
  description: 'Complete your order at Aam Samaan.',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutPageSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const settings = await getStoreSettings();
  return <CheckoutClient settings={settings} />;
}

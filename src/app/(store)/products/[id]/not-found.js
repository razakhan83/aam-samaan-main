import Link from 'next/link';
import { PackageX, ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <PackageX className="size-10 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Product not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This product doesn&apos;t exist or is no longer available.
        </p>
      </div>
      <Link
        href="/products"
        className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Browse Products
      </Link>
    </div>
  );
}

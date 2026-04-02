import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <Search className="size-10 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:text-primary-foreground"
      >
        <Home className="size-4" />
        Back to Home
      </Link>
    </div>
  );
}

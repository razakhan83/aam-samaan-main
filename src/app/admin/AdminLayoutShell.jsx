'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import {
  Box,
  ChartColumn,
  ChevronDown,
  ExternalLink,
  Images,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShoppingCart,
  Sun,
  Store,
  Truck,
  Users,
} from 'lucide-react';

import AdminNotificationCenter from '@/components/AdminNotificationCenter';
import AdminSmartSearch from '@/components/AdminSmartSearch';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ADMIN_PERMISSION, getAdminRoleLabel, hasAdminPermission } from '@/lib/adminAccess';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    type: 'link',
    href: '/admin',
    label: 'Dashboard',
    icon: ChartColumn,
    permission: ADMIN_PERMISSION.DASHBOARD_VIEW,
    match: (pathname) => pathname === '/admin',
  },
  {
    type: 'section',
    key: 'products',
    label: 'Products',
    icon: Box,
    match: (pathname) =>
      pathname.startsWith('/admin/products') ||
      pathname.startsWith('/admin/categories') ||
      pathname.startsWith('/admin/reviews'),
    children: [
      { href: '/admin/products', label: 'Product List', permission: ADMIN_PERMISSION.PRODUCTS_VIEW, match: (pathname) => pathname === '/admin/products' },
      { href: '/admin/products/add', label: 'Add Product', permission: ADMIN_PERMISSION.PRODUCTS_CREATE, match: (pathname) => pathname === '/admin/products/add' },
      { href: '/admin/categories', label: 'Categories', permission: ADMIN_PERMISSION.CATEGORIES_VIEW, match: (pathname) => pathname.startsWith('/admin/categories') },
      { href: '/admin/reviews', label: 'Reviews', permission: ADMIN_PERMISSION.REVIEWS_VIEW, match: (pathname) => pathname.startsWith('/admin/reviews') },
    ],
  },
  {
    type: 'section',
    key: 'sales',
    label: 'Sales',
    icon: ShoppingCart,
    permission: ADMIN_PERMISSION.ORDERS_VIEW,
    match: (pathname) => pathname.startsWith('/admin/orders'),
    children: [
      { href: '/admin/orders', label: 'Orders', permission: ADMIN_PERMISSION.ORDERS_VIEW, match: (pathname) => pathname.startsWith('/admin/orders') },
    ],
  },
  {
    type: 'link',
    href: '/admin/users',
    label: 'Users / Customers',
    icon: Users,
    permission: ADMIN_PERMISSION.USERS_VIEW,
    match: (pathname) => pathname.startsWith('/admin/users'),
  },
  {
    type: 'link',
    href: '/admin/shipping',
    label: 'Shipping',
    icon: Truck,
    permission: ADMIN_PERMISSION.SHIPPING_VIEW,
    match: (pathname) => pathname.startsWith('/admin/shipping'),
  },
  {
    type: 'link',
    href: '/admin/cover-photos',
    label: 'Cover Photos',
    icon: Images,
    permission: ADMIN_PERMISSION.COVER_PHOTOS_VIEW,
    match: (pathname) => pathname.startsWith('/admin/cover-photos'),
  },
  {
    type: 'link',
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    permission: ADMIN_PERMISSION.SETTINGS_VIEW,
    match: (pathname) => pathname.startsWith('/admin/settings'),
  },
];

function getInitialSectionState(pathname, items = sidebarItems) {
  return items.reduce((state, item) => {
    if (item.type === 'section') {
      state[item.key] = item.match(pathname);
    }
    return state;
  }, {});
}

function getCurrentPageLabel(pathname, items = sidebarItems) {
  for (const item of items) {
    if (item.type === 'link' && item.match(pathname)) {
      return item.label;
    }

    if (item.type === 'section') {
      const activeChild = item.children.find((child) => child.match(pathname));
      if (activeChild) return activeChild.label;
      if (item.match(pathname)) return item.label;
    }
  }

  return 'Admin';
}

function subscribeToAdminTheme(callback) {
  const handleStorage = (event) => {
    if (event.key && event.key !== 'admin-theme') return;
    callback();
  };

  const handleThemeChange = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener('admin-theme-change', handleThemeChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('admin-theme-change', handleThemeChange);
  };
}

function getAdminThemeSnapshot() {
  const storedTheme = window.localStorage.getItem('admin-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getAdminThemeServerSnapshot() {
  return 'light';
}

export default function AdminLayoutShell({ children, sessionUser }) {
  const pathname = usePathname();
  const adminRole = sessionUser?.adminRole || null;
  const visibleSidebarItems = useMemo(() => (
    sidebarItems.reduce((items, item) => {
      const canSeeItem = !item.permission || hasAdminPermission(adminRole, item.permission);
      if (!canSeeItem) return items;

      if (item.type === 'section') {
        const children = item.children.filter((child) => !child.permission || hasAdminPermission(adminRole, child.permission));
        if (children.length === 0) return items;
        items.push({ ...item, children });
        return items;
      }

      items.push(item);
      return items;
    }, [])
  ), [adminRole]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState(() => getInitialSectionState(pathname, visibleSidebarItems));
  const adminTheme = useSyncExternalStore(
    subscribeToAdminTheme,
    getAdminThemeSnapshot,
    getAdminThemeServerSnapshot
  );
  const previousSectionMatchesRef = useRef(getInitialSectionState(pathname, visibleSidebarItems));

  useEffect(() => {
    const currentSectionMatches = getInitialSectionState(pathname, visibleSidebarItems);

    setOpenSections((previous) => {
      let changed = false;
      const next = { ...previous };

      Object.entries(currentSectionMatches).forEach(([key, isMatching]) => {
        if (isMatching && !previousSectionMatchesRef.current[key] && !previous[key]) {
          next[key] = true;
          changed = true;
        }
      });

      previousSectionMatchesRef.current = currentSectionMatches;
      return changed ? next : previous;
    });
  }, [pathname, visibleSidebarItems]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle('admin-theme-light', adminTheme === 'light');
    root.classList.toggle('admin-theme-dark', adminTheme === 'dark');
    body.classList.toggle('admin-theme-light', adminTheme === 'light');
    body.classList.toggle('admin-theme-dark', adminTheme === 'dark');

    return () => {
      root.classList.remove('admin-theme-light');
      root.classList.remove('admin-theme-dark');
      body.classList.remove('admin-theme-light');
      body.classList.remove('admin-theme-dark');
    };
  }, [adminTheme]);

  const currentPageLabel = useMemo(() => getCurrentPageLabel(pathname, visibleSidebarItems), [pathname, visibleSidebarItems]);

  if (pathname === '/admin/login') return <>{children}</>;

  const closeSidebar = () => setSidebarOpen(false);

  const sidebar = (
    <div className="flex h-full flex-col bg-card px-4 py-5 text-card-foreground">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-primary">
          <Store className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[0.04em] text-foreground">Aam Samaan Admin</p>
          <p className="text-xs text-muted-foreground">Store operations</p>
        </div>
      </div>

      <nav className="mt-5 flex flex-col gap-1.5">
        {visibleSidebarItems.map((item) => {
          if (item.type === 'link') {
            const Icon = item.icon;
            const active = item.match(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium no-underline transition-colors hover:no-underline',
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          }

          const Icon = item.icon;
          const open = openSections[item.key];
          const sectionActive = item.match(pathname);

          return (
            <div key={item.key} className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() =>
                  setOpenSections((previous) => ({
                    ...previous,
                    [item.key]: !previous[item.key],
                  }))
                }
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold transition-colors',
                  sectionActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                <ChevronDown
                  className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
                />
              </button>

              <div
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
                  open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-80'
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-7 flex flex-col gap-1 pl-3">
                    {item.children.map((child) => {
                      const active = child.match(pathname);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeSidebar}
                          className={cn(
                            'rounded-md px-3 py-2 text-sm no-underline transition-colors hover:no-underline',
                            active
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-5">
        <div className="md:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => {
              const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
              window.localStorage.setItem('admin-theme', nextTheme);
              window.dispatchEvent(new Event('admin-theme-change'));
            }}
          >
            {adminTheme === 'dark' ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
            {adminTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-muted/55 px-3 py-3">
          <Avatar className="size-9 border border-border">
            <AvatarImage src={sessionUser?.image} alt={sessionUser?.name || 'Admin'} />
            <AvatarFallback className="bg-muted text-foreground">{(sessionUser?.name || 'A').charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{sessionUser?.name || 'Admin'}</p>
            <p className="truncate text-xs text-muted-foreground">{sessionUser?.email}</p>
            {adminRole ? <p className="truncate text-[11px] text-muted-foreground">{getAdminRoleLabel(adminRole)}</p> : null}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="justify-start text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/35"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut data-icon="inline-start" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn('admin-shell min-h-screen bg-muted/20', adminTheme === 'dark' && 'admin-theme-dark')}>
      <NextTopLoader
        color="var(--color-primary)"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl
        showSpinner={false}
        easing="ease"
        speed={200}
      />

      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card md:sticky md:top-0 md:block md:h-screen">
          {sidebar}
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 md:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu />
                </Button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{currentPageLabel}</p>
                  <p className="truncate text-xs text-muted-foreground">Welcome back, {sessionUser?.name || 'Admin'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <AdminSmartSearch />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="hidden border-border bg-background text-foreground md:inline-flex"
                  onClick={() => {
                    const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
                    window.localStorage.setItem('admin-theme', nextTheme);
                    window.dispatchEvent(new Event('admin-theme-change'));
                  }}
                >
                  {adminTheme === 'dark' ? <Sun data-icon="inline-start" /> : <Moon data-icon="inline-start" />}
                  {adminTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'border-border bg-background text-foreground hover:border-destructive/35 hover:bg-destructive/5 hover:text-destructive'
                  )}
                >
                  Back to Store
                  <ExternalLink data-icon="inline-end" />
                </Link>
                <AdminNotificationCenter />
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative size-9 rounded-full p-0">
                        <Avatar className="size-9 border border-border">
                          <AvatarImage src={sessionUser?.image} alt={sessionUser?.name || 'Admin'} />
                          <AvatarFallback className="bg-muted text-foreground">
                            {(sessionUser?.name || 'A').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium leading-none">{sessionUser?.name || 'Admin'}</p>
                            <p className="text-xs leading-none text-muted-foreground">{sessionUser?.email}</p>
                            {adminRole ? <p className="text-[11px] leading-none text-muted-foreground">{getAdminRoleLabel(adminRole)}</p> : null}
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => signOut({ callbackUrl: '/admin/login' })}
                          className="text-foreground focus:bg-destructive/10 focus:text-destructive"
                        >
                          <LogOut className="mr-2 size-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[min(92vw,20rem)] bg-card p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>Navigate between admin sections.</SheetDescription>
          </SheetHeader>
          {sidebar}
        </SheetContent>
      </Sheet>
    </div>
  );
}

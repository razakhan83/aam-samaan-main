import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminLayoutShell from './AdminLayoutShell';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              try {
                const storedTheme = window.localStorage.getItem('admin-theme');
                const theme =
                  storedTheme === 'dark' || storedTheme === 'light'
                    ? storedTheme
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                const root = document.documentElement;
                const body = document.body;
                root.classList.remove('admin-theme-light', 'admin-theme-dark');
                body.classList.remove('admin-theme-light', 'admin-theme-dark');
                root.classList.add(theme === 'dark' ? 'admin-theme-dark' : 'admin-theme-light');
                body.classList.add(theme === 'dark' ? 'admin-theme-dark' : 'admin-theme-light');
              } catch (error) {}
            })();
          `,
        }}
      />
      <AdminLayoutShell sessionUser={session?.user || null}>{children}</AdminLayoutShell>
    </>
  );
}

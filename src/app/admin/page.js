import Link from 'next/link';
import {
  ArrowRight,
  Box,
  CircleDollarSign,
  Clock3,
  Inbox,
  Package2,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAdminDashboardData } from '@/lib/data';
import { requireAdmin } from '@/lib/requireAdmin';
import { ADMIN_PERMISSION } from '@/lib/adminAccess';

const statsConfig = [
  { title: 'Total Orders', icon: ShoppingBag },
  { title: 'Revenue', icon: CircleDollarSign },
  { title: 'Total Products', icon: Box },
  { title: 'Customers', icon: Users },
];

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
}

export default async function AdminDashboardPage() {
  await requireAdmin(ADMIN_PERMISSION.DASHBOARD_VIEW);
  return <DashboardContent />;
}

async function DashboardContent() {
  const { summary, recentOrders, statusBreakdown, topProducts, trend } = await getAdminDashboardData();
  const maxRevenueDay = Math.max(...trend.last7DaysRevenue.map((entry) => entry.revenue), 1);
  const stats = [
    { value: `${summary.totalOrders}`, meta: `${summary.pendingOrders} pending` },
    { value: formatMoney(summary.totalRevenue), meta: formatMoney(summary.revenueLast30Days) },
    { value: `${summary.totalProducts}`, meta: `${summary.liveProducts} live` },
    { value: `${summary.totalCustomers}`, meta: formatMoney(summary.averageOrderValue) },
  ];

  return (
    <div className="admin-dashboard flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="admin-dashboard-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Analytics dashboard</h1>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="admin-dashboard-button hidden w-full sm:inline-flex sm:w-auto" render={<Link href="/admin/orders" />} nativeButton={false}>
          Review Orders
        </Button>
        <Button size="sm" className="admin-dashboard-button admin-dashboard-button-primary w-auto sm:w-auto" render={<Link href="/admin/products/add" />} nativeButton={false}>
          Add New Product
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>

      <section className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          const item = stats[index];

          return (
            <Card key={stat.title} className="admin-dashboard-stat surface-card border-border/70">
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="admin-dashboard-value text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <div className="admin-dashboard-stat-icon flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground">
                  <Icon />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 md:hidden">
        <Card className="admin-dashboard-panel surface-card order-2 border-border/70 md:order-1">
          <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="admin-dashboard-heading flex items-center gap-2 text-lg text-foreground">
              <Inbox className="text-foreground" />
              Recent orders
            </CardTitle>
            <Button variant="outline" size="sm" className="admin-dashboard-button w-full sm:w-auto" render={<Link href="/admin/orders" />} nativeButton={false}>
              View all
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order._id} className="admin-dashboard-item rounded-[1.1rem] border border-border/70 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.orderId}</p>
                    </div>
                    <Badge variant="outline" className="admin-dashboard-badge">{order.status}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="admin-dashboard-value text-sm font-semibold text-foreground">{formatMoney(order.totalAmount)}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard-empty admin-dashboard-well flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <Card className="admin-dashboard-panel surface-card border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="admin-dashboard-heading flex items-center gap-2 text-lg text-foreground">
              <TrendingUp className="text-foreground" />
              Revenue momentum
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {trend.last7DaysRevenue.map((entry) => (
              <div key={entry.label} className="grid gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3">
                <div className="flex items-center justify-between gap-3 sm:contents">
                  <span className="w-10 text-sm font-medium text-foreground">{entry.label}</span>
                  <div className="flex items-center gap-3 sm:hidden">
                    <span className="admin-dashboard-value text-sm font-semibold text-foreground">{formatMoney(entry.revenue)}</span>
                    <span className="text-[11px] text-muted-foreground">{entry.orders}</span>
                  </div>
                </div>
                <div className="admin-dashboard-meter-track h-3 overflow-hidden rounded-full">
                  <div
                    className="admin-dashboard-meter-fill h-full rounded-full"
                    style={{ width: `${Math.max(8, Math.round((entry.revenue / maxRevenueDay) * 100))}%` }}
                  />
                </div>
                <div className="hidden min-w-[110px] flex-col items-end sm:flex">
                  <span className="admin-dashboard-value text-sm font-semibold text-foreground">{formatMoney(entry.revenue)}</span>
                  <span className="text-[11px] text-muted-foreground">{entry.orders} orders</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="admin-dashboard-panel surface-card border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="admin-dashboard-heading flex items-center gap-2 text-lg text-foreground">
              <Clock3 className="text-foreground" />
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="admin-dashboard-watchitem rounded-[1.1rem] border border-border/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="admin-dashboard-value text-sm font-medium text-foreground">Pending orders</span>
                <Badge variant="outline" className="admin-dashboard-watchbadge">{summary.pendingOrders}</Badge>
              </div>
            </div>
            <div className="admin-dashboard-watchitem rounded-[1.1rem] border border-border/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="admin-dashboard-value text-sm font-medium text-foreground">Hidden products</span>
                <Badge variant="outline" className="admin-dashboard-watchbadge">{summary.lowStockProducts}</Badge>
              </div>
            </div>
            <div className="admin-dashboard-watchitem rounded-[1.1rem] border border-border/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="admin-dashboard-value text-sm font-medium text-foreground">Average order</span>
                <Badge variant="outline" className="admin-dashboard-watchbadge">{formatMoney(summary.averageOrderValue)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="admin-dashboard-panel surface-card hidden border-border/70 md:block xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="admin-dashboard-heading flex items-center gap-2 text-lg text-foreground">
              <Inbox className="text-foreground" />
              Order status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {statusBreakdown.length ? (
              statusBreakdown.map((entry) => (
                <div key={entry.status} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{entry.status}</span>
                    <span className="text-xs text-muted-foreground">{entry.count}</span>
                  </div>
                  <div className="admin-dashboard-meter-track h-2 overflow-hidden rounded-full">
                    <div className="admin-dashboard-meter-fill h-full rounded-full" style={{ width: `${Math.max(10, Math.round(entry.share * 100))}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard-empty admin-dashboard-well flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="admin-dashboard-panel surface-card hidden border-border/70 md:block xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="admin-dashboard-heading flex items-center gap-2 text-lg text-foreground">
              <Package2 className="text-foreground" />
              Top moving products
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topProducts.length ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="admin-dashboard-item rounded-[1.1rem] border border-border/70 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="admin-dashboard-rank admin-dashboard-value flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.unitsSold} sold</p>
                      </div>
                    </div>
                    <p className="admin-dashboard-value text-sm font-semibold text-foreground">{formatMoney(product.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard-empty admin-dashboard-well flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No product sales yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="admin-dashboard-panel surface-card hidden border-border/70 md:block xl:col-span-1">
          <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="admin-dashboard-heading flex items-center gap-2 text-lg text-foreground">
              <Inbox className="text-foreground" />
              Recent orders
            </CardTitle>
            <Button variant="outline" size="sm" className="admin-dashboard-button w-full sm:w-auto" render={<Link href="/admin/orders" />} nativeButton={false}>
              View all
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order._id} className="admin-dashboard-item rounded-[1.1rem] border border-border/70 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.orderId}</p>
                    </div>
                    <Badge variant="outline" className="admin-dashboard-badge">{order.status}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="admin-dashboard-value text-sm font-semibold text-foreground">{formatMoney(order.totalAmount)}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-dashboard-empty admin-dashboard-well flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border text-center">
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

    </div>
  );
}

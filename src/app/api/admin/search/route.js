import { NextResponse } from 'next/server';

import { ADMIN_PERMISSION, hasAdminPermission } from '@/lib/adminAccess';
import { getAdminAccess } from '@/lib/requireAdmin';
import mongooseConnect from '@/lib/mongooseConnect';
import Category from '@/models/Category';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Review from '@/models/Review';
import User from '@/models/User';

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createLinkItem({ id, title, subtitle, href, group }) {
  return { id, title, subtitle, href, group };
}

const STATIC_LINKS = [
  { title: 'Dashboard', subtitle: 'Store overview', href: '/admin', group: 'Pages', permission: ADMIN_PERMISSION.DASHBOARD_VIEW },
  { title: 'Products', subtitle: 'Manage catalog items', href: '/admin/products', group: 'Pages', permission: ADMIN_PERMISSION.PRODUCTS_VIEW },
  { title: 'Add Product', subtitle: 'Create a new product', href: '/admin/products/add', group: 'Pages', permission: ADMIN_PERMISSION.PRODUCTS_CREATE },
  { title: 'Orders', subtitle: 'Review customer orders', href: '/admin/orders', group: 'Pages', permission: ADMIN_PERMISSION.ORDERS_VIEW },
  { title: 'Users', subtitle: 'Customers and account records', href: '/admin/users', group: 'Pages', permission: ADMIN_PERMISSION.USERS_VIEW },
  { title: 'Reviews', subtitle: 'Moderate product reviews', href: '/admin/reviews', group: 'Pages', permission: ADMIN_PERMISSION.REVIEWS_VIEW },
  { title: 'Categories', subtitle: 'Organize product groups', href: '/admin/categories', group: 'Pages', permission: ADMIN_PERMISSION.CATEGORIES_VIEW },
  { title: 'Shipping', subtitle: 'Delivery settings', href: '/admin/shipping', group: 'Pages', permission: ADMIN_PERMISSION.SHIPPING_VIEW },
  { title: 'Cover Photos', subtitle: 'Homepage media', href: '/admin/cover-photos', group: 'Pages', permission: ADMIN_PERMISSION.COVER_PHOTOS_VIEW },
  { title: 'Settings', subtitle: 'Store configuration', href: '/admin/settings', group: 'Pages', permission: ADMIN_PERMISSION.SETTINGS_VIEW },
];

export async function GET(request) {
  try {
    const access = await getAdminAccess();
    if (!access.ok) {
      return NextResponse.json({ success: false, message: 'Unauthorized Access' }, { status: access.status });
    }

    const query = String(new URL(request.url).searchParams.get('q') || '').trim();
    if (!query) {
      const pageLinks = STATIC_LINKS
        .filter((item) => !item.permission || hasAdminPermission(access.role, item.permission))
        .slice(0, 7)
        .map((item) =>
          createLinkItem({
            id: `page-${item.href}`,
            title: item.title,
            subtitle: item.subtitle,
            href: item.href,
            group: item.group,
          })
        );

      return NextResponse.json({ success: true, items: pageLinks });
    }

    const queryRegex = new RegExp(escapeRegex(query), 'i');

    await mongooseConnect();

    const searches = [];

    if (hasAdminPermission(access.role, ADMIN_PERMISSION.PRODUCTS_VIEW)) {
      searches.push(
        Product.find({ $or: [{ Name: queryRegex }, { slug: queryRegex }] }, '_id Name slug Price StockStatus')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .then((items) =>
            items.map((product) =>
              createLinkItem({
                id: `product-${product._id}`,
                title: product.Name,
                subtitle: `${product.StockStatus || 'Unknown'} • Rs. ${Number(product.Price || 0).toLocaleString('en-PK')}`,
                href: `/admin/products/edit/${product._id}`,
                group: 'Products',
              })
            )
          )
      );
    }

    if (hasAdminPermission(access.role, ADMIN_PERMISSION.ORDERS_VIEW)) {
      searches.push(
        Order.find({ $or: [{ orderId: queryRegex }, { customerName: queryRegex }, { customerPhone: queryRegex }] }, '_id orderId customerName totalAmount status')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .then((items) =>
            items.map((order) =>
              createLinkItem({
                id: `order-${order._id}`,
                title: order.orderId,
                subtitle: `${order.customerName} • ${order.status} • Rs. ${Number(order.totalAmount || 0).toLocaleString('en-PK')}`,
                href: `/admin/orders/${order._id}`,
                group: 'Orders',
              })
            )
          )
      );
    }

    if (hasAdminPermission(access.role, ADMIN_PERMISSION.USERS_VIEW)) {
      searches.push(
        User.find({ $or: [{ name: queryRegex }, { email: queryRegex }, { phone: queryRegex }] }, '_id name email phone')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .then((items) =>
            items.map((user) =>
              createLinkItem({
                id: `user-${user._id}`,
                title: user.name || 'User',
                subtitle: user.email || user.phone || 'Customer record',
                href: `/admin/users?id=${user._id}`,
                group: 'Users',
              })
            )
          )
      );
    }

    if (hasAdminPermission(access.role, ADMIN_PERMISSION.REVIEWS_VIEW)) {
      searches.push(
        Review.find({ $or: [{ userName: queryRegex }, { comment: queryRegex }] }, '_id userName rating comment')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
          .then((items) =>
            items.map((review) =>
              createLinkItem({
                id: `review-${review._id}`,
                title: review.userName || 'Review',
                subtitle: `Rating ${review.rating}/5${review.comment ? ` • ${review.comment.slice(0, 50)}` : ''}`,
                href: `/admin/reviews?id=${review._id}`,
                group: 'Reviews',
              })
            )
          )
      );
    }

    if (hasAdminPermission(access.role, ADMIN_PERMISSION.CATEGORIES_VIEW)) {
      searches.push(
        Category.find({ $or: [{ name: queryRegex }, { slug: queryRegex }] }, '_id name slug')
          .sort({ name: 1 })
          .limit(5)
          .lean()
          .then((items) =>
            items.map((category) =>
              createLinkItem({
                id: `category-${category._id}`,
                title: category.name,
                subtitle: category.slug || 'Category',
                href: `/admin/categories`,
                group: 'Categories',
              })
            )
          )
      );
    }

    const pageLinks = STATIC_LINKS
      .filter((item) => !item.permission || hasAdminPermission(access.role, item.permission))
      .filter((item) => queryRegex.test(item.title) || queryRegex.test(item.subtitle))
      .slice(0, 6)
      .map((item) =>
        createLinkItem({
          id: `page-${item.href}`,
          title: item.title,
          subtitle: item.subtitle,
          href: item.href,
          group: item.group,
        })
      );

    const dynamicGroups = await Promise.all(searches);
    const items = [...pageLinks, ...dynamicGroups.flat()].slice(0, 20);

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json({ success: false, message: 'Search failed' }, { status: 500 });
  }
}

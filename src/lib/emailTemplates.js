import 'server-only';

const STORE_NAME = 'Aam Samaan';
const SITE_URL = process.env.NEXTAUTH_URL || 'https://Aam-Samaan-items.vercel.app';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function addressText(order) {
  return [order.customerAddress, order.customerCity, order.landmark]
    .filter(Boolean)
    .join(', ');
}

function renderItemsTable(order) {
  const rows = (order.items || [])
    .map((item) => {
      const name = escapeHtml(item.name || item.Name || 'Product');
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const total = quantity * price;

      return `
        <tr>
          <td style="padding:10px 12px;border:1px solid #d4d4d4;text-align:left;">${name}</td>
          <td style="padding:10px 12px;border:1px solid #d4d4d4;text-align:center;">${quantity}</td>
          <td style="padding:10px 12px;border:1px solid #d4d4d4;text-align:right;">${formatCurrency(price)}</td>
          <td style="padding:10px 12px;border:1px solid #d4d4d4;text-align:right;">${formatCurrency(total)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr>
          <th style="padding:10px 12px;border:1px solid #d4d4d4;text-align:left;background:#f5f5f5;">Product</th>
          <th style="padding:10px 12px;border:1px solid #d4d4d4;text-align:center;background:#f5f5f5;">Qty</th>
          <th style="padding:10px 12px;border:1px solid #d4d4d4;text-align:right;background:#f5f5f5;">Unit Price</th>
          <th style="padding:10px 12px;border:1px solid #d4d4d4;text-align:right;background:#f5f5f5;">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr>
          <td colspan="3" style="padding:12px;border:1px solid #d4d4d4;text-align:right;font-weight:700;">Total</td>
          <td style="padding:12px;border:1px solid #d4d4d4;text-align:right;font-weight:700;">${formatCurrency(order.totalAmount)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function renderEmail({ title, intro, details, extra, actionHref, actionLabel, footer }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:24px;background:#f7f7f7;font-family:Arial,Helvetica,sans-serif;color:#111111;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #d4d4d4;">
          <tr>
            <td style="padding:24px 24px 12px;border-bottom:1px solid #d4d4d4;">
              <h1 style="margin:0;font-size:24px;line-height:1.3;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:14px;line-height:1.7;">${escapeHtml(intro)}</p>
              ${details}
              ${extra || ''}
              ${
                actionHref && actionLabel
                  ? `
                    <p style="margin:20px 0 0;">
                      <a href="${actionHref}" style="display:inline-block;padding:12px 18px;border:1px solid #111111;color:#111111;text-decoration:none;font-size:14px;font-weight:700;">
                        ${escapeHtml(actionLabel)}
                      </a>
                    </p>
                  `
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;border-top:1px solid #d4d4d4;background:#fafafa;font-size:12px;line-height:1.7;color:#525252;">
              <strong>${STORE_NAME}</strong><br />
              ${escapeHtml(footer)}
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function generateOrderEmailHtml(order) {
  const adminUrl = `${SITE_URL}/admin/orders`;
  const details = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 16px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Placed On:</strong> ${escapeHtml(formatDateTime(order.createdAt))}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Customer:</strong> ${escapeHtml(order.customerName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Phone:</strong> ${escapeHtml(order.customerPhone || 'N/A')}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Address:</strong> ${escapeHtml(addressText(order) || 'N/A')}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Payment:</strong> ${escapeHtml(order.paymentStatus || 'COD')}</td>
      </tr>
    </table>
    ${renderItemsTable(order)}
  `;

  const extra = order.notes
    ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.7;"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>`
    : '';

  return renderEmail({
    title: `New Order ${order.orderId}`,
    intro: `${order.customerName} placed a new order.`,
    details,
    extra,
    actionHref: adminUrl,
    actionLabel: 'Open Orders',
    footer: 'Automated order notification.',
  });
}

export function generateCustomerOrderConfirmationHtml(order) {
  const myOrderUrl = `${SITE_URL}/orders/${order._id}?token=${order.secureToken}`;
  const details = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 16px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Order Date:</strong> ${escapeHtml(formatDateTime(order.createdAt))}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Recipient:</strong> ${escapeHtml(order.customerName)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Phone:</strong> ${escapeHtml(order.customerPhone || 'N/A')}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;"><strong>Address:</strong> ${escapeHtml(addressText(order) || 'N/A')}</td>
      </tr>
    </table>
    ${renderItemsTable(order)}
  `;

  return renderEmail({
    title: `Order Confirmation ${order.orderId}`,
    intro: `Thank you for your order. We have received it and will process it shortly.`,
    details,
    actionHref: myOrderUrl,
    actionLabel: 'View Order',
    footer: 'You received this email because an order was placed on the store.',
  });
}

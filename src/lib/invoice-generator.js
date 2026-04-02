const STORE_NAME = 'Aam Samaan';

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
}

export const generateInvoice = async (order) => {
  const { jsPDF } = await import('jspdf');
  const autoTableImport = await import('jspdf-autotable');
  const autoTable = autoTableImport.default || autoTableImport;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(STORE_NAME, margin, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Invoice', pageWidth - margin, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Order ID: ${order.orderId}`, margin, 32);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-PK')}`, margin, 38);

  doc.setFont('helvetica', 'bold');
  doc.text('Bill To', margin, 52);

  doc.setFont('helvetica', 'normal');
  doc.text(String(order.customerName || 'Customer'), margin, 59);
  doc.text(`Phone: ${String(order.customerPhone || 'N/A')}`, margin, 65);

  const addressParts = [order.customerAddress, order.customerCity, order.landmark].filter(Boolean);
  const addressLines = doc.splitTextToSize(addressParts.join(', ') || 'N/A', 80);
  doc.text(addressLines, margin, 71);

  doc.setFont('helvetica', 'bold');
  doc.text('Order Info', 118, 52);

  doc.setFont('helvetica', 'normal');
  doc.text(`Payment: ${order.paymentMethod || order.paymentStatus || 'COD'}`, 118, 59);
  doc.text(`Status: ${order.status || 'Confirmed'}`, 118, 65);

  const tableData = (order.items || []).map((item) => [
    String(item.name || item.Name || 'Product'),
    String(item.quantity || 1),
    formatCurrency(item.price || 0),
    formatCurrency(Number(item.price || 0) * Number(item.quantity || 1)),
  ]);

  autoTable(doc, {
    startY: 88,
    margin: { left: margin, right: margin },
    head: [['Product', 'Qty', 'Unit Price', 'Line Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineColor: [180, 180, 180],
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineColor: [200, 200, 200],
    },
    styles: {
      fontSize: 9.5,
      cellPadding: 4,
    },
    columnStyles: {
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 34 },
      3: { halign: 'right', cellWidth: 36 },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total', pageWidth - margin - 36, finalY);
  doc.text(formatCurrency(order.totalAmount), pageWidth - margin, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Thank you for your order.', margin, 280);

  doc.save(`Invoice_${order.orderId}.pdf`);
};

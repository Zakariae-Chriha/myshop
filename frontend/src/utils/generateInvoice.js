import { jsPDF } from 'jspdf';

export const generateInvoice = (order) => {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const W    = 210;
  const gray = [71, 85, 105];
  const dark = [15, 23, 42];

  // ── Header bar ──────────────────────────────────────────────────────────────
  doc.setFillColor(108, 99, 255);
  doc.rect(0, 0, W, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('ZC Brands', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Selected German Quality', 14, 18);
  doc.text('support@zcbrands.de', 14, 23);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', W - 14, 17, { align: 'right' });

  // ── Invoice meta ─────────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  const metaX = W - 14;
  let metaY   = 36;
  const orderNum  = order.orderNumber || order._id || 'N/A';
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('de-DE')
    : new Date().toLocaleDateString('de-DE');

  doc.text(`Invoice No: ${orderNum}`, metaX, metaY, { align: 'right' }); metaY += 5;
  doc.text(`Date: ${orderDate}`, metaX, metaY, { align: 'right' });

  // ── Bill To ───────────────────────────────────────────────────────────────────
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILL TO', 14, 36);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  const addr = order.shippingAddress || {};
  const lines = [
    addr.fullName || order.customer?.name || 'Customer',
    addr.street || '',
    [addr.zip, addr.city].filter(Boolean).join(' '),
    addr.country || 'Germany',
    addr.phone   || '',
  ].filter(Boolean);

  let addrY = 42;
  lines.forEach(l => { doc.text(l, 14, addrY); addrY += 5; });

  // ── Payment ───────────────────────────────────────────────────────────────────
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT METHOD', 80, 36);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  const pmLabel = order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card (Stripe)';
  doc.text(pmLabel, 80, 42);
  doc.text(`Status: ${order.paymentStatus || 'pending'}`, 80, 47);

  // ── Table ────────────────────────────────────────────────────────────────────
  const tableY = Math.max(addrY, 54) + 6;

  // Header row
  doc.setFillColor(15, 23, 42);
  doc.rect(14, tableY, W - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(165, 180, 252);
  doc.text('PRODUCT', 18, tableY + 5.5);
  doc.text('QTY',    120, tableY + 5.5, { align: 'right' });
  doc.text('UNIT (€)', 148, tableY + 5.5, { align: 'right' });
  doc.text('TOTAL (€)', W - 16, tableY + 5.5, { align: 'right' });

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...dark);
  let rowY = tableY + 8;
  const items = order.items || [];

  items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, rowY, W - 28, 7, 'F');
    }
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text(String(item.name || '').substring(0, 50), 18, rowY + 5);
    doc.setTextColor(...gray);
    doc.text(String(item.quantity),                    120, rowY + 5, { align: 'right' });
    doc.text((item.priceWithVAT || item.price || 0).toFixed(2), 148, rowY + 5, { align: 'right' });
    doc.text(((item.priceWithVAT || item.price || 0) * item.quantity).toFixed(2), W - 16, rowY + 5, { align: 'right' });
    rowY += 7;
  });

  // ── Totals ───────────────────────────────────────────────────────────────────
  rowY += 4;
  const totalsX = W - 16;
  const labelX  = W - 60;

  doc.setDrawColor(226, 232, 240);
  doc.line(labelX, rowY, W - 14, rowY);
  rowY += 5;

  const addRow = (label, value, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 8.5);
    doc.setTextColor(...(bold ? dark : gray));
    doc.text(label, labelX, rowY);
    doc.text(value, totalsX, rowY, { align: 'right' });
    rowY += bold ? 7 : 5.5;
  };

  const subtotalNet = order.subtotal ?? ((order.total || 0) / 1.19);
  const vat         = order.vatAmount ?? (subtotalNet * 0.19);

  if (order.discount > 0) addRow(`Discount`, `-€${(order.discount || 0).toFixed(2)}`);
  addRow('Subtotal (net)', `€${subtotalNet.toFixed(2)}`);
  addRow('VAT 19% (MwSt.)', `€${vat.toFixed(2)}`);
  doc.setDrawColor(108, 99, 255);
  doc.line(labelX, rowY - 1, W - 14, rowY - 1);
  addRow('TOTAL', `€${(order.total || 0).toFixed(2)}`, true);

  // ── Footer ────────────────────────────────────────────────────────────────────
  const footerY = 275;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, W - 14, footerY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text('ZC Brands GmbH · Germany · VAT ID: DE000000000 · support@zcbrands.de', W / 2, footerY + 5, { align: 'center' });
  doc.text('Thank you for your order!', W / 2, footerY + 10, { align: 'center' });

  doc.save(`Invoice-${orderNum}.pdf`);
};

/**
 * Professional HTML email templates.
 * Each function returns a complete HTML string ready to send via n8n.
 */

const BRAND_COLOR  = '#6C63FF';
const BRAND_NAME   = 'DigitalShop';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@digitalshop.de';

const baseWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0A0A14;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A14;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;border:1px solid rgba(108,99,255,0.3);border-bottom:none;">
            <div style="font-size:24px;font-weight:900;background:linear-gradient(135deg,#6C63FF,#FF6584);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px;">
              ${BRAND_NAME}
            </div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#0F0F23;border:1px solid rgba(108,99,255,0.2);border-top:none;border-bottom:none;padding:40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0A0A14;border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="color:#334155;font-size:12px;margin:0 0 6px;">
              © ${new Date().getFullYear()} ${BRAND_NAME} · Germany
            </p>
            <p style="color:#1e2a3a;font-size:11px;margin:0;">
              Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#475569;">${SUPPORT_EMAIL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Divider ─────────────────────────────────────────────────────────────────
const divider = `<tr><td style="padding:0;height:1px;background:rgba(255,255,255,0.06);display:block;margin:24px 0;"></td></tr>`;

// ─── Item row ─────────────────────────────────────────────────────────────────
const itemRow = (name, qty, price) => `
<tr>
  <td style="padding:8px 0;color:#94A3B8;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.04);">
    ${name} <span style="color:#475569;">×${qty}</span>
  </td>
  <td style="padding:8px 0;color:#A5B4FC;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">
    €${Number(price).toFixed(2)}
  </td>
</tr>`;

// ─── 1. Order Confirmed ──────────────────────────────────────────────────────
const orderConfirmed = ({ customerName, orderNumber, items = [], subtotal, vatAmount, total, paymentMethod }) =>
  baseWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h1 style="color:#F1F5F9;font-size:24px;font-weight:800;margin:0 0 8px;">Order Confirmed!</h1>
      <p style="color:#64748B;font-size:15px;margin:0;">Thank you, ${customerName}. We received your order.</p>
    </div>

    <div style="background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.2);border-radius:12px;padding:16px 20px;margin-bottom:28px;text-align:center;">
      <p style="color:#475569;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">Order Number</p>
      <p style="color:#A5B4FC;font-size:22px;font-weight:900;margin:0;font-family:monospace;">${orderNumber}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${items.map(i => itemRow(i.name, i.quantity, i.price * i.quantity)).join('')}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#475569;font-size:13px;padding:4px 0;">Subtotal (net)</td>
        <td style="color:#64748B;font-size:13px;text-align:right;padding:4px 0;">€${Number(subtotal).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="color:#475569;font-size:13px;padding:4px 0;">VAT (19%)</td>
        <td style="color:#64748B;font-size:13px;text-align:right;padding:4px 0;">€${Number(vatAmount).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="color:#F1F5F9;font-size:16px;font-weight:800;padding:12px 0 4px;border-top:1px solid rgba(255,255,255,0.08);">Total</td>
        <td style="color:#A5B4FC;font-size:20px;font-weight:900;text-align:right;padding:12px 0 4px;border-top:1px solid rgba(255,255,255,0.08);">€${Number(total).toFixed(2)}</td>
      </tr>
    </table>

    <p style="color:#475569;font-size:12px;margin:4px 0 28px;text-align:right;">incl. 19% MwSt.</p>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px 18px;margin-bottom:28px;">
      <p style="color:#475569;font-size:12px;margin:0 0 4px;">Payment method</p>
      <p style="color:#94A3B8;font-size:14px;font-weight:600;margin:0;">${paymentMethod === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Card (Stripe)'}</p>
    </div>

    <p style="color:#475569;font-size:13px;text-align:center;margin:0;">
      We will notify you once your order ships. Questions? Reply to this email.
    </p>
  `);

// ─── 2. Order Shipped ────────────────────────────────────────────────────────
const orderShipped = ({ customerName, orderNumber, trackingNumber, trackingCarrier, confirmLink }) =>
  baseWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:12px;">📦</div>
      <h1 style="color:#F1F5F9;font-size:24px;font-weight:800;margin:0 0 8px;">Your order is on its way!</h1>
      <p style="color:#64748B;font-size:15px;margin:0;">Hi ${customerName}, your order has been shipped.</p>
    </div>

    <div style="background:rgba(108,99,255,0.08);border:1px solid rgba(108,99,255,0.2);border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="color:#475569;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">Order Number</p>
      <p style="color:#A5B4FC;font-size:20px;font-weight:900;margin:0;font-family:monospace;">${orderNumber}</p>
    </div>

    ${trackingNumber ? `
    <div style="background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.2);border-radius:10px;padding:16px 20px;margin-bottom:28px;">
      <p style="color:#475569;font-size:12px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">Tracking Information</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#64748B;font-size:13px;">Carrier</td>
          <td style="color:#6EE7B7;font-size:14px;font-weight:700;text-align:right;">${trackingCarrier}</td>
        </tr>
        <tr>
          <td style="color:#64748B;font-size:13px;padding-top:6px;">Tracking #</td>
          <td style="color:#6EE7B7;font-size:14px;font-weight:700;text-align:right;padding-top:6px;font-family:monospace;">${trackingNumber}</td>
        </tr>
      </table>
    </div>
    ` : ''}

    ${confirmLink ? `
    <div style="text-align:center;margin-bottom:28px;">
      <p style="color:#64748B;font-size:13px;margin:0 0 16px;">Once you receive your package, please confirm delivery:</p>
      <a href="${confirmLink}" style="display:inline-block;background:linear-gradient(135deg,#6C63FF,#8B5CF6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;">
        ✓ Confirm Delivery
      </a>
      <p style="color:#1e2a3a;font-size:11px;margin:12px 0 0;">
        Or copy this link: <span style="color:#334155;">${confirmLink}</span>
      </p>
    </div>
    ` : ''}

    <p style="color:#475569;font-size:13px;text-align:center;margin:0;">
      Delivery usually takes 2–5 business days. Thank you for shopping with us!
    </p>
  `);

// ─── 3. Order Delivered ──────────────────────────────────────────────────────
const orderDelivered = ({ customerName, orderNumber, total, paymentMethod }) =>
  baseWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="color:#F1F5F9;font-size:24px;font-weight:800;margin:0 0 8px;">Order Delivered!</h1>
      <p style="color:#64748B;font-size:15px;margin:0;">Hi ${customerName}, your order has been delivered.</p>
    </div>

    <div style="background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;">
      <p style="color:#475569;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.08em;">Order</p>
      <p style="color:#34D399;font-size:22px;font-weight:900;margin:0 0 8px;font-family:monospace;">${orderNumber}</p>
      <p style="color:#6EE7B7;font-size:18px;font-weight:800;margin:0;">€${Number(total).toFixed(2)}</p>
      ${paymentMethod === 'cash_on_delivery' ? '<p style="color:#475569;font-size:12px;margin:6px 0 0;">Payment recorded — Cash on Delivery</p>' : ''}
    </div>

    <p style="color:#64748B;font-size:14px;text-align:center;margin:0 0 20px;">
      We hope you love your purchase! If you have any issues, please contact us.
    </p>

    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3005'}/shop" style="display:inline-block;background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.3);color:#A5B4FC;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        Shop Again →
      </a>
    </div>
  `);

// ─── 4. Password Reset ───────────────────────────────────────────────────────
const passwordReset = ({ customerName, resetLink }) =>
  baseWrapper(`
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:12px;">🔐</div>
      <h1 style="color:#F1F5F9;font-size:24px;font-weight:800;margin:0 0 8px;">Reset Your Password</h1>
      <p style="color:#64748B;font-size:15px;margin:0;">Hi ${customerName}, we received a password reset request.</p>
    </div>

    <p style="color:#64748B;font-size:14px;text-align:center;margin:0 0 28px;">
      Click the button below to set a new password. This link expires in <strong style="color:#94A3B8;">1 hour</strong>.
    </p>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6C63FF,#8B5CF6);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;">
        Reset Password
      </a>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px;margin-bottom:20px;">
      <p style="color:#334155;font-size:12px;margin:0 0 6px;">Or copy this link into your browser:</p>
      <p style="color:#475569;font-size:11px;margin:0;word-break:break-all;">${resetLink}</p>
    </div>

    <p style="color:#334155;font-size:12px;text-align:center;margin:0;">
      If you did not request this, please ignore this email. Your password will not change.
    </p>
  `);

// ─── 5. Low Stock Alert (admin) ──────────────────────────────────────────────
const lowStockAlert = ({ productName, currentStock, threshold, productId }) =>
  baseWrapper(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
      <h1 style="color:#FCD34D;font-size:22px;font-weight:800;margin:0 0 8px;">Low Stock Alert</h1>
      <p style="color:#64748B;font-size:14px;margin:0;">A product is running low and needs restocking.</p>
    </div>

    <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="color:#94A3B8;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Product</p>
      <p style="color:#F1F5F9;font-size:18px;font-weight:700;margin:0 0 16px;">${productName}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#64748B;font-size:13px;">Current Stock</td>
          <td style="color:#FCA5A5;font-size:16px;font-weight:800;text-align:right;">${currentStock} units</td>
        </tr>
        <tr>
          <td style="color:#64748B;font-size:13px;padding-top:8px;">Alert Threshold</td>
          <td style="color:#475569;font-size:14px;font-weight:600;text-align:right;padding-top:8px;">${threshold} units</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3005'}/admin/products" style="display:inline-block;background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.3);color:#FCD34D;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        Update Stock →
      </a>
    </div>
  `);

module.exports = { orderConfirmed, orderShipped, orderDelivered, passwordReset, lowStockAlert };

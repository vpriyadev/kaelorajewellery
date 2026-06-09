import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { serviceDb } from '../../../lib/firebase';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
console.log('[send-email] RESEND_API_KEY exists:', !!RESEND_API_KEY);
// TODO: Replace onboarding@resend.dev with orders@kaelora.com after domain verification.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KAELORA <onboarding@resend.dev>';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ─── Shared email wrapper ─────────────────────────────────────────
function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>KAELORA</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EA;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EA;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1A1A1A 0%,#2D2016 100%);padding:36px 40px;text-align:center;">
            <div style="display:inline-block;border:1px solid #D4AF37;padding:4px 20px;margin-bottom:12px;">
              <span style="color:#D4AF37;font-size:9px;letter-spacing:4px;text-transform:uppercase;font-family:sans-serif;">Est. 2024</span>
            </div>
            <h1 style="color:#D4AF37;font-size:28px;margin:0;letter-spacing:6px;text-transform:uppercase;font-weight:400;">KAELORA</h1>
            <p style="color:#EDE6DA;font-size:10px;letter-spacing:3px;margin:6px 0 0;text-transform:uppercase;font-family:sans-serif;">Luxury Jewellery</p>
          </td>
        </tr>
        <!-- Decorative bar -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#EDE6DA,#D4AF37,#EDE6DA);"></td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F8F5F0;padding:28px 40px;border-top:1px solid #EDE6DA;text-align:center;">
            <p style="color:#999;font-size:11px;margin:0 0 8px;font-family:sans-serif;">KAELORA Jewellery &nbsp;|&nbsp; India</p>
            <p style="color:#bbb;font-size:10px;margin:0;font-family:sans-serif;">
              Questions? Reply to this email or WhatsApp us at +91 6305517109
            </p>
            <div style="margin-top:16px;">
              <span style="display:inline-block;width:20px;height:1px;background:#D4AF37;"></span>
              <span style="display:inline-block;width:6px;height:6px;background:#D4AF37;border-radius:50%;margin:0 6px;vertical-align:middle;"></span>
              <span style="display:inline-block;width:20px;height:1px;background:#D4AF37;"></span>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Success email template ────────────────────────────────────────
function buildSuccessTemplate(data: {
  customerName: string;
  orderId: string;
  amountPaid: number;
  products: { productName?: string; name?: string; quantity: number }[];
  shippingAddress: any;
  estimatedDeliveryDate?: string;
}) {
  const { customerName, orderId, amountPaid, products, shippingAddress, estimatedDeliveryDate } = data;

  const productRows = products
    .map(
      (p) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;color:#1A1A1A;font-size:13px;">${p.productName || p.name || 'Item'}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F0EBE3;color:#888;font-size:13px;text-align:right;">Qty: ${p.quantity}</td>
      </tr>`
    )
    .join('');

  const addr = shippingAddress
    ? `${shippingAddress.fullName}<br>${shippingAddress.phone}<br>${shippingAddress.addressLine1 || shippingAddress.addressLine || ''}<br>${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`
    : 'Address not provided';

  const delivery = estimatedDeliveryDate || 'Standard 5–7 business days';

  const content = `
    <!-- Success icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#F0FDF4;border:2px solid #86EFAC;line-height:56px;font-size:26px;">✓</div>
    </div>

    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D4AF37;text-align:center;margin:0 0 8px;font-family:sans-serif;">Order Confirmed</p>
    <h2 style="font-size:22px;color:#1A1A1A;text-align:center;margin:0 0 6px;font-weight:400;letter-spacing:2px;">Thank you, ${customerName}!</h2>
    <p style="color:#888;font-size:13px;text-align:center;margin:0 0 32px;font-family:sans-serif;">Your order has been received and is being prepared with care.</p>

    <!-- Order ID banner -->
    <div style="background:#1A1A1A;border-radius:8px;padding:14px 20px;margin-bottom:28px;text-align:center;">
      <span style="color:#EDE6DA;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:sans-serif;">Order ID</span><br>
      <span style="color:#D4AF37;font-size:16px;letter-spacing:2px;font-family:monospace;">#${orderId}</span>
    </div>

    <!-- Products table -->
    <h3 style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 12px;font-family:sans-serif;">Items Ordered</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${productRows}
      <tr>
        <td style="padding:14px 0 0;font-size:14px;font-weight:bold;color:#1A1A1A;">Total Paid</td>
        <td style="padding:14px 0 0;font-size:16px;font-weight:bold;color:#D4AF37;text-align:right;">₹${amountPaid.toLocaleString('en-IN')}</td>
      </tr>
    </table>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #EDE6DA;margin:24px 0;"/>

    <!-- Shipping & delivery in two columns -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:16px;">
          <h3 style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 10px;font-family:sans-serif;">Shipping To</h3>
          <p style="color:#1A1A1A;font-size:13px;line-height:1.7;margin:0;">${addr}</p>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:16px;border-left:1px solid #EDE6DA;">
          <h3 style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin:0 0 10px;font-family:sans-serif;">Est. Delivery</h3>
          <p style="color:#1A1A1A;font-size:13px;line-height:1.7;margin:0 0 6px;">${delivery}</p>
          <p style="color:#888;font-size:11px;margin:0;font-family:sans-serif;">Via Express Courier</p>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-top:36px;">
      <a href="https://kaelora.in/account" style="display:inline-block;background:#1A1A1A;color:#EDE6DA;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;border-radius:6px;font-family:sans-serif;">Track My Order</a>
    </div>
  `;

  return emailWrapper(content);
}

// ─── Failed email template ─────────────────────────────────────────
function buildCancelledTemplate(data: { customerName: string }) {
  const { customerName } = data;
  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#FFF1F2;border:2px solid #FECACA;line-height:56px;font-size:26px;">✕</div>
    </div>
    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#EF4444;text-align:center;margin:0 0 8px;font-family:sans-serif;">Payment Cancelled</p>
    <h2 style="font-size:22px;color:#1A1A1A;text-align:center;margin:0 0 6px;font-weight:400;letter-spacing:2px;">Hi ${customerName},</h2>
    <p style="color:#888;font-size:13px;text-align:center;margin:0 0 32px;font-family:sans-serif;">
      You closed the payment window before completing payment. No order has been created. You may return and complete your purchase anytime.
    </p>
  `;

  return emailWrapper(content);
}

function buildFailedTemplate(data: {
  customerName: string;
  amountPaid: number;
}) {
  const { customerName, amountPaid } = data;

  const content = `
    <!-- Failed icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#FFF1F2;border:2px solid #FECACA;line-height:56px;font-size:26px;">✕</div>
    </div>

    <p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#EF4444;text-align:center;margin:0 0 8px;font-family:sans-serif;">Payment Not Completed</p>
    <h2 style="font-size:22px;color:#1A1A1A;text-align:center;margin:0 0 6px;font-weight:400;letter-spacing:2px;">Hi ${customerName},</h2>
    <p style="color:#888;font-size:13px;text-align:center;margin:0 0 32px;font-family:sans-serif;">Your payment of <strong style="color:#1A1A1A;">₹${amountPaid.toLocaleString('en-IN')}</strong> was not completed. No order has been created.</p>

    <!-- Info box -->
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:13px;color:#92400E;font-family:sans-serif;font-weight:bold;">What happens next?</p>
      <ul style="margin:0;padding-left:18px;color:#78350F;font-size:12px;line-height:1.9;font-family:sans-serif;">
        <li>Your cart is still saved — nothing was removed.</li>
        <li>No payment was deducted from your account.</li>
        <li>You can retry checkout at any time.</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-top:8px;">
      <a href="https://kaelora.in/checkout" style="display:inline-block;background:#D4AF37;color:#1A1A1A;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;border-radius:6px;font-family:sans-serif;font-weight:bold;">Try Again</a>
    </div>

    <p style="text-align:center;color:#bbb;font-size:11px;margin-top:28px;font-family:sans-serif;">Need help? Reply to this email or contact us on WhatsApp.</p>
  `;

  return emailWrapper(content);
}

// ─── POST handler ─────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      customerName,
      customerEmail,
      orderId,
      amountPaid,
      products,
      shippingAddress,
      estimatedDeliveryDate,
    } = body;

    console.log('[send-email] Request received:', { type, customerEmail, orderId });

    if (!customerEmail) {
      console.warn('[send-email] Missing customerEmail');
      return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
    }

    // Validate email type
    if (!['success', 'failed', 'cancelled'].includes(type)) {
      console.warn('[send-email] Invalid type:', type);
      return NextResponse.json({ error: 'Invalid email type. Use "success", "failed" or "cancelled".' }, { status: 400 });
    }

    // If no API key configured, log and return gracefully (don't break checkout)
    if (!resend) {
      console.warn('[send-email] RESEND_API_KEY not configured. Skipping email send.');
      await serviceDb.logEmailDelivery({
        type,
        customerEmail,
        orderId: orderId || null,
        status: 'skipped',
        reason: 'RESEND_API_KEY not configured',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: false, skipped: true, reason: 'Email service not configured' });
    }

    // Determine subject and HTML based on type
    let subject: string;
    let html: string;
    if (type === 'success') {
      subject = `Your KAELORA Order is Confirmed! 🛍️ (#${orderId})`;
      html = buildSuccessTemplate({ customerName, orderId, amountPaid, products, shippingAddress, estimatedDeliveryDate });
    } else if (type === 'failed') {
      subject = `Payment Failed - KAELORA`;
      html = buildFailedTemplate({ customerName, amountPaid });
    } else { // cancelled
      subject = `Payment Cancelled - KAELORA`;
      html = buildCancelledTemplate({ customerName });
    }


    console.log("Sending email via Resend with from:", 'KAELORA <onboarding@resend.dev>', "to:", customerEmail);
    let data: any = null;
    let error: any = null;
    try {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to: [customerEmail],
        subject,
        html,
      });
      data = response.data;
      error = response.error;
    } catch (sendError) {
      console.error("[send-email] Resend send exception:", sendError);
      error = sendError;
    }
    if (error) {
      console.error('[send-email] Resend error:', error);
      await serviceDb.logEmailDelivery({
        type,
        customerEmail,
        orderId: orderId || null,
        status: 'failed',
        error: (error as any).message || JSON.stringify(error),
        timestamp: new Date().toISOString(),
      });
      // Return 200 so checkout never breaks due to email failure
      return NextResponse.json({ success: false, error: (error as any).message });
    } else {
      console.log('EMAIL RESULT:', data);
      console.log('EMAIL SENT SUCCESSFULLY');
      console.log(`Payment ${type} Email Sent`);
      console.log('Recipient:', customerEmail);
    }

    await serviceDb.logEmailDelivery({
      type,
      customerEmail,
      orderId: orderId || null,
      status: 'sent',
      resendId: data?.id,
      timestamp: new Date().toISOString(),
    });

    console.log(`[send-email] ${type} email sent to ${customerEmail} — ID: ${data?.id}`);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error('[send-email] Unexpected error:', err);
    // Always return 200 — email failure must never block payment flow
    return NextResponse.json({ success: false, error: err.message });
  }
}

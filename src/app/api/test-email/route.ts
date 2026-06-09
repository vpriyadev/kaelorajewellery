import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { serviceDb } from '../../../lib/firebase';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  const logs: string[] = [];
  const addLog = (msg: string) => { console.log(msg); logs.push(msg); };

  addLog('=== TEST EMAIL START ===');
  addLog(`RESEND KEY EXISTS: ${!!process.env.RESEND_API_KEY}`);

  if (!resend) {
    const err = 'Resend API key not configured';
    addLog(err);
    return NextResponse.json({ success: false, error: err, logs }, { status: 500 });
  }

  const { toEmail, name } = await req.json();
  if (!toEmail) {
    const err = 'Missing toEmail';
    addLog(err);
    return NextResponse.json({ success: false, error: err, logs }, { status: 400 });
  }

  const subject = 'Test Email from Kaelora';
  const html = `<html><body><p>Hello ${name || ''}, this is a test email.</p></body></html>`;

  addLog(`Sending test email to: ${toEmail}`);

  let data: any = null;
  let error: any = null;
  try {
    const response = await resend.emails.send({
      from: 'KAELORA <onboarding@resend.dev>',
      to: [toEmail],
      subject,
      html,
    });
    data = response.data;
    error = response.error;
  } catch (sendError) {
    addLog(`[test-email] Resend send exception: ${sendError}`);
    error = sendError;
  }

  if (error) {
    addLog(`[test-email] Resend error: ${JSON.stringify(error)}`);
    await serviceDb.logEmailDelivery({
      type: 'test',
      customerEmail: toEmail,
      status: 'failed',
      error: (error as any).message || JSON.stringify(error),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: false, error, logs }, { status: 500 });
  }

  addLog('EMAIL RESULT: ' + JSON.stringify(data));
  addLog('EMAIL SENT SUCCESSFULLY');
  await serviceDb.logEmailDelivery({
    type: 'test',
    customerEmail: toEmail,
    status: 'sent',
    resendId: data?.id,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, data, logs });
}

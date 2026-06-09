import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary credentials missing' }, { status: 500 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  return NextResponse.json({ api_key: apiKey, timestamp, signature, cloud_name: cloudName });
}

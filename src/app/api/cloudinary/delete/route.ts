import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const public_id = body?.public_id;
    if (!public_id) return NextResponse.json({ error: 'public_id required' }, { status: 400 });

    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.destroy(public_id, (err: any, res: any) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Deletion failed' }, { status: 500 });
  }
}

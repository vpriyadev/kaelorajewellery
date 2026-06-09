import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    keyExists: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    secretExists: !!process.env.RAZORPAY_KEY_SECRET,
    keyLength: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.length || 0,
    secretLength: process.env.RAZORPAY_KEY_SECRET?.length || 0,
  });

}

export async function POST(req: Request) {
  try {
    console.log("process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID exists?", !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    console.log("process.env.RAZORPAY_KEY_SECRET exists?", !!process.env.RAZORPAY_KEY_SECRET);

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    console.log("Razorpay instance creation success? Yes");

    const { amount } = await req.json();
    console.log("amount received?", amount);

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Create Order Error:", error);

    return NextResponse.json(
      {
        error: "Failed to create Razorpay order",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
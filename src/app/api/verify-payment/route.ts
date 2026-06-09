import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    const isValid =
      generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Verification error",
      },
      { status: 500 }
    );
  }
}
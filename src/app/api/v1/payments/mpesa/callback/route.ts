import { NextResponse } from "next/server";
import { markPaymentSucceeded, markPaymentFailed } from "@/server/services/payment.service";

/**
 * M-Pesa Daraja callback.
 * Two modes:
 *   - LIVE: standard Daraja payload with Body.stkCallback
 *   - MOCK: our initiate endpoint posts { mock: true, checkoutRequestId } after 2s
 */
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Invalid JSON" }, { status: 400 });
  }

  // MOCK mode
  if (body?.mock === true && body?.checkoutRequestId) {
    const checkoutRequestId = String(body.checkoutRequestId);
    const success = body.success !== false;
    if (success) {
      await markPaymentSucceeded({
        providerRef: checkoutRequestId,
        receiptNumber: `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        payload: { mock: true }
      });
    } else {
      await markPaymentFailed({ providerRef: checkoutRequestId, reason: "Mock failure" });
    }
    return NextResponse.json({ ok: true });
  }

  // LIVE mode: Daraja payload
  const cb = body?.Body?.stkCallback;
  if (!cb) return NextResponse.json({ ResultCode: 1, ResultDesc: "Missing Body" }, { status: 400 });

  const checkoutRequestId = String(cb.CheckoutRequestID);
  const resultCode = Number(cb.ResultCode);

  if (resultCode === 0) {
    const items: any[] = cb.CallbackMetadata?.Item ?? [];
    const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value ?? "UNKNOWN";
    await markPaymentSucceeded({
      providerRef: checkoutRequestId,
      receiptNumber: String(receipt),
      payload: cb
    });
  } else {
    await markPaymentFailed({
      providerRef: checkoutRequestId,
      reason: cb.ResultDesc ?? `ResultCode ${resultCode}`
    });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "OK" });
}
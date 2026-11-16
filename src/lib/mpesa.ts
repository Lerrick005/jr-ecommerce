/**
 * M-Pesa Daraja client. If MPESA_CONSUMER_KEY is empty, runs in MOCK mode â€"
 * the initiate endpoint will simulate a successful callback after 2s.
 */

export type StkPushResult =
  | { ok: true; mode: "live"; checkoutRequestId: string; merchantRequestId: string; customerMessage: string }
  | { ok: true; mode: "mock"; checkoutRequestId: string; merchantRequestId: string; customerMessage: string }
  | { ok: false; error: string };

export function isMpesaConfigured(): boolean {
  return !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY);
}

function darajaBase(): string {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

async function getAccessToken(): Promise<string | null> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${darajaBase()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.access_token ?? null;
}

function stkTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function initiateStkPush(args: {
  phoneE164: string;
  amountCents: number;
  accountReference: string;
  description: string;
}): Promise<StkPushResult> {
  if (!isMpesaConfigured()) {
    // Mock mode
    const checkoutRequestId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      ok: true,
      mode: "mock",
      checkoutRequestId,
      merchantRequestId: "MOCK-MERCHANT",
      customerMessage: "Mock payment prompt sent to your phone"
    };
  }

  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Failed to authenticate with Daraja" };

  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = stkTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.max(1, Math.round(args.amountCents / 100)),
    PartyA: args.phoneE164.replace("+", ""),
    PartyB: shortcode,
    PhoneNumber: args.phoneE164.replace("+", ""),
    CallBackURL: process.env.MPESA_CALLBACK_URL!,
    AccountReference: args.accountReference.slice(0, 12),
    TransactionDesc: args.description.slice(0, 13)
  };

  const res = await fetch(`${darajaBase()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.CheckoutRequestID) {
    return { ok: false, error: json?.errorMessage ?? "STK push failed" };
  }

  return {
    ok: true,
    mode: "live",
    checkoutRequestId: json.CheckoutRequestID,
    merchantRequestId: json.MerchantRequestID,
    customerMessage: json.CustomerMessage ?? "Prompt sent to your phone"
  };
}
/**
 * SMS sending. If AT_USERNAME + AT_API_KEY set, sends via Africa's Talking.
 * Otherwise logs to DB /admin/outbox.
 */
import { prisma } from "@/lib/db";

type SendSmsArgs = {
  to: string;
  message: string;
};

export async function sendSms(args: SendSmsArgs) {
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;

  if (username && apiKey && username !== "sandbox") {
    try {
      const params = new URLSearchParams({
        username,
        to: args.to,
        message: args.message,
        from: "J&R"
      });

      const res = await fetch("https://api.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json"
        },
        body: params.toString()
      });

      if (res.ok) {
        await logOutbox("sms", args.to, "SMS", args.message, "sent");
        return { ok: true };
      }
    } catch (e) {
      console.error("Africa's Talking error:", e);
    }
  }

  await logOutbox("sms", args.to, "SMS", args.message, "dev-logged");
  console.log(`\n[SMS] To: ${args.to}\n${args.message}\n`);
  return { ok: true };
}

async function logOutbox(type: string, to: string, subject: string, body: string, status: string) {
  const key = `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        valueJson: { type, to, subject, body, status, sentAt: new Date().toISOString() }
      },
      update: {}
    });
  } catch (e) {
    console.error("Outbox write failed:", e);
  }
}
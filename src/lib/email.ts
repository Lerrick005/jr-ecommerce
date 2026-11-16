/**
 * Email sending. If RESEND_API_KEY is set, sends via Resend.
 * Otherwise logs to DB (Setting table) so you can see it at /admin/outbox.
 */
import { prisma } from "@/lib/db";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(args: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "J&R Ecommerce <noreply@jrecommerce.ke>",
          to: args.to,
          subject: args.subject,
          html: args.html,
          text: args.text
        })
      });

      if (res.ok) {
        await logOutbox("email", args.to, args.subject, args.text, "sent");
        return { ok: true };
      }
    } catch (e) {
      console.error("Resend error:", e);
    }
  }

  // Dev mode: log to outbox
  await logOutbox("email", args.to, args.subject, args.text, "dev-logged");
  console.log(`\n[EMAIL] To: ${args.to}\nSubject: ${args.subject}\n${args.text}\n`);
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
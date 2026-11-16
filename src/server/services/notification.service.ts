import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function notifyOrderPlaced(order: {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  totalCents: number;
}) {
  const total = `KSh ${Math.round(order.totalCents / 100).toLocaleString("en-KE")}`;

  await sendEmail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} confirmed`,
    html: `<p>Hi ${order.customerName},</p><p>Thanks for your order <strong>${order.orderNumber}</strong> for ${total}.</p><p>We'll let you know when it ships. <a href="${baseUrl}/account/orders/${order.orderNumber}">View order</a></p><p>â€" J&R Ecommerce</p>`,
    text: `Hi ${order.customerName}, thanks for your order ${order.orderNumber} for ${total}. View it at ${baseUrl}/account/orders/${order.orderNumber}`
  });

  await sendSms({
    to: order.customerPhone,
    message: `J&R: Order ${order.orderNumber} confirmed (${total}). We'll notify you when it ships.`
  });
}

export async function notifyOrderShipped(order: {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}) {
  await sendEmail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} has shipped`,
    html: `<p>Hi ${order.customerName},</p><p>Your order <strong>${order.orderNumber}</strong> is on its way!</p><p><a href="${baseUrl}/account/orders/${order.orderNumber}">Track it here</a></p><p>â€" J&R Ecommerce</p>`,
    text: `Hi ${order.customerName}, order ${order.orderNumber} has shipped. Track it at ${baseUrl}/account/orders/${order.orderNumber}`
  });

  await sendSms({
    to: order.customerPhone,
    message: `J&R: Order ${order.orderNumber} has shipped. Track it at ${baseUrl}/account/orders/${order.orderNumber}`
  });
}

export async function notifyOrderDelivered(order: {
  orderNumber: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}) {
  await sendEmail({
    to: order.customerEmail,
    subject: `Order ${order.orderNumber} delivered`,
    html: `<p>Hi ${order.customerName},</p><p>Your order <strong>${order.orderNumber}</strong> has been delivered. We hope you love it!</p><p>Leave a review: <a href="${baseUrl}/account/orders/${order.orderNumber}">View order</a></p><p>â€" J&R Ecommerce</p>`,
    text: `Hi ${order.customerName}, order ${order.orderNumber} delivered. Leave a review at ${baseUrl}/account/orders/${order.orderNumber}`
  });

  await sendSms({
    to: order.customerPhone,
    message: `J&R: Order ${order.orderNumber} delivered! Leave a review at ${baseUrl}/account/orders/${order.orderNumber}`
  });
}
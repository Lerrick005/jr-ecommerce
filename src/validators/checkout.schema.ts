import { z } from "zod";
import { normaliseKenyanPhone } from "@/lib/phone";

export const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z
    .string()
    .transform((v) => normaliseKenyanPhone(v))
    .refine((v): v is string => !!v, { message: "Invalid Kenyan phone (+2547... or +2541...)" }),
  county: z.string().min(1).max(80),
  town: z.string().min(1).max(80),
  area: z.string().max(120).optional(),
  landmark: z.string().max(120).optional(),
  deliveryNotes: z.string().max(500).optional()
});

export const checkoutSchema = z.object({
  email: z.string().email("Enter a valid email").toLowerCase(),
  address: addressSchema,
  deliveryZoneId: z.string().min(1),
  paymentMethod: z.enum(["MPESA"]),
  mpesaPhone: z
    .string()
    .transform((v) => normaliseKenyanPhone(v))
    .refine((v): v is string => !!v, { message: "Invalid M-Pesa phone" }),
  giftNote: z.string().max(500).optional(),
  giftWrap: z.boolean().optional(),
  idempotencyKey: z.string().min(8).max(80)
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
import { z } from "zod";

export const phoneRegex = /^\+254(7|1)\d{8}$/;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Enter a valid email").toLowerCase(),
  phone: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().regex(phoneRegex, "Phone must be +2547xxxxxxxx or +2541xxxxxxxx")),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128, "Password too long")
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email").toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, "Invalid token"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128, "Password too long")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/validators/auth.schema";
import argon2 from "argon2";

/**
 * Full NextAuth server instance.
 * Credentials (email + password) + Google OAuth, sharing the same User model.
 * Google is only registered if GOOGLE_CLIENT_ID is present.
 */
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false
    })
  );
}

providers.push(
  Credentials({
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(raw) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash || user.disabled || user.deletedAt) return null;

      const ok = await argon2.verify(user.passwordHash, password);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        role: user.role
      };
    }
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
  }
});
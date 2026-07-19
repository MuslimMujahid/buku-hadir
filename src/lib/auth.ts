import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

function readUrl(value: string | undefined, name: string): string {
  const rawValue = value?.trim();
  if (!rawValue) {
    throw new Error(`${name} must be configured.`);
  }

  let parsed: URL;
  try {
    parsed = new URL(rawValue);
  } catch (error) {
    throw new Error(`${name} must be a valid URL.`, { cause: error });
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${name} must use http:// or https://.`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`${name} must not contain URL credentials.`);
  }

  return rawValue.replace(/\/+$/, "");
}

const baseURL = readUrl(
  process.env.BETTER_AUTH_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL,
  "BETTER_AUTH_URL",
);
const trustedOrigins = [
  new URL(baseURL).origin,
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((origin) => new URL(readUrl(origin, "BETTER_AUTH_TRUSTED_ORIGINS")).origin),
];
const secret = process.env.BETTER_AUTH_SECRET?.trim();

export const auth = betterAuth({
  appName: "Absensi",
  baseURL,
  ...(secret ? { secret } : {}),
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    async sendVerificationEmail({ user, url }) {
      await sendVerificationEmail({
        to: user.email,
        url,
      });
    },
  },
  trustedOrigins,
  plugins: [nextCookies()],
});

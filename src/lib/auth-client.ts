"use client";

import { createAuthClient } from "better-auth/react";

const browserBaseURL = process.env.NEXT_PUBLIC_APP_URL?.trim();

export const authClient = createAuthClient(
  browserBaseURL ? { baseURL: browserBaseURL } : undefined,
);

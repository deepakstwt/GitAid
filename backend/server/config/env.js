import path from "path";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Load backend/.env so GEMINI_API_KEY etc. are available when Next runs from frontend
try {
  const { config } = await import("dotenv");
  const cwd = process.cwd();
  const fromFrontend = path.join(cwd, "..", "backend", ".env");
  const fromRoot = path.join(cwd, "backend", ".env");
  config({ path: fromFrontend, override: true });
  config({ path: fromRoot, override: true });
} catch (_) {
  // dotenv optional; Next may have already loaded env from frontend root
}

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    GITHUB_TOKEN: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string().min(1).optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL,
  },
  skipValidation: false,
  emptyStringAsUndefined: true,
});

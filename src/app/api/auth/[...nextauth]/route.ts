/**
 * NextAuth.js API Route Handler
 * Handles all auth endpoints: /api/auth/*
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

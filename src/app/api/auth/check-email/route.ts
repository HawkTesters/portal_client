// src/app/api/auth/check-email/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // In real logic, you’d look up the user or
  // check your “allowed emails” list. For example:
  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  // For example:
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Suppose you keep a separate table or config for "viewer" emails
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ userType: user.userType });
}

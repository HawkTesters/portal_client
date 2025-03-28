// app/api/2fa/verify/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST(req: NextRequest) {
  const { userId, token } = await req.json();

  // Retrieve the user from the database using the provided userId
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorSecret) {
    return NextResponse.json(
      { error: "2FA is not set up for this user" },
      { status: 400 }
    );
  }

  // Verify the token using otplib
  const verified = authenticator.check(token, user.twoFactorSecret);

  if (!verified) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Optionally, update user or session state here to mark 2FA as complete
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    message: "2FA verification successful",
  });
}

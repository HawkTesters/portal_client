// app/api/2fa/setup/route.ts

import { compareHashedPasswords } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import QRCode from "qrcode";

// GET: For first-time 2FA setup.
export async function GET(req: NextRequest) {
  // Extract userId from query parameters.
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  // Look up the user.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // If the user already has a 2FA secret, instruct the client to use POST with credentials.
  if (user.twoFactorSecret) {
    return NextResponse.json(
      {
        error:
          "2FA is already set up. To reset it, use POST with your credentials.",
      },
      { status: 403 }
    );
  }

  // Generate a new TOTP secret using otplib.
  const secret = authenticator.generateSecret();

  // Create an otpauth URL for Google Authenticator.
  const otpauth = authenticator.keyuri(
    user.email,
    "Hawktesters Portal",
    secret
  );

  // Save the generated secret to the user's record.
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret, twoFactorEnabled: true },
  });

  // Generate a QR code from the otpauth URL.
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return NextResponse.json({ qrCodeUrl });
}

// POST: For resetting 2FA when one is already configured.
export async function POST(req: NextRequest) {
  // Expect the client to send userId, email, and password.
  const { userId, email, password } = await req.json();
  if (!userId || !email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // Look up the user.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== email) {
    return NextResponse.json(
      { error: "User not found or email mismatch" },
      { status: 404 }
    );
  }

  // Verify the password.
  const isValid = await compareHashedPasswords(password, user.password!);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Generate a new TOTP secret.
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
    user.email,
    "Hawktesters Portal",
    secret
  );

  // Update the user's 2FA secret.
  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  // Generate a QR code data URL.
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  return NextResponse.json({ qrCodeUrl });
}

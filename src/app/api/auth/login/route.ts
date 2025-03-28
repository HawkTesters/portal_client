import { checkIfEmailIsViewer } from "@/lib/check-viewer";
import { compareHashedPasswords } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // For generic (viewer) users that don’t provide a password
  if (!password) {
    const isViewer = await checkIfEmailIsViewer(email);
    if (!isViewer) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }
    const viewerUser = {
      id: "viewer-" + email,
      name: "Viewer User",
      email,
      role: "viewer",
    };
    return NextResponse.json(viewerUser);
  }

  // Retrieve the user from the database
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await compareHashedPasswords(password, user.password!);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Build the full user object that NextAuth expects.
  // Include all required fields (id, email) plus any flags.
  const fullUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType,
    // You can include other fields as needed.
  };

  // Check if this is the user's first time logging in.
  if (user.firstTimeLogin) {
    return NextResponse.json({
      ...fullUser,
      firstTimeLogin: true,
      message: "Password reset required",
    });
  }

  // For non-GENERIC users, enforce 2FA:
  // If 2FA is enabled, signal that a verification step is needed.
  // Otherwise, signal that 2FA setup is required before login can be finalized.
  if (user.twoFactorEnabled) {
    return NextResponse.json({
      ...fullUser,
      twoFactorRequired: true,
      message: "2FA verification required",
    });
  } else {
    return NextResponse.json({
      ...fullUser,
      twoFactorSetupRequired: true,
      message: "2FA setup required",
    });
  }
}

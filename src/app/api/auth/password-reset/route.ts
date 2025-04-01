import { hashPassword } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Parse the request JSON to get the new password
    const { newPassword, email } = await request.json();

    // Check if the user exists and is of userType TEAM
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password and set lastAccess + optionally toggle firstTimeLogin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        lastAccess: new Date(), // record the time of this action
        firstTimeLogin: false, // or leave as is if you'd prefer
      },
    });

    return NextResponse.json({
      message: "Password reset successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        lastAccess: updatedUser.lastAccess,
        twoFactorSetupRequired: !updatedUser.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "Error resetting password" },
      { status: 500 }
    );
  }
}

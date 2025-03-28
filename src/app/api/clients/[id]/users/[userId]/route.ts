// app/api/clients/[clientId]/users/[userId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust the import path as needed

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; userId: string } }
) {
  const { id, userId } = await params;

  console.log(params);
  try {
    // Check that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure the user belongs to the specified client
    if (user.clientId !== id) {
      return NextResponse.json(
        { error: "User does not belong to the specified client" },
        { status: 400 }
      );
    }

    // Delete the user from the database
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      message: "User removed successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error removing user email:", error);
    return NextResponse.json(
      { error: "Error removing user email" },
      { status: 500 }
    );
  }
}

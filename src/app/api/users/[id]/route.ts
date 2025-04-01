import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teamMember = await prisma.user.findFirst({
      where: {
        id,
        userType: "TEAM",
      },
      include: {
        cv: {
          include: {
            education: true,
            experience: true,
            services: true,
            achievements: true,
            testimonials: true,
            userCertifications: {
              include: { certification: true },
            },
          },
        },
        client: true,
      },
    });
    if (!teamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("Error fetching team member:", error);
    return NextResponse.json(
      { message: "Error fetching team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if the team member exists and is of type TEAM.
    const teamMember = await prisma.user.findFirst({
      where: {
        id,
        userType: "TEAM",
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }

    // Delete the team member.
    const deletedTeamMember = await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Team member deleted successfully",
      teamMember: deletedTeamMember,
    });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { message: "Error deleting team member" },
      { status: 500 }
    );
  }
}

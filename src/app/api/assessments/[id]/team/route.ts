import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { teamMembers: true },
  });
  if (!assessment) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 }
    );
  }
  // Return only the teamMembers array
  return NextResponse.json({ teamMembers: assessment.teamMembers });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { teamMemberId } = await request.json();

    // Check if the assessment exists.
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: { teamMembers: true },
    });
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Optionally, check if the team member is already assigned.
    if (assessment.teamMembers.some((member) => member.id === teamMemberId)) {
      return NextResponse.json(
        { message: "Team member already assigned" },
        { status: 400 }
      );
    }

    // Add the team member to the assessment.
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        teamMembers: {
          connect: { id: teamMemberId },
        },
      },
      include: { teamMembers: true },
    });

    return NextResponse.json(updatedAssessment, { status: 200 });
  } catch (error) {
    console.error("Error adding team member to assessment:", error);
    return NextResponse.json(
      { error: "Error adding team member to assessment" },
      { status: 500 }
    );
  }
}

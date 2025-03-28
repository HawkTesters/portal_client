import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        // Include all files linked to this assessment.
        uploadedFiles: true,
        client: true,
        teamMembers: true,
      },
    });
    console.log(assessment);

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error retrieving assessment:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the dynamic parameters
    const body = await request.json();
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.log("ERR", error);
    return NextResponse.json(
      { error: "Error updating assessment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.assessment.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Assessment deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting assessment" },
      { status: 500 }
    );
  }
}

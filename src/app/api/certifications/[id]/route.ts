import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const certification = await prisma.certification.findUnique({
      where: { id: params.id },
    });
    if (!certification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error fetching certification:", error);
    return NextResponse.json(
      { message: "Error fetching certification" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, logo, alt } = body;
    const certification = await prisma.certification.update({
      where: { id: params.id },
      data: {
        title,
        logo,
        alt,
      },
    });
    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json(
      { message: "Error updating certification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const certification = await prisma.certification.delete({
      where: { id: params.id },
    });
    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json(
      { message: "Error deleting certification" },
      { status: 500 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certification = await prisma.certification.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { title, logo, alt } = body;
    const { id } = await params;
    const certification = await prisma.certification.update({
      where: { id },
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
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certification = await prisma.certification.delete({
      where: { id },
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

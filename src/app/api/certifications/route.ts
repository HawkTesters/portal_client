import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// A helper function to derive logo and alt text based on a given title.
// In a real-world scenario, this logic might query an external service or use a lookup table.
function getCertificationDetails(input: string) {
  return {
    logo: "/images/default-cert-logo.png",
    alt: "Certification Logo",
  };
}

export async function GET(request: Request) {
  try {
    const certifications = await prisma.certification.findMany();
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching certifications:", error);
    return NextResponse.json(
      { message: "Error fetching certifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Expect the body to include a title for the certification.
    const { title, logo, alt } = body;
    if (!title) {
      return NextResponse.json(
        { message: "Certification title is required" },
        { status: 400 }
      );
    }
    // Automatically derive logo and alt text if not provided.
    const details = getCertificationDetails(title);
    const certification = await prisma.certification.create({
      data: {
        title,
        logo: logo || details.logo,
        alt: alt || details.alt,
      },
    });
    return NextResponse.json(certification, { status: 201 });
  } catch (error) {
    console.error("Error creating certification:", error);
    return NextResponse.json(
      { message: "Error creating certification" },
      { status: 500 }
    );
  }
}

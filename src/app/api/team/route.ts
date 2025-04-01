// /app/api/team-members/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
  try {
    // Optionally you could parse query params here for pagination/search.
    const teamMembers = await prisma.user.findMany({
      where: {
        userType: "TEAM",
        cv: {
          isNot: null,
        },
      },
      include: {
        cv: true,
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { message: "Error fetching team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, cvBio } = body;

    // Check if a team member with this email already exists.
    const existing = await prisma.user.findFirst({
      where: {
        email,
        userType: "TEAM",
      },
    });
    if (existing) {
      return NextResponse.json(
        { message: "A team member with this email already exists." },
        { status: 400 }
      );
    }

    // Create a new team member with userType "TEAM".
    const newTeamMember = await prisma.user.create({
      data: {
        name,
        email,
        userType: "TEAM",
      },
      include: {
        cv: true,
        client: true,
      },
    });

    return NextResponse.json(newTeamMember, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { message: "Error creating team member" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssessmentStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("q") || "";
    const status = searchParams.get("status") as AssessmentStatus | null;

    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        title: { contains: search, mode: "insensitive" },
      }),
      ...(status &&
        Object.values(AssessmentStatus).includes(status) && {
          status,
        }),
    };

    const assessments = await prisma.assessment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        client: true, // Include client details
        teamMembers: true, // Include assigned team members
      },
    });

    const total = await prisma.assessment.count({ where });

    return NextResponse.json({ assessments, total });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Error fetching assessments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      certificate,
      executiveReport,
      technicalReport,
      additionalFiles,
      clientId,
      teamMemberIds,
      status,
      deadline,
    } = body;

    // Validate required fields
    if (!title || !clientId || !status || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields: title, clientId, status, deadline" },
        { status: 400 }
      );
    }

    // Validate `status` (must be in Prisma `AssessmentStatus` enum)
    if (!Object.values(AssessmentStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate `deadline` (must be a valid date)
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return NextResponse.json(
        { error: "Invalid deadline date" },
        { status: 400 }
      );
    }

    // Check if `clientId` exists
    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Validate and connect team members
    let teamMembersConnect: any = [];
    if (teamMemberIds && Array.isArray(teamMemberIds)) {
      const validUsers = await prisma.user.findMany({
        where: { id: { in: teamMemberIds } },
      });
      if (validUsers.length !== teamMemberIds.length) {
        return NextResponse.json(
          { error: "One or more team members not found" },
          { status: 404 }
        );
      }
      teamMembersConnect = validUsers.map((user) => ({ id: user.id }));
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        title,
        certificate: certificate || null,
        executiveReport: executiveReport || null,
        technicalReport: technicalReport || null,
        additionalFiles: additionalFiles || [],
        status,
        deadline: parsedDeadline,
        client: { connect: { id: clientId } },
        teamMembers: teamMembersConnect.length
          ? { connect: teamMembersConnect }
          : undefined,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Error creating assessment" },
      { status: 500 }
    );
  }
}

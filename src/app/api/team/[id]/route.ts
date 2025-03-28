import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const teamMember = await prisma.user.findFirst({
      where: { id, userType: "TEAM" },
      include: {
        cv: {
          include: {
            education: true,
            experience: true,
            services: true,
            achievements: true,
            testimonials: true,
            // Instead of a direct certifications relation, include the join model:
            userCertifications: {
              include: {
                certification: true,
              },
            },
          },
        },
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Find the team member and its associated CV.
    const teamMember = await prisma.user.findFirst({
      where: { id, userType: "TEAM" },
      include: { cv: true },
    });
    if (!teamMember) {
      return NextResponse.json(
        { message: "Team member not found" },
        { status: 404 }
      );
    }
    if (!teamMember.cv) {
      return NextResponse.json(
        { message: "CV not found for team member" },
        { status: 404 }
      );
    }

    // Expect the payload to be structured as:
    // {
    //   name,
    //   email,
    //   cv: {
    //     jobTitle,
    //     greetingTitle,
    //     greetingDescription,
    //     languages,
    //     interests,
    //     experience,
    //     achievements,
    //     certifications: [{ title, href, logo?, alt? }]
    //   }
    // }
    const { name, email, cv } = body;
    if (!cv) {
      throw new Error("Missing cv data");
    }
    const {
      jobTitle,
      greetingTitle,
      greetingDescription,
      languages,
      interests,
      experience,
      achievements,
      certifications,
    } = cv;

    // For "experience" and "achievements", delete all existing records and recreate them.
    const experienceUpdate = {
      deleteMany: {},
      create: experience,
    };

    const achievementsUpdate =
      achievements && achievements.length > 0
        ? { deleteMany: {}, create: achievements }
        : undefined;

    // For certifications, update the join table `userCertifications`:
    // Delete all existing join records for this CV and then create new ones.
    const certificationsUpdate =
      certifications && certifications.length > 0
        ? {
            deleteMany: {},
            create: certifications.map((cert: any) => ({
              href: cert.href,
              certification: {
                connectOrCreate: {
                  where: { title: cert.title },
                  create: {
                    title: cert.title,
                    // Derive logo and alt if not provided
                    logo: cert.logo || getCertificationDetails(cert.title).logo,
                    alt: cert.alt || getCertificationDetails(cert.title).alt,
                  },
                },
              },
            })),
          }
        : undefined;

    const updatedCV = await prisma.cV.update({
      where: { id: teamMember.cv.id },
      data: {
        profileName: name, // map "name" to "profileName"
        email,
        jobTitle,
        greetingTitle,
        greetingDescription,
        languages,
        interests,
        experience: experienceUpdate,
        ...(achievementsUpdate ? { achievements: achievementsUpdate } : {}),
        ...(certificationsUpdate
          ? { userCertifications: certificationsUpdate }
          : {}),
      },
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
    });

    return NextResponse.json(updatedCV);
  } catch (error) {
    console.error("Error updating CV:", error);
    return NextResponse.json({ message: "Error updating CV" }, { status: 500 });
  }
}

// Helper function for certification details reused in the PUT endpoint.
function getCertificationDetails(input: string) {
  return {
    logo: "/images/default-cert-logo.png",
    alt: "Certification Logo",
  };
}

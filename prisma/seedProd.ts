import * as argon2 from "argon2";
import * as md5 from "md5";

const { AssessmentStatus, PrismaClient, UserType } = require("@prisma/client");

// Hash a plain-text password
async function hashPassword(plainPassword: string) {
  // Adjust saltRounds as needed (default: 10-12 for typical usage)
  const hashed = await argon2.hash(plainPassword);
  return hashed;
}

function getGravatarUrl(email: string) {
  const base = "https://www.gravatar.com/avatar/";
  const hash = md5(email.trim().toLowerCase());
  // Use the 'd' parameter to pick a fallback (identicon, monsterid, wavatar, retro, robohash, etc.)
  return `${base}${hash}?d=identicon`;
}

const isaacCV = require("./isaac_cv.json");

const prisma = new PrismaClient();

async function main() {
  // 1) Upsert a Generic user (no password)
  await prisma.user.upsert({
    where: { email: "generic@hawktesters.com" },
    update: {},
    create: {
      email: "generic@hawktesters.com",
      userType: UserType.GENERIC,
      password: null,
      avatarUrl: getGravatarUrl("generic@hawktesters.com"),
    },
  });

  // 2) Upsert a Team user (example team without CV)
  await prisma.user.upsert({
    where: { email: "team@hawktesters.com" },
    update: {},
    create: {
      email: "team@hawktesters.com",
      userType: UserType.TEAM,
      password: await hashPassword("team@123HT#"),
      avatarUrl: getGravatarUrl("team@hawktesters.com"),
    },
  });

  // 3) Upsert an Admin user
  await prisma.user.upsert({
    where: { email: "admin@hawktesters.com" },
    update: {},
    create: {
      email: "admin@hawktesters.com",
      userType: UserType.ADMIN,
      password: await hashPassword("admin@123HT#"),
      avatarUrl: getGravatarUrl("admin@hawktesters.com"),
    },
  });

  // 4) Upsert a Client (organization)
  const client = await prisma.client.upsert({
    where: { name: "Acme Corporation" },
    update: {},
    create: {
      name: "Acme Corporation",
    },
  });

  // 5) Upsert a Client user (associated with the client)
  await prisma.user.upsert({
    where: { email: "client@hawktesters.com" },
    update: {},
    create: {
      email: "client@hawktesters.com",
      userType: UserType.CLIENT,
      password: await hashPassword("client@123HT#"),
      client: { connect: { id: client.id } },
      avatarUrl: getGravatarUrl("client@hawktesters.com"),
    },
  });

  // Generate deadline dates
  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 1); // 1 month ahead
  const pastDate = new Date();
  pastDate.setMonth(pastDate.getMonth() - 1); // 1 month ago

  // Create assessments for each status type
  const assessments = [
    {
      title: "Active Security Review",
      status: AssessmentStatus.ACTIVE,
      deadline: futureDate,
    },
    {
      title: "Planned Network Audit",
      status: AssessmentStatus.PROGRAMMED,
      deadline: futureDate,
    },
    {
      title: "Paused Compliance Check",
      status: AssessmentStatus.ON_HOLD,
      deadline: now,
    },
    {
      title: "Completed Code Review",
      status: AssessmentStatus.COMPLETED,
      deadline: pastDate,
    },
  ];

  for (const assessment of assessments) {
    await prisma.assessment.upsert({
      where: { title: assessment.title },
      update: {},
      create: {
        title: assessment.title,
        status: assessment.status,
        deadline: assessment.deadline,
        clientId: client.id,
      },
    });
  }

  console.log("Assessments seeded successfully!");

  // 6) Upsert a Team user (Isaac) with no CV yet.
  const teamUser = await prisma.user.upsert({
    where: { email: "isaac.iglesias@hawktesters.com" },
    update: {},
    create: {
      email: "isaac.iglesias@hawktesters.com",
      userType: UserType.TEAM,
      password: await hashPassword("isaac@123HT#"),
      name: "Isaac Iglesias",
      avatarUrl: getGravatarUrl("isaac.iglesias@hawktesters.com"),
    },
  });

  // 7) Create/update Isaac's CV record
  const cvRecord = await prisma.cV.upsert({
    where: { userId: teamUser.id },
    update: {
      profileImage: isaacCV.profileImage,
      profileName: isaacCV.profileName,
      jobTitle: isaacCV.jobTitle,
      email: isaacCV.email,
      greetingTitle: isaacCV.greetingTitle,
      greetingDescription: isaacCV.greetingDescription,
      footerText: isaacCV.footerText,
      languages: isaacCV.languages.map(
        (lang: any) => `${lang.language}: ${lang.level}`
      ),
      interests: isaacCV.interests,
    },
    create: {
      userId: teamUser.id,
      profileImage: isaacCV.profileImage,
      profileName: isaacCV.profileName,
      jobTitle: isaacCV.jobTitle,
      email: isaacCV.email,
      greetingTitle: isaacCV.greetingTitle,
      greetingDescription: isaacCV.greetingDescription,
      footerText: isaacCV.footerText,
      languages: isaacCV.languages.map(
        (lang: any) => `${lang.language}: ${lang.level}`
      ),
      interests: isaacCV.interests,
    },
  });

  // 8) Seed Education
  if (isaacCV.education && isaacCV.education.length) {
    for (const edu of isaacCV.education) {
      await prisma.education.create({
        data: {
          cvId: cvRecord.id,
          yearRange: edu.yearRange,
          title: edu.title,
          subtitle: edu.subtitle,
          description: edu.description,
        },
      });
    }
  }

  // 9) Seed Experience
  if (isaacCV.experience && isaacCV.experience.length) {
    for (const exp of isaacCV.experience) {
      await prisma.experience.create({
        data: {
          cvId: cvRecord.id,
          yearRange: exp.yearRange,
          title: exp.title,
          subtitle: exp.subtitle,
          description: exp.description,
        },
      });
    }
  }

  // 10) Seed Services
  if (isaacCV.services && isaacCV.services.length) {
    for (const svc of isaacCV.services) {
      await prisma.service.create({
        data: {
          cvId: cvRecord.id,
          icon: svc.icon,
          alt: svc.alt,
          name: svc.name,
          description: svc.description,
        },
      });
    }
  }

  // 11) Seed Achievements
  if (isaacCV.achievements && isaacCV.achievements.length) {
    for (const ach of isaacCV.achievements) {
      await prisma.achievement.create({
        data: {
          cvId: cvRecord.id,
          icon: ach.icon,
          value: ach.value,
          description: ach.description,
        },
      });
    }
  }

  // 12) Seed Testimonials
  if (isaacCV.testimonials && isaacCV.testimonials.length) {
    for (const test of isaacCV.testimonials) {
      await prisma.testimonial.create({
        data: {
          cvId: cvRecord.id,
          quote: test.quote,
          image: test.image,
          name: test.name,
        },
      });
    }
  }

  // 13) Seed/Upsert and connect each Certification via the join model UserCertification
  if (isaacCV.certifications && isaacCV.certifications.length) {
    for (const cert of isaacCV.certifications) {
      const certRecord = await prisma.certification.upsert({
        where: { title: cert.title },
        update: {},
        create: {
          logo: cert.logo,
          alt: cert.alt,
          title: cert.title,
        },
      });

      await prisma.userCertification.upsert({
        where: {
          cvId_certificationId: {
            cvId: cvRecord.id,
            certificationId: certRecord.id,
          },
        },
        update: { href: cert.href },
        create: {
          href: cert.href,
          cvId: cvRecord.id,
          certificationId: certRecord.id,
        },
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error("Error during seeding:", error);
    prisma.$disconnect();
    process.exit(1);
  });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function wipeDB() {
  console.log("Wiping database...");

  try {
    // Step 1: Delete dependent records from CV first
    await prisma.education.deleteMany({});
    await prisma.experience.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.achievement.deleteMany({});
    await prisma.testimonial.deleteMany({});

    // Step 2: Delete the UserCertification join table records
    await prisma.userCertification.deleteMany({});

    // Step 3: Delete CVs (safe now that their dependents have been removed)
    await prisma.cV.deleteMany({});

    await prisma.uploadedFile.deleteMany({});
    
    // Step 4: Delete Assessments
    await prisma.assessment.deleteMany({});

    // Step 5: Delete Users
    await prisma.user.deleteMany({});

    // Step 6: Delete Clients
    await prisma.client.deleteMany({});

    // Step 7: Delete Certifications
    await prisma.certification.deleteMany({});

    console.log("Database wiped clean!");
  } catch (err) {
    console.error("Error wiping database:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

wipeDB();

import { prisma } from "@/lib/prisma";

export async function checkIfEmailIsViewer(email: string): Promise<boolean> {
  // Convert the email to lower case to ensure case-insensitive matching
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { userType: true },
  });

  // Return true only if the user exists and their type is GENERIC
  return user?.userType === "GENERIC";
}

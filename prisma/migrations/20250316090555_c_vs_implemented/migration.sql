/*
  Warnings:

  - You are about to drop the column `bio` on the `CV` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `CV` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - Added the required column `email` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImage` to the `CV` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileName` to the `CV` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Client_email_key";

-- AlterTable
ALTER TABLE "CV" DROP COLUMN "bio",
DROP COLUMN "experience",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "footerText" TEXT,
ADD COLUMN     "greetingDescription" TEXT,
ADD COLUMN     "greetingTitle" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "profileImage" TEXT NOT NULL,
ADD COLUMN     "profileName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "email";

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "yearRange" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "yearRange" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "href" TEXT NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CVCertifications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CVCertifications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CVCertifications_B_index" ON "_CVCertifications"("B");

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CVCertifications" ADD CONSTRAINT "_CVCertifications_A_fkey" FOREIGN KEY ("A") REFERENCES "CV"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CVCertifications" ADD CONSTRAINT "_CVCertifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

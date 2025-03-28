/*
  Warnings:

  - You are about to drop the column `href` on the `Certification` table. All the data in the column will be lost.
  - You are about to drop the `_CVCertifications` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[title]` on the table `Certification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Certification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_CVCertifications" DROP CONSTRAINT "_CVCertifications_A_fkey";

-- DropForeignKey
ALTER TABLE "_CVCertifications" DROP CONSTRAINT "_CVCertifications_B_fkey";

-- DropIndex
DROP INDEX "Certification_href_key";

-- AlterTable
ALTER TABLE "Certification" DROP COLUMN "href",
ADD COLUMN     "cVId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "_CVCertifications";

-- CreateTable
CREATE TABLE "UserCertification" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,

    CONSTRAINT "UserCertification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCertification_cvId_certificationId_key" ON "UserCertification"("cvId", "certificationId");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_title_key" ON "Certification"("title");

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_cVId_fkey" FOREIGN KEY ("cVId") REFERENCES "CV"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCertification" ADD CONSTRAINT "UserCertification_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "CV"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCertification" ADD CONSTRAINT "UserCertification_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

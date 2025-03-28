/*
  Warnings:

  - You are about to drop the column `certificationURL` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `pdfURL` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "certificationURL",
DROP COLUMN "pdfURL",
ADD COLUMN     "additionalFiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "certificate" TEXT,
ADD COLUMN     "executiveReport" TEXT,
ADD COLUMN     "technicalReport" TEXT;

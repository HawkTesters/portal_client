/*
  Warnings:

  - You are about to drop the column `additionalFiles` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `certificate` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `executiveReport` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `technicalReport` on the `Assessment` table. All the data in the column will be lost.
  - Added the required column `category` to the `UploadedFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UploadedFileCategory" AS ENUM ('CERTIFICATE', 'EXECUTIVE_REPORT', 'TECHNICAL_REPORT', 'ADDITIONAL_FILE');

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "additionalFiles",
DROP COLUMN "certificate",
DROP COLUMN "executiveReport",
DROP COLUMN "technicalReport";

-- AlterTable
ALTER TABLE "UploadedFile" ADD COLUMN     "category" "UploadedFileCategory" NOT NULL;

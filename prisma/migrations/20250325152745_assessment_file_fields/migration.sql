/*
  Warnings:

  - The `additionalFiles` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `certificate` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `executiveReport` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `technicalReport` column on the `Assessment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "additionalFiles",
ADD COLUMN     "additionalFiles" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "certificate",
ADD COLUMN     "certificate" JSONB,
DROP COLUMN "executiveReport",
ADD COLUMN     "executiveReport" JSONB,
DROP COLUMN "technicalReport",
ADD COLUMN     "technicalReport" JSONB;

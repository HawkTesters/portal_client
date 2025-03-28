/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[href]` on the table `Certification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deadline` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('ACTIVE', 'PROGRAMMED', 'ON_HOLD', 'COMPLETED');

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "AssessmentStatus" NOT NULL DEFAULT 'PROGRAMMED';

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_title_key" ON "Assessment"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Certification_href_key" ON "Certification"("href");

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");

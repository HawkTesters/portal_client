-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstTimeLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastAccess" TIMESTAMP(3);

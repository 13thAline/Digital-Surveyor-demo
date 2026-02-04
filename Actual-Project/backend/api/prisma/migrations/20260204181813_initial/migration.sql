/*
  Warnings:

  - You are about to drop the column `severity` on the `Damage` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Damage` table. All the data in the column will be lost.
  - Added the required column `damageType` to the `Damage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severityScore` to the `Damage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Damage" DROP COLUMN "severity",
DROP COLUMN "type",
ADD COLUMN     "damageType" TEXT NOT NULL,
ADD COLUMN     "depthEstimate" DOUBLE PRECISION,
ADD COLUMN     "severityScore" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "costMin" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "costMax" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborCost" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "tier" TEXT NOT NULL,

    CONSTRAINT "LaborCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartPrice" (
    "id" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LaborCost_city_key" ON "LaborCost"("city");

-- CreateIndex
CREATE UNIQUE INDEX "PartPrice_partName_key" ON "PartPrice"("partName");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

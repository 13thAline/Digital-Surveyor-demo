-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Damage" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "part" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,

    CONSTRAINT "Damage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Damage" ADD CONSTRAINT "Damage_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "MethodologyStep" (
    "id" SERIAL NOT NULL,
    "phase" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MethodologyStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MethodologyStep_phase_stepName_key" ON "MethodologyStep"("phase", "stepName");

/*
  Warnings:

  - You are about to drop the column `content` on the `MethodologyStep` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `MethodologyStep` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,phase,stepNumber]` on the table `MethodologyStep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `llmOutput` to the `MethodologyStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schemaValid` to the `MethodologyStep` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stepNumber` to the `MethodologyStep` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `phase` on the `MethodologyStep` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `input` on the `MethodologyStep` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `legalText` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('in_progress', 'completed', 'failed');

-- DropForeignKey
ALTER TABLE "MethodologyStep" DROP CONSTRAINT "MethodologyStep_projectId_fkey";

-- DropIndex
DROP INDEX "MethodologyStep_projectId_phase_stepName_key";

-- AlterTable
ALTER TABLE "MethodologyStep" DROP COLUMN "content",
DROP COLUMN "output",
ADD COLUMN     "confidenceScore" DECIMAL(3,2),
ADD COLUMN     "humanModified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "humanOutput" JSONB,
ADD COLUMN     "llmOutput" JSONB NOT NULL,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "schemaValid" BOOLEAN NOT NULL,
ADD COLUMN     "stepNumber" INTEGER NOT NULL,
DROP COLUMN "phase",
ADD COLUMN     "phase" INTEGER NOT NULL,
DROP COLUMN "input",
ADD COLUMN     "input" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "description" TEXT,
ADD COLUMN     "legalText" TEXT NOT NULL,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'in_progress',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "LLMProvider" (
    "id" SERIAL NOT NULL,
    "stepId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiCost" DECIMAL(10,6),
    "latencyMs" INTEGER,

    CONSTRAINT "LLMProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_llm_step" ON "LLMProvider"("stepId");

-- CreateIndex
CREATE INDEX "idx_step_project" ON "MethodologyStep"("projectId");

-- CreateIndex
CREATE INDEX "idx_step_phase" ON "MethodologyStep"("phase", "stepNumber");

-- CreateIndex
CREATE INDEX "idx_step_approved" ON "MethodologyStep"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "MethodologyStep_projectId_phase_stepNumber_key" ON "MethodologyStep"("projectId", "phase", "stepNumber");

-- AddForeignKey
ALTER TABLE "MethodologyStep" ADD CONSTRAINT "MethodologyStep_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LLMProvider" ADD CONSTRAINT "LLMProvider_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "MethodologyStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[projectId,phase,stepName]` on the table `MethodologyStep` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `MethodologyStep` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MethodologyStep_phase_stepName_key";

-- AlterTable
ALTER TABLE "MethodologyStep" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MethodologyStep_projectId_phase_stepName_key" ON "MethodologyStep"("projectId", "phase", "stepName");

-- AddForeignKey
ALTER TABLE "MethodologyStep" ADD CONSTRAINT "MethodologyStep_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

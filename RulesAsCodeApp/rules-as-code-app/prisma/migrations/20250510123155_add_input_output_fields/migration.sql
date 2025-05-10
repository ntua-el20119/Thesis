-- AlterTable
ALTER TABLE "MethodologyStep" ADD COLUMN     "input" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "output" TEXT NOT NULL DEFAULT '';

/*
  Warnings:

  - Added the required column `location` to the `work_entries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "work_entries" ADD COLUMN     "company" VARCHAR(160),
ADD COLUMN     "location" VARCHAR(160) NOT NULL;

/*
  Warnings:

  - Added the required column `props` to the `Component` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "props" JSONB NOT NULL;

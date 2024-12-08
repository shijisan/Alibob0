/*
  Warnings:

  - Added the required column `promotionEnd` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `promotionStart` to the `Banner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "promotionEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "promotionStart" TIMESTAMP(3) NOT NULL;

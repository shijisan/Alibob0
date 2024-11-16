/*
  Warnings:

  - Added the required column `shopDescription` to the `Seller` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `Seller` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "shopDescription" TEXT NOT NULL,
ADD COLUMN     "shopName" TEXT NOT NULL;

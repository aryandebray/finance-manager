/*
  Warnings:

  - You are about to drop the column `amount` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Budget` table. All the data in the column will be lost.
  - Added the required column `allocated` to the `Budget` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "amount",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "allocated" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "spent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

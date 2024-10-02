/*
  Warnings:

  - You are about to drop the column `platforms` on the `GameMetadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameMetadata" DROP COLUMN "platforms";

-- CreateTable
CREATE TABLE "GamePlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GamePlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataToPlatform" (
    "id" TEXT NOT NULL,
    "gameMetadataId" TEXT NOT NULL,
    "gamePlatformId" TEXT NOT NULL,

    CONSTRAINT "MetadataToPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamePlatform_name_key" ON "GamePlatform"("name");

-- AddForeignKey
ALTER TABLE "MetadataToPlatform" ADD CONSTRAINT "MetadataToPlatform_gameMetadataId_fkey" FOREIGN KEY ("gameMetadataId") REFERENCES "GameMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataToPlatform" ADD CONSTRAINT "MetadataToPlatform_gamePlatformId_fkey" FOREIGN KEY ("gamePlatformId") REFERENCES "GamePlatform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

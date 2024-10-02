/*
  Warnings:

  - You are about to drop the column `genre` on the `GameMetadata` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MetadataToPlatform" DROP CONSTRAINT "MetadataToPlatform_gameMetadataId_fkey";

-- DropForeignKey
ALTER TABLE "MetadataToPlatform" DROP CONSTRAINT "MetadataToPlatform_gamePlatformId_fkey";

-- AlterTable
ALTER TABLE "GameMetadata" DROP COLUMN "genre";

-- CreateTable
CREATE TABLE "GameGenre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GameGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetadataToGenre" (
    "id" TEXT NOT NULL,
    "gameMetadataId" TEXT NOT NULL,
    "gameGenreId" TEXT NOT NULL,

    CONSTRAINT "MetadataToGenre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameGenre_name_key" ON "GameGenre"("name");

-- AddForeignKey
ALTER TABLE "MetadataToPlatform" ADD CONSTRAINT "MetadataToPlatform_gameMetadataId_fkey" FOREIGN KEY ("gameMetadataId") REFERENCES "GameMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataToPlatform" ADD CONSTRAINT "MetadataToPlatform_gamePlatformId_fkey" FOREIGN KEY ("gamePlatformId") REFERENCES "GamePlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataToGenre" ADD CONSTRAINT "MetadataToGenre_gameMetadataId_fkey" FOREIGN KEY ("gameMetadataId") REFERENCES "GameMetadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetadataToGenre" ADD CONSTRAINT "MetadataToGenre_gameGenreId_fkey" FOREIGN KEY ("gameGenreId") REFERENCES "GameGenre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

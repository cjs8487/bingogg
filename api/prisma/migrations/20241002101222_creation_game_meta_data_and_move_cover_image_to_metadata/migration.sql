-- Step 1: Add the "metadataId" column to the "Game" table before dropping "coverImage"
ALTER TABLE "Game" ADD COLUMN "metadataId" TEXT;

-- Step 2: Create the "GameMetadata" table
CREATE TABLE "GameMetadata" (
    "id" TEXT NOT NULL,
    "coverImage" TEXT,
    "year" INTEGER,
    "genre" TEXT[],
    "platforms" TEXT[],
    "gameId" TEXT NOT NULL,
    CONSTRAINT "GameMetadata_pkey" PRIMARY KEY ("id")
);

-- Step 3: Create necessary indexes
CREATE UNIQUE INDEX "GameMetadata_id_key" ON "GameMetadata"("id");
CREATE UNIQUE INDEX "GameMetadata_gameId_key" ON "GameMetadata"("gameId");
CREATE UNIQUE INDEX "Game_metadataId_key" ON "Game"("metadataId");

-- Step 4: Add the foreign key relationship between "GameMetadata" and "Game"
ALTER TABLE "GameMetadata" ADD CONSTRAINT "GameMetadata_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Transfer the "coverImage" data from "Game" to "GameMetadata"
INSERT INTO "GameMetadata" ("id", "coverImage", "gameId")
SELECT gen_random_uuid(), "coverImage", "id"
FROM "Game"
WHERE "coverImage" IS NOT NULL;

-- Step 6: Update the "Game" table to set "metadataId" to the corresponding new "GameMetadata" entry
UPDATE "Game" g
SET "metadataId" = gm."id"
FROM "GameMetadata" gm
WHERE g."id" = gm."gameId";

-- Step 7: Now that the data has been migrated, drop the "coverImage" column from "Game"
ALTER TABLE "Game" DROP COLUMN "coverImage";

-- CreateTable
CREATE TABLE "_GameFavorites" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GameFavorites_AB_unique" ON "_GameFavorites"("A", "B");

-- CreateIndex
CREATE INDEX "_GameFavorites_B_index" ON "_GameFavorites"("B");

-- AddForeignKey
ALTER TABLE "_GameFavorites" ADD CONSTRAINT "_GameFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameFavorites" ADD CONSTRAINT "_GameFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

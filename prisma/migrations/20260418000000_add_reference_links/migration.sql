-- CreateTable
CREATE TABLE "reference_links" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "type" TEXT NOT NULL DEFAULT 'other',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reference_links_songId_idx" ON "reference_links"("songId");

-- AddForeignKey
ALTER TABLE "reference_links" ADD CONSTRAINT "reference_links_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

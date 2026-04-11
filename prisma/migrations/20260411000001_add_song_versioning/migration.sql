-- AlterTable
ALTER TABLE "songs" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "songs" ADD COLUMN "sourceId" TEXT;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

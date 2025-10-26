-- CreateTable
CREATE TABLE "TournamentPosition" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentPosition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TournamentPosition" ADD CONSTRAINT "TournamentPosition_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  
  
  // await prisma.coach.deleteMany({});

  await prisma.matchSet.deleteMany({});
  await prisma.tournamentPosition.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.tournamentGroup.deleteMany({});
  await prisma.tournament.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.player.deleteMany({});
  console.log("Data deleted");
}

main()
  .catch((e) => {
    console.error("Error deleting data:", e);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

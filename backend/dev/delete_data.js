import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
    // await prisma.player.deleteMany({});
    // await prisma.team.deleteMany({});
    // await prisma.attendance.deleteMany({});
    // await prisma.coach.deleteMany({});
    await prisma.tournament.deleteMany({});
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
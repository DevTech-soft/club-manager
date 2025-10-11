import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  // Leer archivo JSON
  const data = JSON.parse(
    fs.readFileSync("./jugadores_multi_stats.json", "utf-8")
  );

  for (const jugador of data) {
    // Crear jugador
    const player = await prisma.player.upsert({
      where: { document: jugador.document },
      update: {
        avatarUrl: jugador.avatarUrl ?? "https://fastly.picsum.photos/id/701/100/100.jpg?hmac=DkM2I14mP1yUemn4HWIV6ZAW3IwzkrscRdDnx5k3WBw",
      },
      create: {
        name: jugador.name,
        document: jugador.document,
        address: jugador.address ?? "Sin dirección",
        phone: jugador.phone,
        joinDate: new Date(jugador.joinDate),
        birthDate: new Date(jugador.birthDate),
        avatarUrl: jugador.avatarUrl ?? "",
        mainCategories: jugador.mainCategories,
        subCategory: jugador.subCategory,
        position: jugador.position,
      },
    });

    // Crear registros de estadísticas
    for (const record of jugador.statsHistory) {
      await prisma.statsRecord.create({
        data: {
          date: new Date(record.date),
          stats: record.stats, // se guarda en JSON
          playerId: player.id,
        },
      });
    }
  }

  console.log("✅ Datos insertados correctamente.");
}

main()
  .catch((e) => {
    console.error(e);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

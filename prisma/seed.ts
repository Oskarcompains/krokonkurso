import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@krokonkurso.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";

  // Create admin user
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin user: ${admin.email}`);

  // Create prizes
  const prizes = await Promise.all([
    prisma.prize.upsert({
      where: { id: "prize-1" },
      update: {},
      create: {
        id: "prize-1",
        name: "Tarjeta regalo Amazon 50€",
        description: "Tarjeta regalo electrónica de Amazon por valor de 50€",
        value: 50,
        quantity: 1,
      },
    }),
    prisma.prize.upsert({
      where: { id: "prize-2" },
      update: {},
      create: {
        id: "prize-2",
        name: "Auriculares inalámbricos",
        description: "Auriculares Bluetooth con cancelación de ruido",
        value: 79.99,
        quantity: 1,
      },
    }),
    prisma.prize.upsert({
      where: { id: "prize-3" },
      update: {},
      create: {
        id: "prize-3",
        name: "Taza personalizada KroKonkurso",
        description: "Taza cerámica con diseño exclusivo",
        value: 12,
        quantity: 3,
      },
    }),
  ]);

  console.log(`Created ${prizes.length} prizes`);

  // Create a sample contest for today
  const now = new Date();
  const today = new Date(now);
  today.setHours(18, 0, 0, 0); // 6pm today

  const openAt = new Date(now);
  openAt.setHours(17, 30, 0, 0); // 5:30pm today

  const contest = await prisma.contest.upsert({
    where: { id: "contest-sample" },
    update: {},
    create: {
      id: "contest-sample",
      title: "Concurso de bienvenida",
      description:
        "¡Bienvenido a KroKonkurso! Participa en este concurso de demostración.",
      scheduledAt: today,
      registrationOpenAt: openAt,
      status: "UPCOMING",
    },
  });

  // Assign prizes to contest
  await Promise.all(
    prizes.map((p, i) =>
      prisma.contestPrize.upsert({
        where: {
          contestId_rank: { contestId: contest.id, rank: i + 1 },
        },
        update: {},
        create: {
          contestId: contest.id,
          prizeId: p.id,
          rank: i + 1,
        },
      })
    )
  );

  console.log(`Sample contest created: ${contest.title}`);
  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("changeme-dev", 10);

  const coach = await prisma.user.upsert({
    where: { email: "coach@example.com" },
    update: {},
    create: {
      email: "coach@example.com",
      name: "เภสัชกร (designer)",
      role: Role.COACH,
      passwordHash,
      coachProfile: {
        create: { credentials: "เภสัชกร", bio: "Primary designer", isPrimary: true },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "ลูกค้าทดสอบ",
      role: Role.CLIENT,
      passwordHash,
      clientProfile: {
        create: {
          dateOfBirth: new Date("1976-01-01"),
          gender: "male",
          heightCm: 172,
          weightKg: 65,
          longevityGoal: "ชะลอความเสื่อม ดูแลพลังงานระยะยาว",
          interestTags: ["sleep", "energy", "fitness"],
          wearableType: "garmin",
          assignedCoachId: coach.id,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

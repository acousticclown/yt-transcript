import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Shivansh user
  const hashedPassword = await bcrypt.hash("notely123", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "shivanshsuryavanshi@gmail.com" },
    update: {},
    create: {
      id: "user-shivansh-001",
      email: "shivanshsuryavanshi@gmail.com",
      password: hashedPassword,
      name: "Shivansh Pratap",
      avatar: null, // Can add URL later
    },
  });

  console.log("✅ Created user:", user.name, user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@kamimotors.com";
  const password = process.env.ADMIN_PASSWORD || "KamiMotors2024!";
  const name = "Admin";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: { email, password: hashed, name },
  });

  console.log(`✅ Admin created: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Change this in .env before going live!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

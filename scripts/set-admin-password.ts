import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const email = process.env.ADMIN_EMAIL ?? "admin@ahma-immobilier.ci";
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 10) {
  console.error("Définissez ADMIN_PASSWORD (10 caractères minimum).");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const safePassword = password as string;
  const passwordHash = await bcrypt.hash(safePassword, 12);
  const admin = await prisma.admin.update({
    where: { email },
    data: { passwordHash },
  });
  console.log(`Mot de passe administrateur mis à jour pour ${admin.email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const fullName = process.env.SEED_ADMIN_FULL_NAME || "System Administrator";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@triplemelectric.ca";
  const payrollToEmail = process.env.PAYROLL_TO_EMAIL || null;
  const payrollCcEmails = (process.env.PAYROLL_CC_EMAILS || "")
    .split(/[\n,]/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: {
      email,
      fullName,
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash
    },
    create: {
      username,
      email,
      fullName,
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash
    }
  });

  await prisma.payrollEmailSettings.upsert({
    where: { key: "weekly-payroll" },
    update: {
      toEmail: payrollToEmail,
      ccEmails: payrollCcEmails
    },
    create: {
      key: "weekly-payroll",
      toEmail: payrollToEmail,
      ccEmails: payrollCcEmails
    }
  });

  console.log(`Admin ready: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

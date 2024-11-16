const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
   if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
      console.error("ERROR: Check your environment variables.");
      process.exit(1);
   }

   try {
      const existingAdmin = await prisma.admin.findFirst();
      if (existingAdmin) {
         console.log("Admin already exists.");
         process.exit(0);
      }

      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      const admin = await prisma.admin.create({
         data: {
            username: ADMIN_USERNAME,
            password: hashedPassword,
         },
      });

      console.log("Admin created successfully!", admin);

   } catch (error) {
      console.error("Error creating admin", error);
   } finally {
      await prisma.$disconnect();
   }
}

createAdmin();

import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Export the Prisma Client for use in other files
export default prisma;
  
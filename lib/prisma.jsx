import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient({
   log: ['query', 'info', 'warn', 'error'],
 });

// Export the Prisma Client for use in other files
export default prisma;
  
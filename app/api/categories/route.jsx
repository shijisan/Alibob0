import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust this path based on where you set up Prisma

export async function GET() {
  try {
    const categories = await prisma.category.findMany(); // Assuming you have a 'category' table
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.error({ message: error.message });
  }
}

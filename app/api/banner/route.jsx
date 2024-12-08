import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true, 
      },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json({ error: "Error fetching banners" }, { status: 500 });
  }
}

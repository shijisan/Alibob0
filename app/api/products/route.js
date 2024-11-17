import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc", 
      },
      select: { // Specify the fields to fetch
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true, // Include the image URL
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

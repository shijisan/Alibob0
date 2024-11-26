import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10); 

    const pageSize = 12; 
    const skip = (page - 1) * pageSize;

    const products = await prisma.product.findMany({
      skip, 
      take: pageSize, 
      orderBy: {
        createdAt: "desc", 
      },
      select: { 
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true, 
      },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

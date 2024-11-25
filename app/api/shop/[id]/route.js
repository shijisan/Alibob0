import prisma from "@/lib/prisma"; 
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;  

  try {
    // Add `await` to resolve the Prisma query correctly
    const seller = await prisma.seller.findUnique({
      where: { id },
      include: {
        products: true, 
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const productCount = seller.products.length;

    return NextResponse.json({ seller, productCount }, { status: 200 });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return NextResponse.json({ error: "Failed to fetch seller data" }, { status: 500 });
  }
}

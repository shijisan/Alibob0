import jwt from 'jsonwebtoken';
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const seller = await prisma.seller.findUnique({
      where: { userId },
      select: {
        id: true,
        isVerified: true,
        shopName: true,
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(seller, { status: 200 });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return NextResponse.json({ error: "Failed to fetch seller data" }, { status: 500 });
  }
}
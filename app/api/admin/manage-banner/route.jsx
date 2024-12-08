import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const verifyAdminToken = (req) => {
  const token = req.headers.get("Authorization")?.split(" ")[1]; 
  if (!token) {
    throw new Error("No token provided in Authorization header");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "ADMIN") {
      throw new Error("Not authorized");
    }
    return decoded.id; 
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export async function GET(req) {
  try {
    const adminId = verifyAdminToken(req);

    const banners = await prisma.banner.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        seller: {
          select: {
            shopName: true,
            id: true,
          },
        },
      },
    });

    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    console.error("Error fetching banner data:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { bannerId, action } = await req.json(); 

    if (!bannerId || !action) {
      return NextResponse.json({ error: "Missing banner ID or action" }, { status: 400 });
    }

    if (action !== "accept" && action !== "deny") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const adminId = verifyAdminToken(req);

    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: {
        isActive: action === "accept", 
        isDeleted: action === "deny", 
      },
    });

    return NextResponse.json(updatedBanner, { status: 200 });
  } catch (error) {
    console.error("Error updating banner status:", error);
    return NextResponse.json({ error: "Failed to update banner status" }, { status: 500 });
  }
}

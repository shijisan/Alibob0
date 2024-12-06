import prisma from "@/lib/prisma"; // Adjust the import based on your project structure
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const sellerToken = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!sellerToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { isDeleted: false },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: { id: true, name: true }, // Include user details
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { orderId, action } = await req.json();
    if (!orderId || !["accept", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: action === "accept" ? "accepted" : "denied",
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Update the path as per your setup

export async function GET(req, { params }) {
  const { id } = params; // Extract the order ID from the route
  const authHeader = req.headers.get("authorization");

  // Check if the token is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    // Verify the token logic here (implement token validation as per your setup)

    // Fetch the order details from the database
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }, // Fetch user details
        },
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Check if the order exists
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Format the response
    const orderDetails = {
      id: order.id,
      user: {
        name: order.user.name,
        email: order.user.email,
      },
      items: order.items.map((item) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      address: {
        line1: order.addressLine1,
        line2: order.addressLine2,
        city: order.city,
        province: order.province,
        postalCode: order.postalCode,
        country: order.country,
      },
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({ order: orderDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { id } = await params;
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token logic here

    const { action } = await req.json();

    // Update order based on action
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: action === "accept" ? "shipping" : "canceled",
      },
    });

    return NextResponse.json({ order: updatedOrder }, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

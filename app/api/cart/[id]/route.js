import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const verifyToken = (req) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  console.log(token);
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    return decoded.userId;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export async function PATCH(req, { params }) {
  try {
    const userId = verifyToken(req);
    const { id } = await params; 
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Cart item not found or unauthorized" }, { status: 404 });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json(
      { message: "Cart item updated successfully", cartItem: updatedCartItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart item:", error.message);
    return NextResponse.json({ error: error.message || "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const userId = verifyToken(req);
    const { id } = await params; 

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Cart item not found or unauthorized" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cart item removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting cart item:", error.message);
    return NextResponse.json({ error: error.message || "Failed to delete cart item" }, { status: 500 });
  }
}

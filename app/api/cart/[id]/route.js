import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Helper: Verify token and get user ID
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

// PATCH: Update item quantity in the cart
export async function PATCH(req, { params }) {
  try {
    const userId = verifyToken(req);
    const { id } = params; // Get the item ID from the URL parameter
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Check if the item exists in the user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Cart item not found or unauthorized" }, { status: 404 });
    }

    // Update the item quantity
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

// DELETE: Remove item from the cart
export async function DELETE(req, { params }) {
  try {
    const userId = verifyToken(req);
    const { id } = params; // Get the item ID from the URL parameter

    // Check if the item exists in the user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return NextResponse.json({ error: "Cart item not found or unauthorized" }, { status: 404 });
    }

    // Remove the item from the cart
    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Cart item removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting cart item:", error.message);
    return NextResponse.json({ error: error.message || "Failed to delete cart item" }, { status: 500 });
  }
}

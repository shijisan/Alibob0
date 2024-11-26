import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const verifyToken = (req) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export async function GET(req) {
  try {
    const userId = verifyToken(req);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const formattedCartItems = cart?.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    })) || [];

    return NextResponse.json({ cartItems: formattedCartItems }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    return NextResponse.json({ error: error.message || "Failed to fetch cart items" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const userId = verifyToken(req);

    const { productId, quantity } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return NextResponse.json({ message: "Added to cart!" }, { status: 200 });
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    return NextResponse.json({ error: error.message || "Failed to add to cart" }, { status: 500 });
  }
}

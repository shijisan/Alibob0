import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token and decode
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification failed:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const userId = decoded.userId;
    console.log("Decoded userId:", userId);

    // Fetch seller based on userId
    const seller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      console.log("Seller not found for userId:", userId);
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Log seller details for debugging
    console.log("Seller details:", seller);

    // Parse request body
    const body = await req.json();
    console.log("Request body:", body);

    const { id, name, description, price } = body;
    console.log("Parsed fields - id:", id, "name:", name, "description:", description, "price:", price);

    if (!id || !name || !description || !price) {
      console.error("Missing fields in the request body");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Parse and validate price
    const parsedPrice = parseFloat(price);
    console.log("Parsed price:", parsedPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.error("Invalid price value:", parsedPrice);
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      console.log("Product not found with id:", id);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate seller authorization for the product
    if (product.sellerId !== seller.id) {
      console.log(
        `Authorization error: Seller ${seller.id} does not own product ${id}`
      );
      return NextResponse.json({ error: "You are not authorized to update this product" }, { status: 403 });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parsedPrice,
      },
    });

    console.log("Product updated successfully:", updatedProduct);
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}



export async function DELETE(req, { params }) {
  const { id } = await params;

  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const seller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Check if the product exists and if it belongs to the seller
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.sellerId !== seller.id) {
      return NextResponse.json({ error: "You are not authorized to delete this product" }, { status: 403 });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export async function PATCH(req, { params }) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Admin token is required" }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (decodedToken.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Error updating category" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Admin token is required" }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    if (decodedToken.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Error deleting category" }, { status: 500 });
  }
}

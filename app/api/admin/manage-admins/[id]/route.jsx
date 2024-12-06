import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyAdmin(req) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export async function PATCH(req, { params }) {
  const admin = await verifyAdmin(req);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;
    const { username, password } = await req.json();

    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        username: username ?? existingAdmin.username,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return NextResponse.json({ message: "Admin updated successfully", admin: { id: updatedAdmin.id, username: updatedAdmin.username } });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const admin = await verifyAdmin(req);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;

    const existingAdmin = await prisma.admin.findUnique({ where: { id } });
    if (!existingAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

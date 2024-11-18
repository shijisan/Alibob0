import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the path to your Prisma client
import jwt from "jsonwebtoken";

export async function GET(request) {
  const token = request.headers.get("Authorization")?.split(" ")[1]; // Extract the token from the Authorization header

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id } = decoded;

    // Fetch account information from the database using Prisma
    const account = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // Assuming you have roles like 'BUYER', 'SELLER', etc.
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error verifying token or fetching account:", error);
    return NextResponse.json(
      { message: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }
}

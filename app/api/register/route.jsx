import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Extract the data from the request body
    const { email, password, name, isSeller } = await req.json(); // Adding isSeller flag to decide role

    // Check if all required fields are provided
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: isSeller ? "SELLER" : "BUYER", // Set role based on isSeller flag
      },
    });

    // Create the Buyer record if the user is a buyer
    if (!isSeller) {
      await prisma.buyer.create({
        data: {
          userId: newUser.id, // Link the buyer to the user
        },
      });
    }

    // If the user is a seller, create the seller profile
    if (isSeller) {
      await prisma.seller.create({
        data: {
          userId: newUser.id,
          shopName: "",  // Default empty shop name
          shopDescription: "",  // Default empty description
          isVerified: false,  // Default to false until verified by admin
        },
      });
    }

    // Generate the JWT token with userId and role
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return the token and success status
    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    // Log any errors and return a server error response
    console.error("Error during registration:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

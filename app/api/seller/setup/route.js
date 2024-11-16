import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let userId;

  // Verify the token and extract userId
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual JWT secret
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token: Missing user ID' }, { status: 401 });
    }
    userId = decoded.userId; // Extract the userId from the decoded token
  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Extract the fields from the request body
  const { shopName, shopDescription } = await req.json();

  // Validation checks for required fields
  if (!shopName || !shopDescription) {
    return NextResponse.json({ error: 'Shop name and description are required' }, { status: 400 });
  }

  try {
    // Check if the user already has a seller account before creating a new one
    const existingSeller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (existingSeller) {
      return NextResponse.json({ error: 'User already has a seller account' }, { status: 400 });
    }

    // Create a new seller
    const newSeller = await prisma.seller.create({
      data: {
        userId,
        shopName,
        shopDescription,
        isVerified: false, // default to false; set later by admin
      },
    });

    return NextResponse.json(newSeller, { status: 201 });
  } catch (error) {
    console.error('Error creating seller:', error);
    return NextResponse.json({ error: 'Failed to create seller' }, { status: 500 });
  }
}

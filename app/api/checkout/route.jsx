// pages/api/checkout.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client setup in lib/prisma.js
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Get the data from the request body
    const { items, addressLine1, addressLine2, city, province, postalCode, country } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        userId,
        addressLine1,
        addressLine2,
        city,
        province,
        postalCode,
        country,
        status: 'COORDINATING_WITH_SHIPPING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price, // Assuming price comes from the frontend
          })),
        },
      },
    });

    // Optionally, you can update the stock of products here if needed

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

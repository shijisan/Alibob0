import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    console.log('Incoming request:', req);

    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification error:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    console.log('Decoded JWT:', decoded);

    const { items, addressLine1, addressLine2, city, province, postalCode, country } = await req.json();

    console.log('Request body:', { items, addressLine1, addressLine2, city, province, postalCode, country });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    if (!addressLine1 || !city || !province || !postalCode || !country) {
      return NextResponse.json({ error: 'Please fill out all required address fields' }, { status: 400 });
    }

    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log('Total amount:', totalAmount);

    const orderData = {
      userId,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      country,
      totalAmount,
      status: 'coordinating_with_shipping',
      paymentStatus: 'pending',
      items: {
        create: items.map(item => ({
          productId: item.productId, 
          quantity: item.quantity,  
          price: item.price,
        })),
      },
    };

    console.log('Items before Prisma query:', items);

    console.log('Prisma Order Data:', JSON.stringify(orderData, null, 2));

    let order;
    try {
      order = await prisma.order.create({
        data: orderData,
        include: {
          items: true, 
        },
      });
    } catch (prismaError) {
      console.error('Prisma Error during order creation:', prismaError);
      return NextResponse.json({ error: 'Database error during order creation', details: prismaError.message }, { status: 500 });
    }

    console.log('Order created:', JSON.stringify(order, null, 2));

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error during checkout:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    } else if (error.name === 'PrismaClientValidationError') {
      console.error('Prisma validation error:', error);
      return NextResponse.json({ error: 'Database validation failed' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

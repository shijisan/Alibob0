import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken'; // Import JWT library

export async function GET(req, { params }) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', ''); 

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    const userId = decoded.id;

    const orders = await prisma.order.findMany({
      where: {
        userId: userId, 
      },
      orderBy: {
        createdAt: 'desc', 
      },
      take: 2,
      select: {
        id: true,
        status: true,
        totalAmount: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

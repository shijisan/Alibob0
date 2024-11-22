import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

const verifyToken = (req) => {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    throw new Error('No token provided in Authorization header');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export async function DELETE(req, { params }) {
  try {
    const userId = verifyToken(req);
    const cartItemId = params.id;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    if (cartItem.cart.buyerId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: 'Cart item removed' }, { status: 200 });
  } catch (error) {
    console.error('Error during DELETE request:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to remove cart item' }, { status: 500 });
  }
}

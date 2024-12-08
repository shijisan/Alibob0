import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { bannerId } = params; 
  try {
    const deletedBanner = await prisma.banner.delete({
      where: { id: bannerId },
    });

    return NextResponse.json(deletedBanner, { status: 200 });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}

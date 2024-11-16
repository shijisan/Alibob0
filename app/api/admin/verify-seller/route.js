import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
   const token = req.headers.get("Authorization");
   if (!token || !token.startsWith("Bearer ")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
   }

   try {
      const unverifiedSellers = await prisma.seller.findMany({
         where: { isVerified: false },
         include: { user: true },
      });

      return new NextResponse(JSON.stringify({ sellers: unverifiedSellers }), {
         status: 200,
         headers: {
            "Content-Type": "application/json",
         },
      });
   } catch (error) {
      return new NextResponse(JSON.stringify({ error: "Failed to fetch sellers" }), { status: 500 });
   }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
   const { id } = params;  // Get seller's ID from params

   try {
      // Update seller's verification status
      const seller = await prisma.seller.update({
         where: { id },
         data: { isVerified: true },
      });

      // Update user's role to SELLER
      const user = await prisma.user.update({
         where: { id: seller.userId },
         data: { role: "SELLER" },
      });

      return new NextResponse(JSON.stringify({ message: "Seller verified successfully" }), {
         status: 200,
         headers: {
            "Content-Type": "application/json",
         },
      });
   } catch (error) {
      console.error("Error verifying seller:", error);
      return new NextResponse(
         JSON.stringify({ error: "Failed to verify seller" }),
         { status: 500 }
      );
   }
}

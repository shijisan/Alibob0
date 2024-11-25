import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";  
import prisma from "@/lib/prisma"; 

export async function GET(req) {
   const token = req.headers.get("Authorization")?.replace("Bearer ", "");

   if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  

      const admin = await prisma.admin.findUnique({
         where: { id: decoded.id },
         select: {
            id: true,
            username: true,
            createdAt: true,
         },
      });

      if (!admin) {
         return NextResponse.json({ error: "Admin not found" }, { status: 404 });
      }

      return NextResponse.json({ admin }, { status: 200 });
   } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
   }
}

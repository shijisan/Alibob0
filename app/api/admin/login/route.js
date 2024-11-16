import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import next from "next";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req){
   try{
      const {username, password} = await req.json();

      const admin = await prisma.admin.findUnique({
         where: {username},
      });

      if (!admin){
         return NextResponse.json({error: "Admin not found"}, {status: 404});
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if(!isPasswordValid){
         return NextResponse.json({error: "Invalid credentials"}, {status: 401});
      }

      const token = jwt.sign({id: admin.id, role: "ADMIN"}, JWT_SECRET, {
         expiresIn: "1h",
      });

      return NextResponse.json({token});
   }
   catch(error){
      return NextResponse.json({error: "Internal server error"}, {status:500});
   }
}
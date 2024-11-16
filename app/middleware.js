import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function middleware(req) {
   const { pathname } = req.nextUrl;
   const token = req.headers.get('Authorization')?.split(' ')[1];

   if (!token) {
      if (pathname.startsWith("/admin")) {
         return NextResponse.redirect(new URL("/admin/login", req.url));
      } else if (pathname.startsWith("/account")) {
         return NextResponse.redirect(new URL("/login", req.url));
      } else if (pathname.startsWith("/seller")) {
         return NextResponse.redirect(new URL("/login", req.url));
      }
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (pathname.startsWith("/admin")) {
         if (decoded.role !== 'admin') {
            return NextResponse.redirect(new URL("/admin/login", req.url));
         }
      }

      if (pathname.startsWith("/account")) {
         if (decoded.role !== 'user' && decoded.role !== 'seller') {
            return NextResponse.redirect(new URL("/login", req.url));
         }
      }

      if (pathname.startsWith("/seller")) {
         if (decoded.role !== 'seller') {
            return NextResponse.redirect(new URL("/login", req.url)); 
         }

         const user = await prisma.user.findUnique({ where: { id: decoded.id } });

         if (user && user.shopName && user.shopDescription && !user.isVerified) {
            return NextResponse.redirect(new URL("/seller/account", req.url));
         }

         if (!user || !user.shopName || !user.shopDescription) {
            return NextResponse.redirect(new URL("/seller/setup", req.url));
         }
      }

   } catch (error) {
      console.error("JWT verification error:", error);
      return NextResponse.redirect(new URL("/login", req.url)); 
   }

   return NextResponse.next();
}

export const config = {
   matcher: ["/admin/:path*", "/account/:path*", "/seller/:path*"],
};

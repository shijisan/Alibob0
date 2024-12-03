import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
   try {
      const { email, password } = await req.json();

      if (!email || !password) {
         return new Response(
            JSON.stringify({ error: "Email and password are required" }),
            { status: 400 }
         );
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
         return new Response(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401 }
         );
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
         return new Response(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401 }
         );
      }

      const token = jwt.sign(
         { id: user.id, email: user.email, role: user.role, userId: user.id }, // Added userId here
         process.env.JWT_SECRET,
         { expiresIn: "1h" }
      );

      return new Response(
         JSON.stringify({
            token,
            user: { email: user.email, name: user.name, role: user.role },
         }),
         { status: 200, headers: { "Content-Type": "application/json" } }
      );
   } catch (error) {
      console.error("Login error:", error);
      return new Response(
         JSON.stringify({ error: "Internal server error" }),
         { status: 500 }
      );
   }
}

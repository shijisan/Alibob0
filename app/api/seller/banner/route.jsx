import jwt from 'jsonwebtoken';
import prisma from "@/lib/prisma";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const verifyToken = (req) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided in Authorization header");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId; 
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export async function POST(req) {
  try {
    console.log("Banner creation POST request received");

    const userId = verifyToken(req);

    const seller = await prisma.seller.findUnique({
      where: { userId },
      select: { id: true }, 
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const title = formData.get("title");
    const image = formData.get("image");
    const promotionStart = formData.get("promotionStart");
    const promotionEnd = formData.get("promotionEnd");

    if (!title || !image || !promotionStart || !promotionEnd) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const imageType = image.type.split("/")[0];
    if (imageType !== "image") {
      return NextResponse.json({ error: "Uploaded file is not an image" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    let uploadResult;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder: "alibobo/banner-requests", resource_type: "auto" },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(buffer);
      });
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }

    const uploadedImageUrl = uploadResult.secure_url;

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl: uploadedImageUrl,
        isActive: false,
        isDeleted: false,
        promotionStart: new Date(promotionStart),
        promotionEnd: new Date(promotionEnd),
        sellerId: seller.id,
      },
    });

    console.log("Banner created:", banner);
    return NextResponse.json({ message: "Banner created successfully", banner }, { status: 201 });
  } catch (error) {
    console.error("Error during banner creation:", error);
    return NextResponse.json({ error: error.message || "Error during banner creation" }, { status: 500 });
  }
}

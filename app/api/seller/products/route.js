import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to verify JWT token
const verifyToken = (req) => {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// POST method for creating a product
export async function POST(req) {
  try {
    console.log("POST request received");

    const userId = verifyToken(req);
    console.log("User ID:", userId);

    const seller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      console.log("Seller not found");
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const imageFile = formData.get("image");

    console.log("Form data received:", { name, description, price, imageFile });

    if (!name || !description || !price || !imageFile) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.log("Invalid price value");
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    let uploadedImageUrl = "";
    if (typeof imageFile === "string") {
      // If imageFile is already a URL (string)
      uploadedImageUrl = imageFile;
      console.log("Using provided image URL:", uploadedImageUrl);
    } else if (imageFile) {
      // If imageFile is a File object, upload to Cloudinary
      console.log("Uploading image...");
      try {
        const buffer = await imageFile.arrayBuffer();
        const file = Buffer.from(buffer);

        const cloudinaryUploadResult = await cloudinary.v2.uploader.upload(file, {
          folder: "products/mainImage",
          resource_type: "auto",
        });

        if (cloudinaryUploadResult?.secure_url) {
          uploadedImageUrl = cloudinaryUploadResult.secure_url;
          console.log("Image uploaded successfully:", uploadedImageUrl);
        } else {
          console.log("Image upload failed");
          return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
        }
      } catch (cloudinaryError) {
        console.log("Cloudinary upload error:", cloudinaryError.message);
        return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
      }
    }

    console.log("Creating product in the database...");
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        imageUrl: uploadedImageUrl,
        sellerId: seller.id,
      },
    });

    console.log("Product created successfully:", product);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error during POST request:", error.message);
    return NextResponse.json({ error: error.message || "Error creating product" }, { status: 500 });
  }
}

// GET method for retrieving all products for a specific seller
export async function GET(req) {
  try {
    console.log("GET request received");

    const userId = verifyToken(req);  // Verifying the JWT token
    console.log("User ID:", userId);

    const seller = await prisma.seller.findUnique({
      where: { userId },  // Fetch the seller using the userId from the token
      include: { products: true },  // Include the seller's products in the result
    });

    if (!seller) {
      console.log("Seller not found");
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    console.log("Seller found, returning products");
    return NextResponse.json({ products: seller.products }, { status: 200 });  // Return the list of products
  } catch (error) {
    console.log("Error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to verify JWT token
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

// POST method for creating a product
export async function POST(req) {
  try {
    console.log("POST request received");

    // Verify user token and get userId
    const userId = verifyToken(req);
    console.log("User ID:", userId);

    // Fetch the seller associated with the user
    const seller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      console.log("Seller not found for User ID:", userId);
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const imageFile = formData.get("image");

    console.log("Form data received:", { name, description, price, imageFile });

    // Validate inputs
    if (!name || !description || !price || !imageFile) {
      console.log("Missing required fields");
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.log("Invalid price value:", price);
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    // Handle image upload
    let uploadedImageUrl = "";
    if (imageFile) {
      console.log("Uploading image to Cloudinary...");
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      try {
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream(
            { folder: "alibobo/products/mainImage", resource_type: "auto" },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(buffer); // End the stream with the buffer
        });

        uploadedImageUrl = uploadResult.secure_url;
        console.log("Image uploaded successfully:", uploadedImageUrl);
      } catch (error) {
        console.error("Cloudinary upload error:", error.message);
        return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
      }
    }

    // Create the product in the database
    console.log("Saving product to the database...");
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

    // Verify user token and get userId
    const userId = verifyToken(req);
    console.log("User ID:", userId);

    // Fetch seller and their products
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: { products: true },
    });

    if (!seller) {
      console.log("Seller not found for User ID:", userId);
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Include image URLs directly in the response if additional processing is needed
    console.log("Seller and products found, returning response");
    const products = seller.products.map((product) => ({
      ...product,
      imageUrl: product.imageUrl, // Use the existing URL from the database
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error during GET request:", error.message);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

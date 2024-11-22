import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import cloudinary from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to verify JWT token
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

// POST handler for creating a product
export async function POST(req) {
  try {
    console.log("Product creation POST request received");

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const image = formData.get("image");
    const categoryId = formData.get("categoryId");

    // Validate required fields
    if (!name || !description || !price || !image || !categoryId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    // Validate image
    const imageType = image.type.split("/")[0];
    if (imageType !== "image") {
      return NextResponse.json({ error: "Uploaded file is not an image" }, { status: 400 });
    }

    // Verify the token and fetch the seller
    const userId = verifyToken(req);
    const seller = await prisma.seller.findUnique({
      where: { userId },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    // Upload image to Cloudinary
    const buffer = Buffer.from(await image.arrayBuffer());
    let uploadResult;
    try {
      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
          { folder: "alibobo/products/mainImage", resource_type: "auto" },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(buffer);
      });
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }

    const uploadedImageUrl = uploadResult.secure_url;

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json({ error: "Invalid categoryId, category not found" }, { status: 400 });
    }

    // Create product for the seller
    const createdProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        sellerId: seller.id,
        categoryId,
        imageUrl: uploadedImageUrl,
      },
    });

    console.log("Product created:", createdProduct);
    return NextResponse.json({ product: createdProduct }, { status: 201 });
  } catch (error) {
    console.error("Error during product creation:", error);
    return NextResponse.json({ error: error.message || "Error during product creation" }, { status: 500 });
  }
}

// GET handler for fetching seller's products
export async function GET(req) {
  try {
    const userId = verifyToken(req);

    // Fetch seller and their products
    const seller = await prisma.seller.findUnique({
      where: { userId },
      include: {
        products: { include: { category: true } },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const products = seller.products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.category?.name || "No category",
    }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
  }
}

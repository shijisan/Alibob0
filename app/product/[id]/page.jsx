"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetailsPage({ params }) {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = await params; // Extract ID from params

        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProduct();
  }, [params]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Error: {error}</h1>
        <button
          className="p-2 mt-4 text-white bg-blue-500 rounded"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
      <img
        src={product.imageUrl || "https://placehold.co/400x300"}
        alt={product.name}
        className="w-full h-auto mb-4 rounded"
      />
      <p className="mb-4 text-lg">{product.description}</p>
      <p className="text-lg font-semibold">Price: ${product.price.toFixed(2)}</p>
      <button
        className="p-2 mt-4 text-white bg-blue-500 rounded"
        onClick={() => router.back()}
      >
        Go Back
      </button>
    </div>
  );
}

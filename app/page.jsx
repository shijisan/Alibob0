"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <section className="pt-[10vh] z-0">
        <HeroCarousel />
      </section>

      <section className="px-5 lg:px-32 md:px-16 text-blue-950">
        <section className="flex flex-row w-full h-[25vh] -mt-4 gap-4">
          <div className="z-10 w-2/6 h-full p-5 bg-white rounded shadow">
            <div className="flex items-center justify-between">
              <h3>Shop by Category</h3>
              <a
                className="text-sm text-pink-300 hover:underline"
                href="/categories"
              >
                See More
              </a>
            </div>
          </div>
          <div className="z-10 w-4/6 h-full p-5 bg-white rounded shadow"></div>
        </section>

        <section className="min-h-screen p-5 mt-4 bg-white rounded shadow">
          <h3 className="mb-4 text-xl font-bold">Suggested Products:</h3>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <a
                  href={`/product/${product.id}`}
                  key={product.id} 
                  className="block"
                >
                  <div className="p-4 bg-gray-100 rounded shadow hover:shadow-md">
                    <img
                      src={product.imageUrl || "https://placehold.co/200x150"} 
                      alt={product.name}
                      className="object-cover w-full h-auto mb-2 bg-white border rounded aspect-square"
                      height={250}
                      width={250}
                    />
                    <h4 className="text-lg font-semibold">{product.name}</h4>
                    <p className="mb-1 text-sm text-gray-500">
                      {product.description}
                    </p>
                    <p className="font-bold text-blue-700">${product.price}</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found</p>
          )}
        </section>
      </section>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  return (
    <>
      <section className="pt-[10vh] h-full z-0">
        <HeroCarousel />
      </section>

      <section className="px-5 lg:px-32 md:px-16 text-blue-950">
        <section className="flex md:flex-row flex-col w-full lg:h-[25vh] -mt-4 gap-4">
          <div className="z-10 w-full h-full p-5 bg-white rounded shadow lg:w-2/6 md:w-1/2">
            <div className="flex items-center justify-between">
              <h3>Shop by Category</h3>
              <a
                className="text-sm text-pink-300 hover:underline"
                href="/categories"
              >
                See More
              </a>
            </div>

            {/* Display categories */}
            <div className="grid grid-cols-3 gap-4 mt-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-gray-100 rounded shadow hover:shadow-md"
                  >
                    <a href={`/search?category=${category.name}`} className="text-lg font-semibold text-center">{category.name}</a>
                  </div>
                ))
              ) : (
                <p>No categories found</p>
              )}
            </div>
          </div>
          <div className="z-10 w-full h-full p-5 bg-white rounded shadow lg:w-4/6 md:w-1/2"></div>
        </section>

        <section className="min-h-screen p-5 mt-4 bg-white rounded shadow">
          <h3 className="mb-4 text-xl font-bold">Suggested Products:</h3>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <a
                  href={`/product/${product.id}`}
                  key={product.id}
                  className="block"
                >
                  <div className="p-4 bg-gray-100 rounded shadow hover:shadow-md">
                    <img
                      src={product.imageUrl}
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

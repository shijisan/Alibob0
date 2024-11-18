"use client";

import { useEffect, useState, Suspense } from "react";

const SearchResults = ({ searchQuery, minPrice, maxPrice }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = new URLSearchParams({
          ...(searchQuery && { search: searchQuery }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
        }).toString();

        const res = await fetch(`/api/products/search?${query}`);

        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await res.json();

        if (data.length === 0) {
          setProducts([]);
          setError("No products match your search criteria.");
          return;
        }

        setProducts(data);
        setError("");
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      }
    };

    fetchProducts();
  }, [searchQuery, minPrice, maxPrice]);

  return (
    <div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.length > 0 ? (
          products.map((product) => (
            <a
              href={`/product/${product.id}`}
              key={product.id}
              className="block"
            >
              <div className="flex flex-col p-4 border rounded shadow-sm hover:shadow-lg">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover mb-2 bg-white border rounded aspect-square"
                  height={250}
                  width={250}
                />
                <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
                <p className="mb-2 text-sm text-gray-600">{product.description}</p>
                <p className="font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </a>
          ))
        ) : (
          !error && <p className="text-gray-500">No products found</p>
        )}
      </div>
    </div>
  );
};

export default function SuspendedSearchResults(props) {
  return (
    <Suspense fallback={<p>Loading search results...</p>}>
      <SearchResults {...props} />
    </Suspense>
  );
}

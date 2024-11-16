"use client";

import { useState } from "react";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setProducts([]); // Reset products for a new search

    try {
      // Dynamically build query parameters
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
        setError("No products match your search criteria.");
      }

      setProducts(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Search Products</h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      <form onSubmit={handleSearch} className="grid grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="col-span-2 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="col-span-4 p-2 text-white bg-blue-500 rounded"
        >
          Search
        </button>
      </form>

      {products.length > 0 ? (
        <table className="w-full border table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Description</th>
              <th className="px-4 py-2 border">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2 border">{product.name}</td>
                <td className="px-4 py-2 border">{product.description}</td>
                <td className="px-4 py-2 border">${product.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p className="text-gray-500">No products found</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "", price: "" });
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false); // Track if in edit mode
  const [editProductId, setEditProductId] = useState(null); // Track product to be edited

  // Fetch products when the component mounts
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/seller/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure price is a valid float
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    const url = editMode ? `/api/seller/products/${editProductId}` : "/api/seller/products";
    const method = editMode ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: price, // Send the price as a float
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);  // Log the error response for debugging
        throw new Error(editMode ? "Failed to update product" : "Failed to add product");
      }

      const responseData = await res.json();
      console.log("Response data:", responseData);

      setFormData({ name: "", description: "", price: "" });
      setEditMode(false);
      setEditProductId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  // Fill the form with product data for editing
  const editProduct = (product) => {
    setFormData({ name: product.name, description: product.description, price: product.price });
    setEditMode(true);
    setEditProductId(product.id);
  };

  // Delete product by ID
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Your Products</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Product Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="p-2 mt-4 text-white bg-blue-500 rounded">
          {editMode ? "Update Product" : "Add Product"}
        </button>
      </form>

      <table className="w-full border table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Description</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-2 border">{product.name}</td>
              <td className="px-4 py-2 border">{product.description}</td>
              <td className="px-4 py-2 border">${product.price.toFixed(2)}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => editProduct(product)}
                  className="mr-2 text-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

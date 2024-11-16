"use client";

import { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false); // To track if the modal is in edit mode
  const [editProductId, setEditProductId] = useState(null); // To store the product being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility

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

    const { name, description, price, image } = formData;
    if (!name || !description || !price || !image) {
      setError("Please fill in all fields.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    let imageUrl = "";
    if (image) {
      const formDataForCloudinary = new FormData();
      formDataForCloudinary.append("file", image);
      formDataForCloudinary.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      try {
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formDataForCloudinary,
          }
        );

        const cloudinaryData = await cloudinaryRes.json();
        if (cloudinaryData.error) {
          throw new Error(cloudinaryData.error.message);
        }

        imageUrl = cloudinaryData.secure_url;
      } catch (error) {
        setError("Failed to upload image.");
        return;
      }
    }

    const url = editMode ? `/api/seller/products/${editProductId}` : "/api/seller/products";
    const method = editMode ? "PATCH" : "POST";

    try {
      const formDataForServer = new FormData();
      formDataForServer.append("name", name);
      formDataForServer.append("description", description);
      formDataForServer.append("price", parsedPrice);
      formDataForServer.append("image", image ? imageUrl : "");

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataForServer,
      });

      if (!res.ok) {
        throw new Error(editMode ? "Failed to update product" : "Failed to add product");
      }

      setFormData({ name: "", description: "", price: "", image: null });
      setEditMode(false);
      setEditProductId(null);
      setIsModalOpen(false); // Close modal after submission
      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  const editProduct = (product) => {
    setFormData({ name: product.name, description: product.description, price: product.price, image: null });
    setEditMode(true);
    setEditProductId(product.id);
    setIsModalOpen(true); // Open modal for editing
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

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

  const openAddProductModal = () => {
    setEditMode(false); // Set to add mode
    setFormData({ name: "", description: "", price: "", image: null }); // Reset form
    setIsModalOpen(true); // Open the modal for adding
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setFormData({ name: "", description: "", price: "", image: null }); // Optionally reset form data
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Your Products</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Modal Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">{editMode ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit}>
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
                <input
                  type="file"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="p-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="px-4 py-2 mt-4 text-white bg-blue-600 rounded">
                {editMode ? "Update Product" : "Add Product"}
              </button>
            </form>
            <button
              onClick={closeModal}
              className="mt-2 text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <h2 className="mb-4 text-xl">Your Product List</h2>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left border-b">Image</th>
            <th className="p-2 text-left border-b">Product Name</th>
            <th className="p-2 text-left border-b">Price</th>
            <th className="p-2 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="p-2 border-b">
                <img src={product.imageUrl} alt={product.name} className="object-cover w-16 h-16" />
              </td>
              <td className="p-2 border-b">{product.name}</td>
              <td className="p-2 border-b">${product.price}</td>
              <td className="p-2 border-b">
                <button
                  onClick={() => editProduct(product)}
                  className="px-3 py-1 mr-2 text-white bg-yellow-500 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="px-3 py-1 text-white bg-red-500 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={openAddProductModal}
        className="px-4 py-2 mt-4 text-white bg-green-600 rounded"
      >
        Add Product
      </button>
    </div>
  );
}

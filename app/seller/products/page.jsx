"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: null,
    categoryId: "", 
  });
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const router = useRouter(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      setError(error.message);
    }
  };

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

  const fetchUserRole = async () => {
    try {
      const res = await fetch("/api/buyer/account", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user role");
      }

      const data = await res.json();
      setUserRole(data.role);

      if (data.role === "SELLER") {
        // Fetch seller data to check if they are verified
        const sellerRes = await fetch("/api/seller", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!sellerRes.ok) {
          throw new Error("Failed to fetch seller data");
        }

        const sellerData = await sellerRes.json();
        if (!sellerData.isVerified) {
          router.push("/seller/setup"); // Redirect if seller is not verified
        }
      } else {
        router.push("/seller/setup"); // Redirect if not a seller
      }
    } catch (error) {
      setError(error.message);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (isSubmitting) return; 
    setIsSubmitting(true); 

    const { name, description, price, image, categoryId } = formData;
    if (!name || !description || !price || !categoryId) {
      setError("Please fill in all fields.");
      setIsSubmitting(false); 
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid price.");
      setIsSubmitting(false);
      return;
    }

    const url = editMode ? `/api/seller/products/${editProductId}` : "/api/seller/products";
    const method = editMode ? "PATCH" : "POST";

    try {
      const formDataForServer = new FormData();
      formDataForServer.append("name", name);
      formDataForServer.append("description", description);
      formDataForServer.append("price", parsedPrice);
      formDataForServer.append("categoryId", categoryId); 

      if (image && image instanceof File) {
        formDataForServer.append("image", image);
      }

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

      setFormData({ name: "", description: "", price: "", image: null, categoryId: "" });
      setEditMode(false);
      setEditProductId(null);
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      setError(error.message);
    }
  };

  const editProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image, 
      categoryId: product.categoryId, 
    });
    setEditMode(true);
    setEditProductId(product.id);
    setIsModalOpen(true);
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
    setEditMode(false);
    setFormData({ name: "", description: "", price: "", image: null, categoryId: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", description: "", price: "", image: null, categoryId: "" });
  };

  useEffect(() => {
    fetchUserRole(); 
    fetchCategories(); 
    fetchProducts();
  }, []);

  if (isSubmitting){
    return LoadingSpinner;
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Your Products</h1>
      {error && <p className="text-red-500">{error}</p>}

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
                  required={!editMode} 
                />
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

              </div>

              <div className="w-full mt-4">
                <textarea
                  placeholder="Product Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <button type="submit" className="px-4 py-2 mt-4 text-white bg-blue-600 rounded">
                {editMode ? "Update Product" : "Add Product"}
              </button>
            </form>
            <button onClick={closeModal} className="mt-2 text-red-500">
              Close
            </button>
          </div>
        </div>
      )}

      <h2 className="mt-6 mb-4 text-lg font-semibold">Product List</h2>
      <button onClick={openAddProductModal} className="px-4 py-2 text-white bg-green-600 rounded">
        Add Product
      </button>
      <table className="min-w-full mt-4">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No products available.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img src={product.imageUrl} alt={product.name} width="100" height="100" />
                </td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>&#8369;{product.price}</td>
                <td>{product.category?.name}</td>
                <td>
                  <button
                    onClick={() => editProduct(product)}
                    className="px-4 py-2 text-white bg-blue-600 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-4 py-2 ml-2 text-white bg-red-600 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

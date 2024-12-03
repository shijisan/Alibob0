"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminCategoriesPage = () => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/admin/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      } else {
        setError("Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      setError("Category name is required.");
      return;
    }

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ name: categoryName }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Category created successfully.");
      setCategoryName("");
      setCategories((prevCategories) => [...prevCategories, data]);
      setIsModalOpen(false); // Close the modal
    } else {
      setError(data.error || "Failed to create category.");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName) {
      setError("New category name is required.");
      return;
    }

    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: JSON.stringify({ name: editName }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Category updated successfully.");
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === id ? { ...category, name: data.name } : category
        )
      );
      setEditingCategory(null);
      setEditName("");
    } else {
      setError(data.error || "Failed to update category.");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Category deleted successfully.");
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== id)
      );
    } else {
      setError(data.error || "Failed to delete category.");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <h1>Admin Categories</h1>

      <button
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded"
        onClick={() => setIsModalOpen(true)}
      >
        Create Category
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h2>Existing Categories</h2>
      <table className="mt-4 border border-collapse border-gray-400 table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-400">ID</th>
            <th className="px-4 py-2 border border-gray-400">Name</th>
            <th className="px-4 py-2 border border-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="px-4 py-2 border border-gray-400">{category.id}</td>
              <td className="px-4 py-2 border border-gray-400">
                {editingCategory === category.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="New Category Name"
                    className="border"
                  />
                ) : (
                  category.name
                )}
              </td>
              <td className="px-4 py-2 border border-gray-400">
                {editingCategory === category.id ? (
                  <>
                    <button
                      className="mr-2 text-green-600"
                      onClick={() => handleUpdate(category.id)}
                    >
                      Save
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => setEditingCategory(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="mr-2 text-blue-600"
                      onClick={() => {
                        setEditingCategory(category.id);
                        setEditName(category.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-lg w-96">
            <h2>Create Category</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-2 mt-2 border"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 mr-2 text-white bg-gray-400 rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminCategoriesPage;

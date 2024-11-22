"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminCategoriesPage = () => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null); // Tracks the category being edited
  const [editName, setEditName] = useState(""); // Tracks the new name for the category being edited
  const router = useRouter();

  // Redirect to /admin/login if adminToken does not exist
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      router.push("/admin/login");
    }
  }, [router]);

  // Fetch categories on initial render
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

  // Handle creating a new category
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
      setCategories((prevCategories) => [...prevCategories, data]); // Add the new category to the list
    } else {
      setError(data.error || "Failed to create category.");
    }
  };

  // Handle updating a category
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

  // Handle deleting a category
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
      <h1>Create Category</h1>

      {/* Form for creating a new category */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="border"
          />
        </div>
        <button type="submit">Create Category</button>
      </form>

      {/* Display error or success message */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* List of existing categories */}
      <h2>Existing Categories</h2>
      <ul>
        {categories.map((category) => (
          <li key={category.id} className="my-4">
            {editingCategory === category.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="New Category Name"
                  className="border"
                />
                <button onClick={() => handleUpdate(category.id)}>Save</button>
                <button onClick={() => setEditingCategory(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                <button onClick={() => setEditingCategory(category.id)}>Edit</button>
                <button onClick={() => handleDelete(category.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AdminCategoriesPage;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminManageAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) router.push("/admin/login");
    else fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/manage-admins", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      } else {
        throw new Error("Failed to fetch admins.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleCreateAdmin = async () => {
    resetFeedback();

    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/manage-admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const newAdmin = await res.json();
        setAdmins((prev) => [...prev, newAdmin]);
        setMessage("Admin created successfully.");
        setIsModalOpen(false);
        setUsername("");
        setPassword("");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to create admin.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      const res = await fetch(`/api/admin/manage-admins/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        setAdmins((prev) => prev.filter((admin) => admin.id !== id));
        setMessage("Admin deleted successfully.");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to delete admin.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Manage Admins</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 mt-4 text-white bg-blue-600 rounded"
      >
        Add Admin
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}
      {message && <p className="mt-4 text-green-500">{message}</p>}

      <h2 className="mt-6 text-xl">Existing Admins</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="mt-4 border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-4 py-2 border">{admin.id}</td>
                <td className="px-4 py-2 border">{admin.username}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDeleteAdmin(admin.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-lg">
            <h2 className="text-xl">Create Admin</h2>
            <div className="mt-4">
              <label className="block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 text-gray-500"
              >
                Cancel
              </button>
              <button onClick={handleCreateAdmin} className="text-blue-600">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminManageAdminsPage;

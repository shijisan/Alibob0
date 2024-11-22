"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function AccountPage() {
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found. Redirecting to /login.");
      router.push("/login");
      return;
    }

    const fetchAccountInfo = async () => {
      try {
        const response = await fetch("/api/buyer/account", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Account data fetched:", data);
        setAccountInfo(data); // Set the account information
      } catch (err) {
        console.error("Failed to fetch account info:", err);
        setError(err.message);
        router.push("/login"); // Redirect to login on error
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <section className="flex items-center justify-center min-h-screen gap-4">
      <div className="flex flex-col justify-center w-full h-full p-5 border rounded-lg shadow lg:w-1/2 dashboard-container lg:h-52">
        <h2 className="text-2xl font-medium">Welcome to Your Account</h2>
        {accountInfo && (
          <>
            <p>Name: {accountInfo.name}</p>
            <p>Email: {accountInfo.email}</p>
            <p>Role: {accountInfo.role}</p>
            <p>
              Account Created On:{" "}
              {new Date(accountInfo.createdAt).toLocaleDateString()}
            </p>
          </>
        )}
        <div>
          <LogoutButton />
        </div>
      </div>
      <ul className="flex flex-col w-full h-full p-5 list-disc list-inside border rounded-lg shadow lg:w-1/2 lg:h-52">
        <h2 className="text-2xl font-medium">Links:</h2>
      </ul>
    </section>
  );
}

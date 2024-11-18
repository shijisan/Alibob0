"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [accountInfo, setAccountInfo] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
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
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setAccountInfo(data); // Set the account information
      } catch (err) {
        console.error("Failed to fetch account info:", err);
        setError(err.message);
        router.push("/login"); // Redirect to login on error
      }
    };

    fetchAccountInfo();
  }, [router]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!accountInfo) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pt-[10vh]">
      <h1>Welcome, {accountInfo.name}</h1>
      <p>Email: {accountInfo.email}</p>
      <p>Role: {accountInfo.role}</p>
      <p>Account created on: {new Date(accountInfo.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

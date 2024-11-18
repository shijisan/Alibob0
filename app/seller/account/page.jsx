"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function SellerAccount() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchSellerData = async () => {
      try {

        const res = await fetch("/api/seller", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSeller(data);
        } else {
          const data = await res.json();
          setError(data.error || "An error occurred while fetching seller data.");
        }
      } catch (err) {
        setError("Failed to fetch seller data");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (seller && seller.isVerified === false) {
    return (
      <div className="waiting-container">
        <h1>Your seller account is not yet verified.</h1>
        <p>Please wait for an admin to verify your account.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen dashboard-container">
      <h1>Welcome to your Seller Dashboard</h1>
      <p>Shop Name: {seller.shopName}</p>
      <p>Shop Description: {seller.shopDescription}</p>
      <p>Verification Status: {seller.isVerified ? "Verified" : "Not Verified"}</p>
		<LogoutButton/>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function SellerAccount() {
  const [user, setUser] = useState(null);  // Changed to user instead of seller
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found. Redirecting to /login.");
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/buyer/account", {  // Fetching from the /api/buyer/account endpoint
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,  // Passing the token as Bearer token
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("User data fetched:", data);

          // Handle role and isVerified logic
          if (data.role === "BUYER" && !data.isVerified) {
            console.log("Case: Buyer, isVerified = false. Redirecting to /login.");
            router.push("/login");
            return;
          }

          if (data.role === "SELLER" && !data.seller?.isVerified) {
            console.log("Case: Seller, isVerified = false. Redirecting to /seller/setup.");
            router.push("/seller/setup");
            return;
          }

          if (data.role === "SELLER" && data.seller?.isVerified) {
            console.log("Case: Seller, isVerified = true. Access granted.");
            setUser(data);  // Set the user data here, since it's the user data now
          } else {
            console.log("Case: Access denied. Unexpected role or status.");
            setError("Access denied.");
          }
        } else {
          const data = await res.json();
          console.log("Error response from API:", data);
          setError(data.message || "An error occurred while fetching user data.");
        }
      } catch (err) {
        console.log("Error fetching user data:", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen dashboard-container">
      <h1>Welcome to your Seller Dashboard</h1>
      {user && user.role === "SELLER" && (
        <>
          <p>Shop Name: {user.seller.shopName}</p>
          <p>Shop Description: {user.seller.shopDescription}</p>
          <p>Verification Status: {user.seller.isVerified ? "Verified" : "Not Verified"}</p>
        </>
      )}
      <LogoutButton />
    </div>
  );
}

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
        // First, fetch user data from /api/buyer/account
        const resAccount = await fetch("/api/buyer/account", {  
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (resAccount.ok) {
          const data = await resAccount.json();
          console.log("User data fetched:", data);

          // Handle role and isVerified logic
          if (data.role === "BUYER" && !data.isVerified) {
            console.log("Case: Buyer, isVerified = false. Redirecting to /login.");
            router.push("/login");
            return;
          }

          if (data.role === "SELLER") {
            // Fetch seller verification status from /api/seller
            const resSeller = await fetch("/api/seller", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!resSeller.ok) {
              const sellerData = await resSeller.json();
              setError(sellerData.error || "Failed to fetch seller data");
              return;
            }

            const sellerData = await resSeller.json();
            console.log("Seller data fetched:", sellerData);

            if (sellerData.isVerified) {
              console.log("Case: Seller, isVerified = true. Access granted.");
              setUser(data);  // Set the user data here, since it's the user data now
            } else {
              console.log("Case: Seller, isVerified = false. Redirecting to /seller/setup.");
              router.push("/seller/setup");
              return;
            }
          }
        } else {
          const data = await resAccount.json();
          console.log("Error response from /api/buyer/account:", data);
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

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerSetupPage() {
   const [shopName, setShopName] = useState("");
   const [shopDescription, setShopDescription] = useState("");
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
   const [isSellerVerified, setIsSellerVerified] = useState(null);
   const [userRole, setUserRole] = useState(null);
   const router = useRouter(); // Initialize the router

   useEffect(() => {
      const checkSellerVerification = async () => {
         const token = localStorage.getItem("token");
         if (!token) {
            router.push("/login"); // Redirect to /login if no token
            return;
         }

         try {
            // Fetch user account data from /api/buyer/account
            const resAccount = await fetch("/api/buyer/account", {
               method: "GET",
               headers: { Authorization: `Bearer ${token}` },
            });

            if (!resAccount.ok) {
               const data = await resAccount.json();
               setError(data.error || "Failed to fetch account information");
               return;
            }

            const account = await resAccount.json();
            setUserRole(account.role); // Store the user role

            // Fetch seller verification status for sellers
            if (account.role === "SELLER") {
               const resSeller = await fetch("/api/seller", {
                  method: "GET",
                  headers: { Authorization: `Bearer ${token}` },
               });

               if (!resSeller.ok) {
                  const data = await resSeller.json();
                  setError(data.error || "Failed to fetch seller verification status");
                  return;
               }

               const seller = await resSeller.json();
               setIsSellerVerified(seller.isVerified); // Update seller verification status

               // If the seller is verified, redirect to /seller/account
               if (seller.isVerified) {
                  router.push("/seller/account");
               }
            }
         } catch (err) {
            setError("Failed to verify seller status");
         }
      };

      checkSellerVerification();
   }, [router]); // Add router as a dependency

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         const token = localStorage.getItem("token");
         const res = await fetch("/api/seller/setup", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ shopName, shopDescription }),
         });

         if (res.ok) {
            // After successful submission, update state to reflect pending status
            setIsSellerVerified(false); // Seller is unverified after setup
            setUserRole("SELLER");
         } else {
            const data = await res.json();
            setError(data.error || "An error occurred");
         }
      } catch (err) {
         setError("Failed to create seller");
      } finally {
         setLoading(false);
      }
   };

   if (userRole === null) {
      return <div>Loading...</div>; // Show loading until role is determined
   }

   // Render seller-specific states
   if (userRole === "SELLER") {
      if (isSellerVerified === null) {
         return <div>Loading verification status...</div>; // Optional loading state for verification status
      }

      if (isSellerVerified) {
         return (
            <section className="flex flex-col items-center justify-center min-h-screen seller-setup-container">
               <h2 className="text-3xl font-medium text-center">Seller Account Setup Complete</h2>
               <p>Your seller account is verified. You can now start selling!</p>
            </section>
         );
      } else {
         return (
            <section className="flex flex-col items-center justify-center min-h-screen seller-setup-container">
               <h2 className="text-3xl font-medium text-center">Pending Approval</h2>
               <p>Your seller account is under review. Please wait for approval from the admin.</p>
            </section>
         );
      }
   }

   // Render setup form for buyers
   return (
      <section className="flex flex-col items-center justify-center min-h-screen seller-setup-container">
         {error && <p className="error">{error}</p>}
         <form
            className="flex flex-col justify-center w-full p-5 space-y-4 border shadow rounded-xl lg:w-1/3 md:w-1/2"
            onSubmit={handleSubmit}
         >
            <h2 className="text-3xl font-medium text-center">Setup Seller Account</h2>
            <div className="flex flex-col">
               <label>Shop Name:</label>
               <input
                  className="p-1 border rounded"
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  placeholder="Chris&apos; Drug Store"
               />
            </div>

            <div className="flex flex-col">
               <label>Shop Description:</label>
               <textarea
                  className="p-1 border rounded"
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  required
                  placeholder="One stop shop for the best quality drugs..."
               />
            </div>

            <button
               className="p-2 transition-colors bg-blue-100 rounded-lg text-blue-950 hover:bg-blue-300"
               type="submit"
               disabled={loading}
            >
               {loading ? "Creating..." : "Create Seller Account"}
            </button>
         </form>
      </section>
   );
}

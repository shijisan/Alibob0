"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifySellerPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [sellers, setSellers] = useState([]);  // State to store sellers as an array
   const [adminToken, setAdminToken] = useState(null);
   const router = useRouter();

   useEffect(() => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
         router.push("/admin/login");
      } else {
         setAdminToken(token); // Store token in state once it's available
         setIsLoading(false);  // Set loading to false once we get the token
      }
   }, [router]);

   // Fetch unverified sellers
   const fetchSellers = async () => {
      try {
         const response = await fetch("/api/admin/verify-seller", {
            method: "GET",
            headers: {
               "Authorization": `Bearer ${adminToken}`,
            },
         });
         const data = await response.json();
         
         // Ensure the response has the 'sellers' key
         if (data.sellers && Array.isArray(data.sellers)) {
            setSellers(data.sellers); // Update sellers state with fetched data
         } else {
            console.error("Unexpected data format", data);
         }
      } catch (error) {
         console.error("Error fetching sellers", error);
      }
   };

   useEffect(() => {
      if (!isLoading && adminToken) {
         fetchSellers(); // Fetch sellers once adminToken is available
      }
   }, [isLoading, adminToken]);

   // Handle verify action for a seller
   const handleVerify = async (sellerId) => {
      try {
         const response = await fetch(`/api/admin/verify-seller/${sellerId}`, {
            method: "PATCH",  // Use PATCH method for verification
            headers: {
               "Authorization": `Bearer ${adminToken}`,
               "Content-Type": "application/json",
            },
         });

         if (response.ok) {
            const updatedSellers = sellers.filter((seller) => seller.id !== sellerId);
            setSellers(updatedSellers); // Remove the verified seller from the list
         } else {
            console.error("Failed to verify seller");
         }
      } catch (error) {
         console.error("Error verifying seller", error);
      }
   };

   return (
      <div>
         {isLoading ? (
            <p>Loading...</p>
         ) : (
            <section className="flex items-center justify-center min-h-screen">
               <h1>Verify Sellers</h1>
               {sellers.length === 0 ? (
                  <p>No unverified sellers.</p>
               ) : (
                  <ul>
                     {sellers.map((seller) => (
                        <li key={seller.id}>
                           <span>{seller.shopName}</span>
                           <button onClick={() => handleVerify(seller.id)}>
                              Verify
                           </button>
                        </li>
                     ))}
                  </ul>
               )}
            </section>
         )}
      </div>
   );
}

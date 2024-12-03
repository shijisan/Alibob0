"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifySellerPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [sellers, setSellers] = useState([]); 
   const [adminToken, setAdminToken] = useState(null);
   const router = useRouter();

   useEffect(() => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
         router.push("/admin/login");
      } else {
         setAdminToken(token); 
         setIsLoading(false); 
      }
   }, [router]);

   const fetchSellers = async () => {
      try {
         const response = await fetch("/api/admin/verify-seller", {
            method: "GET",
            headers: {
               Authorization: `Bearer ${adminToken}`,
            },
         });
         const data = await response.json();

         if (data.sellers && Array.isArray(data.sellers)) {
            setSellers(data.sellers); 
         } else {
            console.error("Unexpected data format", data);
         }
      } catch (error) {
         console.error("Error fetching sellers", error);
      }
   };

   useEffect(() => {
      if (!isLoading && adminToken) {
         fetchSellers(); 
      }
   }, [isLoading, adminToken]);

   const handleVerify = async (sellerId) => {
      try {
         const response = await fetch(`/api/admin/verify-seller/${sellerId}`, {
            method: "PATCH", 
            headers: {
               Authorization: `Bearer ${adminToken}`,
               "Content-Type": "application/json",
            },
         });

         if (response.ok) {
            const updatedSellers = sellers.filter((seller) => seller.id !== sellerId);
            setSellers(updatedSellers); 
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
            <section className="flex flex-col items-center justify-center min-h-screen">
               <h1 className="mb-4 text-xl font-bold">Verify Sellers</h1>
               {sellers.length === 0 ? (
                  <p>No unverified sellers.</p>
               ) : (
                  <table className="border border-collapse border-gray-300 table-auto">
                     <thead>
                        <tr>
                           <th className="px-4 py-2 border border-gray-300">Shop Name</th>
                           <th className="px-4 py-2 border border-gray-300">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {sellers.map((seller) => (
                           <tr key={seller.id}>
                              <td className="px-4 py-2 border border-gray-300">{seller.shopName}</td>
                              <td className="px-4 py-2 border border-gray-300">
                                 <button
                                    onClick={() => handleVerify(seller.id)}
                                    className="px-4 py-1 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                                 >
                                    Verify
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </section>
         )}
      </div>
   );
}

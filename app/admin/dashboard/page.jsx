"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function AdminDashboardPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [adminInfo, setAdminInfo] = useState(null);
   const [recentAdmins, setRecentAdmins] = useState([]);
   const [unverifiedSellers, setUnverifiedSellers] = useState([]);
   const [categories, setCategories] = useState([]);
   const [error, setError] = useState(null);
   const router = useRouter();

   useEffect(() => {
      const fetchDashboardData = async () => {
         const token = localStorage.getItem("adminToken");

         if (!token) {
            setError("No admin token found.");
            setIsLoading(false);
            return;
         }

         try {
            const headers = { Authorization: `Bearer ${token}` };

            const [adminRes, adminsRes, sellersRes, categoriesRes] = await Promise.all([
               fetch("/api/admin", { headers }),
               fetch("/api/admin/manage-admins", { headers }),
               fetch("/api/admin/verify-seller", { headers }),
               fetch("/api/categories", { headers }),
            ]);

            if (adminRes.ok) {
               const data = await adminRes.json();
               setAdminInfo(data.admin);
            } else {
               throw new Error("Unauthorized");
            }

            if (adminsRes.ok) {
               const data = await adminsRes.json();
               setRecentAdmins(data.admins.slice(0, 2));
            }

            if (sellersRes.ok) {
               const data = await sellersRes.json();
               setUnverifiedSellers(data.sellers);
            }

            if (categoriesRes.ok) {
               const data = await categoriesRes.json();
               setCategories(data.categories.slice(0, 5));
            }
         } catch (error) {
            setError(error.message || "Error fetching data.");
         } finally {
            setIsLoading(false);
         }
      };

      fetchDashboardData();
   }, []);

   useEffect(() => {
      if (!isLoading && !adminInfo) {
         router.push("/admin/login");
      }
   }, [isLoading, adminInfo, router]);

   if (isLoading) return <div>Loading...</div>;
   if (error) return <div>{error}</div>;

   return (
      <section className="flex flex-col items-center justify-center min-h-screen gap-8 pt-[10vh]">
         <div className="w-full max-w-5xl p-5 bg-white border rounded-lg shadow">

            {adminInfo && (
               <>
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-medium">Admin Info</h2>
                  <LogoutButton />
               </div>
               <p>Name: {adminInfo.username}</p>
                  <p>Account Created On: {new Date(adminInfo.createdAt).toLocaleDateString()}</p>
                  
               </>
            )}
         </div>

         <div className="w-full max-w-5xl p-5 bg-white border rounded-lg shadow">
            <h2 className="text-2xl font-medium">Recent Admins</h2>
            <ul className="list-disc list-inside">
               {recentAdmins.map((admin) => (
                  <li key={admin.id}>{admin.username}</li>
               ))}
            </ul>
            <button
               onClick={() => router.push("/admin/admins")}
               className="mt-2 text-blue-500 underline"
            >
               Expand
            </button>
         </div>

         <div className="w-full max-w-5xl p-5 bg-white border rounded-lg shadow">
            <h2 className="text-2xl font-medium">Unverified Sellers</h2>
            {unverifiedSellers.filter(seller => seller?.user?.username).length > 0 ? (
               <ul className="list-disc list-inside">
                  {unverifiedSellers
                     .filter(seller => seller?.user?.username)
                     .map((seller) => (
                        <li key={seller.id}>{seller.user.username}</li>
                     ))}
               </ul>
            ) : (
               <p className="text-black">All cleared! No unverified sellers.</p>
            )}
            <button
               onClick={() => router.push("/admin/verify-seller")}
               className="mt-2 text-blue-500 underline"
            >
               Expand
            </button>
         </div>

         <div className="w-full max-w-5xl p-5 bg-white border rounded-lg shadow">
            <h2 className="text-2xl font-medium">Categories</h2>
            <ul className="list-disc list-inside">
               {categories.map((category, index) => (
                  <li key={index}>{category.name}</li>
               ))}
            </ul>
         </div>
      </section>
   );
}

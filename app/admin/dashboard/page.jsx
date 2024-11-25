"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function AdminDashboardPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [adminInfo, setAdminInfo] = useState(null);
   const [error, setError] = useState(null);
   const router = useRouter();

   useEffect(() => {
      const fetchAdminData = async () => {
         const token = localStorage.getItem("adminToken");

         if (token) {
            try {
               const res = await fetch("/api/admin", {
                  method: "GET",
                  headers: {
                     Authorization: `Bearer ${token}`,
                  },
               });

               if (res.ok) {
                  const data = await res.json();
                  setAdminInfo(data.admin);
               } else {
                  setError("Unauthorized");
               }
            } catch (error) {
               setError("Error fetching admin data.");
            }
         } else {
            setError("No admin token found.");
         }

         setIsLoading(false);
      };

      fetchAdminData();
   }, []);

   useEffect(() => {
      if (!isLoading && !adminInfo) {
         router.push("/admin/login");
      }
   }, [isLoading, adminInfo, router]);

   if (isLoading) return <div>Loading...</div>;
   if (error) return <div>{error}</div>;

   return (
      <>
         
         <section className="flex items-center justify-center min-h-screen gap-4">
            <div className="flex flex-col justify-center w-full h-full p-5 border rounded-lg shadow lg:w-1/2 dashboard-container lg:h-52">
               <h2 className="text-2xl font-medium">Admin Info</h2>
               {adminInfo && (
                  <>
                     <p>Name: {adminInfo.username}</p>
                     <p>Account Created On: {new Date(adminInfo.createdAt).toLocaleDateString()}</p>
                     <div className="">
                        <LogoutButton/>
                     </div>
                  </>
               )}
            </div>
            <ul className="flex flex-col w-full h-full p-5 list-disc list-inside border rounded-lg shadow lg:w-1/2 lg:h-52">
               <h2 className="text-2xl font-medium ">Links:</h2>
               <li><a className="text-blue-500 underline" href="/admin/verify-seller">Verify Sellers</a></li>
               <li><a className="text-blue-500 underline" href="/admin/categories">Manage Categories</a></li>
               
            </ul>
         </section>
      </>
   );
}

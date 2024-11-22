"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function AdminDashboardPage() {
   const [isLoading, setIsLoading] = useState(true);
   const [adminToken, setAdminToken] = useState(null);
   const router = useRouter();

   useEffect(() => {
      if (typeof window !== "undefined") {
         const token = localStorage.getItem("adminToken");
         setAdminToken(token);
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      if (!isLoading && !adminToken) {
         router.push("/admin/login");
      }
   }, [isLoading, adminToken, router]);

   if (isLoading) {
      return <div>Loading...</div>;
   }

   return (
      <>
         <section className="flex flex-col items-center justify-center min-h-screen">
            <h1>Welcome to Admin Dashboard</h1>
            <LogoutButton/>
         </section>
      </>
   );
}

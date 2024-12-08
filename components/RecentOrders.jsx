"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const RecentOrders = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const router = useRouter();

   // Fetch orders when the component mounts
   useEffect(() => {
      const fetchOrders = async () => {
         const token = localStorage.getItem("token");
         if (!token) {
            setError("You must be logged in to view orders.");
            setLoading(false);
            return;
         }

         try {
            const res = await fetch(`/api/orders/${token}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            if (res.ok) {
               const data = await res.json();
               setOrders(data.orders);
            } else {
               setError("Failed to fetch orders.");
            }
         } catch (err) {
            setError("An error occurred while fetching orders.");
         } finally {
            setLoading(false);
         }
      };

      fetchOrders();
   }, []);

   if (loading) return <p>Loading recent orders...</p>;
   if (error) return <p>{error}</p>;

   return (
      <div className="w-full h-full p-5 bg-gray-100">
         <h2 className="mb-4 text-xl font-medium">Recent Orders</h2>
         {orders.length === 0 ? (
            <p>No recent orders found.</p>
         ) : (
            <ol className="px-5 list-decimal list-outside">
               {orders.map((order) => (
                  <li key={order.id} className="mb-4 text-sm">
                     <div className="flex flex-col justify-between w-full font-medium truncate lg:flex-row">
                        <div>Order ID: <span className="font-semibold truncate">{order.id}</span></div>
                        <div>Status: <span className="font-semibold">{order.status}</span></div>
                     </div>
                     <div className="flex flex-col justify-between w-full font-medium lg:flex-row">
                        <span>Total Amount: $<span className="font-semibold">{order.totalAmount}</span></span>
                        <a
                           href={`/orders/${order.id}`}
                           className="text-blue-500 underline"
                        >
                           View Order
                        </a>
                     </div>
                  </li>
               ))}
            </ol>
         )}
         <button
            onClick={() => router.push("/orders")}
            className="text-blue-500 underline"
         >
            View All Orders
         </button>
      </div>
   );
};

export default RecentOrders;

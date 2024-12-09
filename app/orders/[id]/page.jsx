"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const OrderItems = () => {
   const [order, setOrder] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const router = useRouter();
   const { query, isReady } = router;

   useEffect(() => {
      const fetchOrder = async () => {
         if (!isReady) return; // Wait for router to be ready
         const { id } = query;

         if (!id) {
            setError("Order ID is missing.");
            setLoading(false);
            return;
         }

         const token = localStorage.getItem("token");
         if (!token) {
            setError("You must be logged in to view orders.");
            setLoading(false);
            return;
         }

         try {
            const res = await fetch(`/api/orderItems/${id}`, {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
            if (res.ok) {
               const data = await res.json();
               setOrder(data);
            } else {
               setError("Failed to fetch order details.");
            }
         } catch (err) {
            setError("An error occurred while fetching the order.");
         } finally {
            setLoading(false);
         }
      };

      fetchOrder();
   }, [query, isReady]); // Run the effect when query or isReady changes

   if (loading) return <p>Loading order details...</p>;
   if (error) return <p>{error}</p>;

   return (
      <div className="w-full h-full p-5 bg-gray-100">
         <h2 className="mb-4 text-xl font-medium">Order ID: {order.id}</h2>
         <div className="mb-4">
            <h3 className="text-lg font-medium">Shipping Address</h3>
            <p>{order.addressLine1}</p>
            {order.addressLine2 && <p>{order.addressLine2}</p>}
            <p>{order.city}, {order.province}, {order.postalCode}</p>
            <p>{order.country}</p>
         </div>
         <div className="mb-4">
            <h3 className="text-lg font-medium">Order Items</h3>
            {order.items.length === 0 ? (
               <p>No items found in this order.</p>
            ) : (
               <ul className="list-decimal list-inside">
                  {order.items.map((item) => (
                     <li key={item.id} className="mb-2">
                        <div className="flex justify-between">
                           <span>{item.product.name}</span>
                           <span>
                              {item.quantity} x ${item.price.toFixed(2)}
                           </span>
                        </div>
                     </li>
                  ))}
               </ul>
            )}
         </div>
         <div className="flex justify-between mt-4">
            <span className="font-semibold">Total Amount: ${order.totalAmount.toFixed(2)}</span>
            <span className="font-semibold">Status: {order.status}</span>
         </div>
         <button
            onClick={() => router.push("/orders")}
            className="mt-4 text-blue-500 underline"
         >
            Back to Orders
         </button>
      </div>
   );
};

export default OrderItems;

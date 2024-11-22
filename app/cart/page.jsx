"use client";
import React, { useEffect, useState } from "react";

const CartPage = () => {
   const [cartItems, setCartItems] = useState([]);
   const [selectedItems, setSelectedItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchCartItems = async () => {
         try {
            const response = await fetch("/api/cart", {
               headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (response.ok) {
               const data = await response.json();
               setCartItems(data.cartItems);
            } else {
               console.error("Failed to fetch cart items");
            }
         } catch (err) {
            console.error("Error fetching cart items:", err);
            setError("Failed to load cart items.");
         } finally {
            setLoading(false);
         }
      };

      fetchCartItems();
   }, []);

   const handleSelectItem = (id) => {
      setSelectedItems((prevSelected) =>
         prevSelected.includes(id)
            ? prevSelected.filter((itemId) => itemId !== id)
            : [...prevSelected, id]
      );
   };

   const calculateTotal = () => {
      return cartItems
         .filter((item) => selectedItems.includes(item.id))
         .reduce((sum, item) => sum + item.price * item.quantity, 0)
         .toFixed(2); // Keep 2 decimal places
   };

   if (loading) return <div>Loading...</div>;
   if (error) return <div className="error">{error}</div>;

   return (
      <section className="min-h-screen pt-[11vh] p-4 flex justify-center">
         <div className="container w-2/3 p-4 mx-auto bg-white border rounded-lg shadow">
            <h1 className="mb-4 text-2xl font-bold">Your Cart</h1>
            {cartItems.length === 0 ? (
               <p>Your cart is empty.</p>
            ) : (
               <>
                  <ul className="mb-4">
                     {cartItems.map((item) => (
                        <li
                           key={item.id}
                           className="flex items-center justify-between px-4 py-2 my-1 border-y"
                        >
                           <div className="flex items-center">
                              <input
                                 type="checkbox"
                                 checked={selectedItems.includes(item.id)}
                                 onChange={() => handleSelectItem(item.id)}
                                 className="mr-4"
                              />
                              <a href={`/product/${item.productId}`}>
                                 <p className="font-semibold">{item.name}</p>
                                 <p className="text-sm text-gray-600">x{item.quantity}</p>
                              </a>
                           </div>
                           <p className="text-gray-800">${item.price * item.quantity}</p>
                        </li>
                     ))}
                  </ul>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold">Total:</h2>
                     <p className="text-xl font-bold text-gray-800">
                        ${calculateTotal()}
                     </p>
                  </div>
                  <button
                     onClick={() => {
                        if (selectedItems.length > 0) {
                           alert(
                              `Purchasing items with a total of $${calculateTotal()}...`
                           );
                        } else {
                           alert("Please select at least one item to purchase.");
                        }
                     }}
                     className="px-4 py-2 text-white transition-colors rounded bg-blue-950 hover:bg-blue-900"
                  >
                     Purchase
                  </button>
               </>
            )}
         </div>
      </section>
   );
};

export default CartPage;

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

  const toggleDropdown = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found. Redirecting to login...");
      router.push("/login");
      return;
    }

    if (!validateToken(token)) {
      console.error("Invalid or expired token. Redirecting to login...");
      router.push("/login");
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const validateToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Math.floor(Date.now() / 1000);
    } catch {
      return false;
    }
  };

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
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    if (isOpen) fetchCartItems();
  }, [isOpen]);

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="p-2 rounded text-blue-950">
        Cart
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 bg-white border rounded shadow-lg w-72">
          <h3 className="p-2 mb-2 font-bold">Your Cart</h3>
          {cartItems.length === 0 ? (
            <p className="p-2 text-gray-500">Your cart is empty.</p>
          ) : (
            <>
              <ul>
                {cartItems.slice(0, 4).map((item, index) => (
                  <li
                    key={`${item.id}-${index}`} 
                    className="flex items-center justify-between p-2 mb-2 cursor-pointer hover:underline hover:bg-neutral-50"
                    onClick={() => router.push(`/product/${item.productId}`)}
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                    </div>
                    <p className="text-gray-800">&#8369;{item.price * item.quantity}</p>
                  </li>
                ))}
              </ul>

              {cartItems.length > 4 && (
                <p className="text-sm text-gray-500">
                  + {cartItems.length - 4} more items...
                </p>
              )}
              <button
                onClick={() => router.push("/cart")}
                className="w-full p-2 mt-2 text-center text-blue-600 underline"
              >
                Expand Cart
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;

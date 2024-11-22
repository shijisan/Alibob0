"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

const CartDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter(); // Initialize useRouter for navigation

  // Toggle the dropdown
  const toggleDropdown = () => {
    const token = localStorage.getItem("token");

    // Check if token exists
    if (!token) {
      console.error("No token found. Redirecting to login...");
      router.push("/login"); // Redirect to login
      return;
    }

    // Check if the token is valid
    const isValidToken = validateToken(token);
    if (!isValidToken) {
      console.error("Invalid or expired token. Redirecting to login...");
      router.push("/login"); // Redirect to login
      return;
    }

    setIsOpen((prev) => !prev);
  };

  // Function to validate the token
  const validateToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode token payload
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
      return payload.exp > currentTime; // Check if token has not expired
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  };

  // Fetch cart items from the API
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
      {/* Cart Button */}
      <button onClick={toggleDropdown} className="p-2 text-white bg-blue-500 rounded">
        Cart
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 p-4 mt-2 bg-white border rounded shadow-lg w-72">
          <h3 className="mb-2 font-bold">Your Cart</h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                  </div>
                  <p className="text-gray-800">${item.price * item.quantity}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CartDropdown;

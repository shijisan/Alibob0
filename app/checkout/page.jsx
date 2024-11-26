"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CheckoutPage = () => {
  const [address, setAddress] = useState({
    country: "Philippines",
    province: "",
    city: "",
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
  });
  const [provinces, setProvinces] = useState([
    "Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique", "Apayao", "Aurora",
    "Basilan", "Bataan", "Batanes", "Batangas", "Benguet", "Biliran", "Bohol", "Bukidnon", "Bulacan",
    "Cagayan", "Camarines Norte", "Camarines Sur", "Camiguin", "Capiz", "Catanduanes", "Cavite",
    "Cebu", "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Oriental",
    "Dinagat Islands", "Eastern Samar", "Guimaras", "Ifugao", "Ilocos Norte", "Ilocos Sur",
    "Iloilo", "Isabela", "Kalinga", "Laguna", "Lanao del Norte", "Lanao del Sur", "Leyte", "Maguindanao",
    "Marinduque", "Masbate", "Misamis Occidental", "Misamis Oriental", "Mountain Province",
    "Negros Occidental", "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya",
    "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon",
    "Quirino", "Rizal", "Romblon", "Samar", "Sarangani", "Siquijor", "Sorsogon", "South Cotabato",
    "Southern Leyte", "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tarlac",
    "Tawi-Tawi", "Zambales", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"
  ]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [shippingCost, setShippingCost] = useState(undefined);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const items = searchParams.get("items");

    if (items) {
      try {
        const decodedItems = decodeURIComponent(items);
        const parsedItems = JSON.parse(decodedItems);

        if (Array.isArray(parsedItems)) {
          setCartItems(parsedItems);

          router.replace("/checkout");

        } else {
          throw new Error("Invalid items format");
        }
      } catch (err) {
        console.error("Failed to parse cart items:", err);
        setError("Invalid cart items. Please try again.");
      }
    }
  }, [searchParams]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevState) => ({ ...prevState, [name]: value }));
  };

  const calculateTotalPrice = () => {
    const itemsTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    return itemsTotal + (shippingCost ?? 0);
  };

  const handleCheckout = async () => {
    const { province, city, postalCode, addressLine1, addressLine2, country } = address;
  
    if (!province || !city || !postalCode || !addressLine1 || !country) {
      setError("Please fill out all required fields.");
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          items: cartItems,
          addressLine1,
          addressLine2,
          city,
          province,
          postalCode,
          country,
        }),
      });
  
      if (response.ok) {
        alert("Order placed successfully!");
        router.push("/order-success");
      } else {
        alert("Failed to place the order.");
        const resData = await response.json();
        setError(resData.message || "Failed to place the order.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setError("An error occurred while placing the order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !error) {
    return <div>Loading selected items...</div>;
  }

  return (
    <section className="min-h-screen pt-[11vh] p-4 flex justify-center">
      <div className="container w-2/3 p-4 mx-auto bg-white border rounded-lg shadow">
        <h1 className="mb-4 text-2xl font-bold">Checkout</h1>
        {error && <div className="text-red-500 error">{error}</div>}

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Products</h2>
          <ul className="mt-2 space-y-4">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>{`₱${item.price * item.quantity}`}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600" htmlFor="addressLine1">Address Line 1</label>
          <input
            type="text"
            name="addressLine1"
            value={address.addressLine1}
            onChange={handleAddressChange}
            required
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600" htmlFor="addressLine2">Address Line 2</label>
          <input
            type="text"
            name="addressLine2"
            value={address.addressLine2}
            onChange={handleAddressChange}
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600" htmlFor="province">Province</label>
          <select
            name="province"
            value={address.province}
            onChange={handleAddressChange}
            required
            className="w-full p-2 mt-1 border rounded"
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600" htmlFor="city">City</label>
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            required
            className="w-full p-2 mt-1 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600" htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            name="postalCode"
            value={address.postalCode}
            onChange={handleAddressChange}
            required
            className="w-full p-2 mt-1 border rounded"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="flex items-center justify-between mt-2">
            <span>Subtotal</span>
            <span>{`₱${cartItems.reduce((total, item) => total + item.price * item.quantity, 0)}`}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span>Shipping</span>
            <span>{shippingCost ? `₱${shippingCost}` : "Calculating..."}</span>
          </div>
          <div className="flex items-center justify-between mt-4 text-lg font-bold">
            <span>Total</span>
            <span>{`₱${calculateTotalPrice()}`}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isSubmitting}
          className={`w-full py-2 mt-4 text-white ${isSubmitting ? 'bg-gray-500' : 'bg-blue-600'} rounded`}
        >
          {isSubmitting ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </section>
  );
};

export default CheckoutPage;

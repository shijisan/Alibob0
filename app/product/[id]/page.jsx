"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductDetailsPage() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shopInfo, setShopInfo] = useState(null);
  const router = useRouter();
  const params = useParams();

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value > 0 ? value : 1); // Fallback to 1 if invalid input
  };

  const addQuantity = () => setQuantity((prev) => prev + 1);
  const subtractQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleBuyNow = async () => {
    if (!product) return;
  
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
  
    try {
      const itemDetails = [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ];
  
      // Log the details for debugging
      console.log("Selected item details for Buy Now:", itemDetails);
  
      const queryParams = `?items=${encodeURIComponent(JSON.stringify(itemDetails))}`;
      router.push(`/checkout${queryParams}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  

  const addToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch cart items");

      const { cartItems } = await res.json();
      const existingItem = cartItems?.find((item) => item.productId === product.id);

      if (existingItem) {
        const updateRes = await fetch(`/api/cart/${existingItem.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: existingItem.quantity + quantity,
          }),
        });

        if (!updateRes.ok) throw new Error("Failed to update cart item");

        alert("Cart updated with new quantity!");
      } else {
        const addRes = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity,
          }),
        });

        if (!addRes.ok) throw new Error("Failed to add to cart");

        alert("Item added to cart!");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = params || {};
        if (!id) throw new Error("Product ID is missing");

        const productRes = await fetch(`/api/product/${id}`);
        if (!productRes.ok) throw new Error("Failed to fetch product");

        const productData = await productRes.json();

        const shopRes = await fetch(`/api/shop/${productData.seller.id}`);
        if (!shopRes.ok) throw new Error("Failed to fetch seller details");

        const shopData = await shopRes.json();

        setProduct(productData);
        setShopInfo(shopData);
      } catch (err) {
        setError(err.message || "An unknown error occurred");
      }
    };

    fetchProduct();
  }, [params]);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Error: {error}</h1>
        <button
          className="p-2 mt-4 text-white bg-blue-500 rounded"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!product || !shopInfo) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <section className="flex items-center justify-center min-h-screen gap-4 pt-[10vh]">
        <div className="flex flex-col w-full lg:flex-row">
          <div className="flex flex-col items-center justify-center lg:w-1/2 w-full lg:h-[90vh] p-10">
            <div className="flex items-center justify-center border aspect-square">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="lg:h-[300px] aspect-square object-cover"
              />
            </div>
          </div>
          <div className="flex items-center justify-center w-full p-5 lg:w-1/2">
            <div className="flex flex-col justify-center p-5 space-y-4 bg-white border shadow rounded-xl">
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <p className="text-lg font-semibold">
                Price: <span className="font-normal">&#8369;</span>
                {product.price.toFixed(2)}
              </p>
              <p className="text-base">{product.description}</p>

              <div className="flex">
                <button
                  className="px-3 border border-black"
                  onClick={subtractQuantity}
                >
                  -
                </button>
                <input
                  className="w-2/5 p-2 text-center border border-black rounded-none border-x-0 focus:outline-none"
                  onChange={handleChange}
                  value={quantity}
                  type="number"
                  min={1}
                  id="quantity"
                />
                <button className="px-3 border border-black" onClick={addQuantity}>
                  +
                </button>
              </div>
              <button
                className="w-1/2 p-2 transition-colors bg-blue-100 rounded hover:bg-blue-200 text-blue-950"
                onClick={addToCart}
              >
                Add to Cart
              </button>
              <button className="w-1/2 p-2 transition-colors bg-pink-200 rounded hover:bg-pink-300 text-blue-950" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center min-h-[10vh] p-10 w-full">
        <div className="flex flex-col w-full p-5 px-4 border rounded-lg shadow lg:flex-row text-blue-950 border-e">
          <div className="flex items-center justify-center me-4">
            <img
              className="rounded-full me-2"
              src={shopInfo.seller?.image || "https://placehold.co/50/webp"}
              alt="shop image"
            />
            <p className="me-4">{shopInfo.seller?.shopName || "Shop Name"}</p>
            <a
              className="p-2 font-medium bg-pink-300 rounded hover:bg-pink-400"
              href={`/shop/${shopInfo.seller?.id}`}
            >
              Visit Shop
            </a>
          </div>
          <div className="flex flex-col mt-4 space-y-4 lg:px-4 lg:mt-0 lg:space-x-4 lg:space-y-0 lg:items-center lg:flex-row border-s">
            <p className="">Products: {shopInfo.productCount || "N/A"}</p>
            <p className="">Ratings: {shopInfo.rating || "Undefined"}</p>
          </div>
        </div>
      </section>
    </>
  );
}

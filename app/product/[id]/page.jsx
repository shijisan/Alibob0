"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductDetailsPage() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartItem, setCartItem] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const router = useRouter();
  const params = useParams(); // Access dynamic route parameters

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const addQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const subtractQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const addToCart = async () => {
    if (!product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Fetch the cart to check if the product is already in the cart
      const res = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      });

      const { cartItems } = await res.json();

      // Find the existing cart item
      const existingItem = cartItems.find((item) => item.productId === product.id);

      if (existingItem) {
        // If the product is already in the cart, update its quantity
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

        if (!updateRes.ok) {
          throw new Error("Failed to update cart item");
        }

        alert("Cart updated with new quantity!");
      } else {
        // If the product is not in the cart, create a new cart item
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

        if (!addRes.ok) {
          throw new Error("Failed to add to cart");
        }

        alert("Item added to cart!");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { id } = params;
        if (!id) throw new Error("Product ID is missing");

        // Fetch product details
        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();

        // Fetch the seller's shop details (assumes `data.seller.id` exists)
        const shopRes = await fetch(`/api/shop/${data.seller.id}`);
        if (!shopRes.ok) {
          throw new Error("Failed to fetch seller details");
        }

        const shopData = await shopRes.json();

        // Set the fetched data
        setProduct(data);
        setShopInfo(shopData);
      } catch (err) {
        setError(err.message);
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
                className="lg:h-[300px] aspect-square"
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
              <p className="text-lg">{product.description}</p>

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
              <button className="w-1/2 p-2 transition-colors bg-pink-200 rounded hover:bg-pink-300 text-blue-950">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center h-[10vh] p-10 w-full">
        <div className="flex w-full p-5 px-4 border rounded-lg shadow text-blue-950 border-e">
          <div className="flex items-center justify-center me-4">
            <img
              className="rounded-full me-2"
              src="https://placehold.co/50/webp"
              alt="shop image"
            />
            <p className="me-4">{shopInfo.seller.shopName}</p>
            <a
              className="p-2 font-medium bg-pink-300 rounded hover:bg-pink-400"
              href={`/shop/${shopInfo.seller.id}`}
            >
              Visit Shop
            </a>
          </div>
          <div className="inline-flex items-center px-4 space-x-4 border-s">
            <p className="">Products: {shopInfo.productCount}</p>
            <p className="">Ratings: {shopInfo.rating || "Undefined"}</p>
          </div>
        </div>
      </section>
    </>
  );
}

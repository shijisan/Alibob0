"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProductDetailsPage() {
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cartItem, setCartItem] = useState(null);
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
		 alert("Please log in to add items to your cart.");
		 return;
	}

	try {
		 // First, fetch the cart to check if the product is already in the cart
		 const res = await fetch("/api/cart", {
			  headers: {
					Authorization: `Bearer ${token}`, // Ensure token is included
			  },
		 });
		 
		 const { cartItems } = await res.json();
		 
		 // Find the existing cart item
		 const existingItem = cartItems.find((item) => item.productId === product.id);

		 if (existingItem) {
			  // If the product is already in the cart, update its quantity using PATCH
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
			  // If the product is not in the cart, create a new cart item using POST
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
        const { id } = params; // Use `useParams` to get the dynamic route parameter
        if (!id) throw new Error("Product ID is missing");

        const res = await fetch(`/api/product/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();
        setProduct(data);
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

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <section className="flex items-center justify-center min-h-screen gap-4 pt-[10vh]">
      <div className="flex w-full">
        <div className="flex flex-col items-center justify-center w-1/2 h-[90vh] p-10">
          <div className="flex items-center justify-center border aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              height={300}
              width={300}
              className="object-cover"
            />
          </div>
        </div>
        <div className="flex items-center w-1/2 p-5">
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
  );
}

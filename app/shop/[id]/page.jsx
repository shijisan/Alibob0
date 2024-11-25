"use client"

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation'; // Use Next.js's `useParams` hook for dynamic routing
import Link from 'next/link'; // To link to product pages

const ShopPage = () => {
  const { id } = useParams(); // Use useParams to access the dynamic route parameter
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await fetch(`/api/shop/${id}`);
        const data = await res.json();

        if (res.status === 200) {
          setSeller(data.seller);
          setProductCount(data.productCount);
        } else {
          setError(data.error || "Failed to fetch data");
        }
      } catch (err) {
        setError("An error occurred while fetching seller data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSellerData();
    }
  }, [id]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <section className="w-full min-h-screen pt-[10vh]">
      <section className="p-5">
        <h1 className="mb-4 text-4xl font-semibold">{seller.shopName}</h1>
        <p className="mb-6 text-lg text-gray-700">{seller.shopDescription}</p>
        <p className="mb-8 font-medium text-gray-600 text-md">Total Products: {productCount}</p>
      </section>

      <section className="p-5">
        <h2 className="mb-6 text-2xl font-semibold">Products</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {seller.products.length === 0 ? (
            <p className="h-6 text-center text-gray-500 col-span-full">No products available</p>
          ) : (
            seller.products.map((product) => (
              <div key={product.id} className="p-4 transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-lg">
                <Link href={`/product/${product.id}`}>
                  <div>
                    <img
                      src={product.imageUrl} // Add a placeholder if the image URL is missing
                      alt={product.name}
                      className="object-cover w-auto mb-4 rounded-md h-60 aspect-square"
                      height={250}
                      width={250}
                    />
                    <h3 className="h-8 mb-2 text-xl font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="h-6 mb-4 text-gray-600 truncate">{product.description}</p>
                    <p className="mb-4 text-lg font-bold text-gray-900">Price: ${product.price}</p>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
};

export default ShopPage;

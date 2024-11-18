"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetailsPage({ params }) {
	const [product, setProduct] = useState(null);
	const [error, setError] = useState("");
	const router = useRouter();

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const { id } = await params; // Extract ID from params

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
		<>
		<section className="flex items-center justify-center min-h-screen gap-4 pt-[10vh]">

			<div className="flex w-full">
				<div className="flex flex-col items-center justify-center w-1/2 h-[90vh] p-10">
					<div className="flex items-center justify-center object-cover w-full border h-4/6 aspect-square">
						<img
							src={product.imageUrl}
							alt={product.name}
							className="object-cover"
						/>
					</div>
					<div className="flex w-full h-2/6">
						<img src="https://placehold.co/500/webp" className="w-1/3 border" />
						<img src="https://placehold.co/500/webp" className="w-1/3 border" />
						<img src="https://placehold.co/500/webp" className="w-1/3 border" />
					</div>
				</div>
				<div className="flex flex-col justify-center w-1/2 p-10 space-y-4">
					<h1 className="text-2xl font-semibold">{product.name}</h1>
					<p className="text-lg font-semibold">Price: <span className="font-normal">&#8369;</span>{product.price.toFixed(2)}</p>
					<p className="text-lg">{product.description}</p>
					<div className="flex">
						<button className="px-3 border border-black">-</button>
						<input className="w-2/5 p-2 border border-black rounded-none border-x-0 focus:outline-none" min={1} type="number"/>
						<button className="px-3 border border-black">+</button>
					</div>
					<button className="w-1/2 p-2 border border-black rounded ">Add to Cart</button>
					<button className="w-1/2 p-2 border border-black rounded">Buy Now</button>

				</div>
			</div>

		</section>
		</>

	);
}

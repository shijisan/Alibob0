"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";

export default function HomePage() {
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const res = await fetch("/api/products");
				if (!res.ok) {
					throw new Error("Failed to fetch products");
				}
				const data = await res.json();
				setProducts(data);
			} catch (err) {
				setError(err.message);
			}
		};

		const fetchCategories = async () => {
			try {
				const res = await fetch("/api/categories");
				if (!res.ok) {
					throw new Error("Failed to fetch categories");
				}
				const data = await res.json();
				setCategories(data.categories);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchProducts();
		fetchCategories();
	}, []);

	return (
		<>
			<section className="pt-[10vh] h-full z-0">
				<HeroCarousel />
			</section>

			<section className="px-5 lg:px-32 md:px-16 text-blue-950">
				<section className="flex md:flex-row flex-col w-full lg:h-[25vh] -mt-4 gap-4">
					<div className="z-10 flex flex-col w-full p-5 bg-white rounded shadow lg:w-2/6 md:w-1/2">
						<div className="flex items-center justify-between pb-4 border-b">
							<h3>Shop by Category</h3>
							<a
								className="text-sm text-pink-300 hover:underline"
								href="/categories"
							>
								See More
							</a>
						</div>

						{/* Display categories */}
						<div className="grid items-center h-full grid-cols-1 gap-4 mt-4 lg:gap-2 lg:grid-cols-4 md:grid-cols-2">
							{categories.length > 0 ? (
								categories.map((category) => (
									<a
										key={category.id} // Key applied here
										href={`/search?category=${category.name}`}
										className="font-semibold text-center"
									>
										<div className="py-2 bg-gray-100 rounded shadow hover:shadow-md">
											{category.name}
										</div>
									</a>
								))
							) : (
								<p>No categories found</p>
							)}
						</div>

					</div>
					<div className="z-10 w-full h-full p-5 bg-white rounded shadow lg:w-4/6 md:w-1/2">
						<div className="flex items-center justify-between pb-4 border-b">
							<h3>Promotions</h3>
						</div>
						<div className="grid items-center grid-cols-2 gap-4 mt-4 lg:grid-cols-4 md:grid-cols-3">
							<div className="py-2 font-medium text-center bg-gray-100 rounded shadow hover:shadow-md">Feature 1</div>
							<div className="py-2 font-medium text-center bg-gray-100 rounded shadow hover:shadow-md">Feature 2</div>
						</div>
					</div>
				</section>

				<section className="min-h-screen p-5 mt-4 bg-white rounded shadow">
					<h3 className="mb-4 text-xl font-bold">Suggested Products:</h3>

					{error ? (
						<p className="text-red-500">{error}</p>
					) : products.length > 0 ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
							{products.map((product) => (
								<a
									href={`/product/${product.id}`}
									key={product.id}
									className="block"
								>
									<div className="p-4 bg-gray-100 rounded shadow hover:shadow-md">
										<img
											src={product.imageUrl}
											alt={product.name}
											className="object-cover w-full mb-2 bg-white border rounded h-60 aspect-square"
										/>
										<h4 className="h-8 text-lg font-semibold truncate">{product.name}</h4>
										<p className="h-6 mb-1 text-sm text-gray-500 truncate">
											{product.description}
										</p>
										<p className="font-bold text-blue-700">${product.price}</p>
									</div>
								</a>
							))}
						</div>
					) : (
						<p className="text-gray-500">No products found</p>
					)}
				</section>
			</section>
		</>
	);
}

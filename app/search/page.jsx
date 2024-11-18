"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
	const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
	const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
	const [products, setProducts] = useState([]);
	const [error, setError] = useState("");

	const fetchProducts = async () => {
		try {
			const query = new URLSearchParams({
				...(searchQuery && { search: searchQuery }),
				...(minPrice && { minPrice }),
				...(maxPrice && { maxPrice }),
			}).toString();

			const res = await fetch(`/api/products/search?${query}`);

			if (!res.ok) {
				throw new Error("Failed to fetch products");
			}

			const data = await res.json();

			if (data.length === 0) {
				setProducts([]);
				setError("No products match your search criteria.");
				return;
			}

			setProducts(data);
			setError("");
		} catch (err) {
			setError(err.message || "An unexpected error occurred.");
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [JSON.stringify({ searchQuery, minPrice, maxPrice })]); // Dependency stabilized

	const handleRefineSearch = (e) => {
		e.preventDefault();

		const query = new URLSearchParams({
			...(searchQuery && { search: searchQuery }),
			...(minPrice && { minPrice }),
			...(maxPrice && { maxPrice }),
		}).toString();

		window.location.search = query; // Trigger a navigation to refresh the query
	};

	return (
		<div className="p-6">
			<h1 className="mb-6 text-3xl font-bold">Search Results</h1>

			{error && <p className="mb-4 text-red-500">{error}</p>}

			{/* Refine Search Form */}
			<form onSubmit={handleRefineSearch} className="grid grid-cols-4 gap-4 mb-6">
				<input
					type="text"
					placeholder="Search query"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="col-span-2 p-2 border rounded"
				/>
				<input
					type="number"
					placeholder="Min Price"
					value={minPrice}
					onChange={(e) => setMinPrice(e.target.value)}
					className="p-2 border rounded"
				/>
				<input
					type="number"
					placeholder="Max Price"
					value={maxPrice}
					onChange={(e) => setMaxPrice(e.target.value)}
					className="p-2 border rounded"
				/>
				<button
					type="submit"
					className="col-span-4 p-2 text-white bg-blue-500 rounded"
				>
					Refine Search
				</button>
			</form>

			{/* Product Results */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{products.length > 0 ? (
					products.map((product) => (
						<a
							href={`/product/${product.id}`}
							key={product.id}
							className="block"
						>
							<div className="flex flex-col p-4 border rounded shadow-sm hover:shadow-lg">
								<img
									src={product.imageUrl}
									alt={product.name}
									className="object-cover mb-2 bg-white border rounded aspect-square"
									height={250}
									width={250}
								/>
								<h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
								<p className="mb-2 text-sm text-gray-600">{product.description}</p>
								<p className="font-bold text-blue-600">
									${product.price.toFixed(2)}
								</p>
							</div>
						</a>
					))
				) : (
					!error && <p className="text-gray-500">No products found</p>
				)}
			</div>
		</div>
	);
}

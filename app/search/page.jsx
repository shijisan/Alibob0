"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchResults from "@/components/SearchResults";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
	const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
	const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

	const handleRefineSearch = (e) => {
		e.preventDefault();

		const query = new URLSearchParams({
			...(searchQuery && { search: searchQuery }),
			...(minPrice && { minPrice }),
			...(maxPrice && { maxPrice }),
		}).toString();

		window.location.search = query; 
	};

	return (
		<div className="p-6">
			<h1 className="mb-6 text-3xl font-bold">Search Results</h1>

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

			<SearchResults
				searchQuery={searchQuery}
				minPrice={minPrice}
				maxPrice={maxPrice}
			/>
		</div>
	);
}

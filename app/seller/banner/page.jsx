"use client";

import { useState } from "react";

export default function SellerBanner() {
	const [image, setImage] = useState(null);
	const [title, setTitle] = useState("");
	const [promotionStart, setPromotionStart] = useState("");
	const [promotionEnd, setPromotionEnd] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!image || !promotionStart || !promotionEnd || !title) {
			return alert("Please fill in all fields (title, image, and promotion start/end dates)");
		}

		setLoading(true);

		const token = localStorage.getItem("token");
		if (!token) {
			alert("You are not authorized");
			setLoading(false);
			return;
		}

		const formData = new FormData();
		formData.append("image", image);
		formData.append("promotionStart", promotionStart);
		formData.append("promotionEnd", promotionEnd);
		formData.append("title", title);

		try {
			const res = await fetch("/api/seller/banner", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});
			const data = await res.json();
			alert(data.message || "Request sent!");
		} catch (err) {
			console.error(err);
			alert("Failed to send request");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<section className="min-h-screen pt-[10vh] flex justify-center items-center flex-col">

				<div className="w-full max-w-4xl p-5 bg-white border rounded shadow">
					<h2 className="mb-4 text-2xl font-bold">Request a Banner</h2>
					<ul className="list-disc list-inside">
						<h3>Requirement:</h3>
						<li>18x2 Aspect Ratio (1800px x 200px).</li>
						<li>Banner about shop or product.</li>
					</ul>
					<label htmlFor="title" className="block mb-2">
						Banner Title
					</label>
					<input
						type="text"
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="block w-full p-2 mb-4 border"
						required
					/>
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setImage(e.target.files[0])}
						className="block w-full p-2 mb-4"
					/>
					<label htmlFor="promotionStart" className="block mb-2">
						Promotion Start Date
					</label>
					<input
						type="datetime-local"
						id="promotionStart"
						value={promotionStart}
						onChange={(e) => setPromotionStart(e.target.value)}
						className="block w-full p-2 mb-4 border"
						required
					/>

					<label htmlFor="promotionEnd" className="block mb-2">
						Promotion End Date
					</label>
					<input
						type="datetime-local"
						id="promotionEnd"
						value={promotionEnd}
						onChange={(e) => setPromotionEnd(e.target.value)}
						className="block w-full p-2 mb-4 border"
						required
					/>

					<button
						onClick={handleSubmit}
						className={`px-4 py-2 text-white bg-blue-500 rounded ${loading && "opacity-50 cursor-not-allowed"}`}
						disabled={loading}
					>
						{loading ? "Submitting..." : "Submit Request"}
					</button>
				</div>
			</section>
		</>
	);
}

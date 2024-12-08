"use client";

import { useEffect, useState } from "react";

const ManageBanners = () => {
	const [banners, setBanners] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchBanners = async () => {
			try {
				const token = localStorage.getItem("adminToken");
				const res = await fetch("/api/admin/manage-banner", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					throw new Error("Failed to fetch banners");
				}
				const data = await res.json();
				setBanners(data);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchBanners();
	}, []);

	const handleAction = async (bannerId, action) => {
		try {
			const token = localStorage.getItem("adminToken");
			const res = await fetch("/api/admin/manage-banner", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ bannerId, action }),
			});

			if (!res.ok) {
				throw new Error("Failed to update banner status");
			}

			const updatedBanner = await res.json();
			setBanners((prevBanners) =>
				prevBanners.map((banner) =>
					banner.id === updatedBanner.id ? updatedBanner : banner
				)
			);
		} catch (err) {
			setError(err.message);
		}
	};

	const handleDelete = async (bannerId) => {
		try {
			const token = localStorage.getItem("adminToken");
			const res = await fetch(`/api/admin/manage-banner/${bannerId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error("Failed to delete banner");
			}

			setBanners((prevBanners) =>
				prevBanners.filter((banner) => banner.id !== bannerId)
			);
		} catch (err) {
			setError(err.message);
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	return (
		<section className="min-h-screen pt-[10vh] flex flex-col items-center">
			<h1 className="my-2 text-3xl font-medium">Manage Banner Requests</h1>
			{error && <p className="error">{error}</p>}
			{banners.length === 0 ? (
				<p>No banners available for approval</p>
			) : (
				<div className="flex flex-col items-center justify-center">
					{banners.map((banner) => (
						<div key={banner.id} className="w-full p-5 bg-white border rounded shadow banner-card lg:max-w-[33vw] max-w-full">
							<h2 className="">{banner.title}</h2>
							<p>
								Starts: {formatDate(banner.promotionStart)}
							</p>
							<p>
								Ends: {formatDate(banner.promotionEnd)}
							</p>
							<p className="truncate">
								Requested By: {banner.sellerId}
							</p>
							<img src={banner.imageUrl} alt={banner.title} className="my-4 border" />
							<div className="space-x-4">
								<button
									onClick={() => handleAction(banner.id, "enable")}
									disabled={banner.isActive}
									className="p-2 bg-blue-500 rounded"
								>
									Enable
								</button>
								<button
									onClick={() => handleAction(banner.id, "disable")}
									disabled={!banner.isActive}
									className="p-2 bg-yellow-400 rounded"
								>
									Disable
								</button>
								<button
									onClick={() => handleDelete(banner.id)}
									className="p-2 bg-red-500 rounded delete-button"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
};

export default ManageBanners;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import RecentOrders from "@/components/RecentOrders";

export default function AccountPage() {
	const [accountInfo, setAccountInfo] = useState(null);
	const [orders, setOrders] = useState([]);
	const [products, setProducts] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			console.log("No token found. Redirecting to /login.");
			router.push("/login");
			return;
		}

		const fetchAccountInfo = async () => {
			try {
				const response = await fetch("/api/seller/", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || `Error: ${response.status}`);
				}

				const data = await response.json();
				console.log("Account data fetched:", data);
				setAccountInfo(data);
			} catch (err) {
				console.error("Failed to fetch account info:", err);
				setError(err.message);
				router.push("/login");
			}
		};

		const fetchOrders = async () => {
			try {
				const response = await fetch("/api/seller/manage-orders", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || `Error: ${response.status}`);
				}

				const data = await response.json();
				setOrders(data.orders);
			} catch (err) {
				console.error("Failed to fetch orders:", err);
				setError(err.message);
			}
		};

		const fetchProducts = async () => {
			try {
				const response = await fetch("/api/seller/products", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || `Error: ${response.status}`);
				}

				const data = await response.json();
				setProducts(data.products.slice(0, 3));
			} catch (err) {
				console.error("Failed to fetch products:", err);
				setError(err.message);
			}
		};

		const fetchData = async () => {
			await Promise.all([fetchAccountInfo(), fetchOrders(), fetchProducts()]);
			setLoading(false);
		};

		fetchData();
	}, [router]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	return (
		<section className="flex items-center justify-center min-h-screen gap-4 pt-[10vh]">
			<div className="flex flex-col justify-center w-full h-full max-w-5xl p-5 bg-white border rounded-lg shadow dashboard-container">
				{accountInfo && (
					<>
						<div className="grid items-center w-full grid-cols-1 my-4 lg:grid-cols-2">
							<h2 className="text-2xl font-medium text-center lg:text-start">
								Hi <span className="underline">{accountInfo.shopName}</span>, this is the Seller Dashboard!
							</h2>
							<div className="flex items-center justify-center w-full lg:justify-end">
								<a className="text-center text-blue-500 hover:underline" href="/seller/banner">Promote</a>
								<LogoutButton />
							</div>
						</div>
						<ul className="flex flex-col w-full h-full gap-2 p-5 mb-4 bg-gray-100">
							<h2 className="mb-4 text-xl font-medium">Shop Info</h2>
							<li className="text-sm font-semibold">
								<span className="font-medium">Shop Name:</span> {accountInfo.shopName}
							</li>
							<li className="text-sm font-semibold">
								<span className="font-medium">Description:</span> {accountInfo.shopDescription}
							</li>
							<li className="text-sm font-semibold">
								<span className="font-medium">Role:</span> Seller
							</li>
							<li className="text-sm font-semibold">
								<span className="font-medium">Verified:</span> {accountInfo.isVerified ? "Yes" : "No"}
							</li>
						</ul>

						<RecentOrders orders={orders} />

						{products.length > 0 && (
							<div className="my-4">
								<h2 className="text-xl font-medium">Your Products</h2>
								<div className="grid grid-cols-1 gap-6 mt-2 md:grid-cols-3 lg:grid-cols-4">
									{products.map((product) => (
										<a
											href={`/product/${product.id}`}
											key={product.id}
											className="block p-4 border rounded shadow-sm hover:shadow-lg"
										>
											<div className="flex flex-col">
												<img
													src={product.imageUrl}
													alt={product.name}
													className="object-cover mb-2 bg-white rounded aspect-square"
													height={250}
													width={250}
												/>
												<h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
												<p className="mb-2 text-sm text-gray-600 truncate">{product.description}</p>
												<p className="font-bold text-blue-600">${product.price.toFixed(2)}</p>
											</div>
										</a>
									))}
								</div>
								<div className="w-full py-2 text-center">
									<a className="text-blue-500 hover:underline" href={`/shop/${accountInfo.id}`}>View Shop Products</a>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}

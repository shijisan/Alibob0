"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function SellerAccount() {
	const [user, setUser] = useState(null);  // Changed to user instead of seller
	const [seller, setSeller] = useState(null);  // Add state for seller data
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			console.log("No token found. Redirecting to /login.");
			router.push("/login");
			return;
		}

		const fetchUserData = async () => {
			try {
				// First, fetch user data from /api/buyer/account
				const resAccount = await fetch("/api/buyer/account", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (resAccount.ok) {
					const data = await resAccount.json();
					console.log("User data fetched:", data);

					// Handle role and isVerified logic
					if (data.role === "BUYER" && !data.isVerified) {
						console.log("Case: Buyer, isVerified = false. Redirecting to /login.");
						router.push("/login");
						return;
					}

					if (data.role === "SELLER") {
						// Fetch seller verification status from /api/seller
						const resSeller = await fetch("/api/seller", {
							method: "GET",
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});

						if (!resSeller.ok) {
							const sellerData = await resSeller.json();
							setError(sellerData.error || "Failed to fetch seller data");
							return;
						}

						const sellerData = await resSeller.json();
						console.log("Seller data fetched:", sellerData);

						if (sellerData.isVerified) {
							console.log("Case: Seller, isVerified = true. Access granted.");
							setUser(data);  // Set the user data here
							setSeller(sellerData);  // Set the seller data here
						} else {
							console.log("Case: Seller, isVerified = false. Redirecting to /seller/setup.");
							router.push("/seller/setup");
							return;
						}
					}
				} else {
					const data = await resAccount.json();
					console.log("Error response from /api/buyer/account:", data);
					setError(data.message || "An error occurred while fetching user data.");
				}
			} catch (err) {
				console.log("Error fetching user data:", err);
				setError("Failed to fetch user data");
			} finally {
				setLoading(false);
			}
		};

		fetchUserData();
	}, [router]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	return (
		<>
			<section className="flex items-center justify-center min-h-screen gap-4">
				<div className="flex flex-col justify-center w-full h-full p-5 border rounded-lg shadow lg:w-1/2 dashboard-container lg:h-52">
					<h2 className="text-2xl font-medium">Welcome to your Seller Dashboard</h2>
					{user && seller && user.role === "SELLER" && (
						<>
							<p>Shop Name: {seller.shopName}</p>
							<p>Shop Description: {seller.shopDescription || "No description provided"}</p>
							<p>Verification Status: {seller.isVerified ? "Verified" : "Not Verified"}</p>
						</>
					)}
					<div>
						<LogoutButton />
					</div>
				</div>
				<ul className="flex flex-col w-1/2 h-full p-5 list-disc list-inside border rounded-lg shadow lg:h-52">
					<h2 className="text-2xl font-medium">Links:</h2>
					<li><a className="text-blue-500 underline" href="/seller/products">Manage Products</a></li>
				</ul>
			</section>
		</>
	);
}

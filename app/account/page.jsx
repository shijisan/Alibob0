"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import RecentOrders from "@/components/RecentOrders";

export default function AccountPage() {
	const [accountInfo, setAccountInfo] = useState(null);
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
				const response = await fetch("/api/buyer/account", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || `Error: ${response.status}`);
				}

				const data = await response.json();
				console.log("Account data fetched:", data);
				setAccountInfo(data);
			} catch (err) {
				console.error("Failed to fetch account info:", err);
				setError(err.message);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		fetchAccountInfo();
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
						<div className="grid w-full grid-cols-1 my-4 lg:grid-cols-2">
							<h2 className="self-center text-2xl font-medium text-center lg:self-start lg:text-start">Hi <span className="underline">{accountInfo.name}</span>, this is the Buyer Dashboard!</h2>
							<div className="flex justify-center w-full lg:justify-end">
								<LogoutButton />
							</div>
						</div>
						<ul className="flex flex-col w-full h-full gap-2 p-5 mb-4 bg-gray-100">
							<h2 className="mb-4 text-xl font-medium">Account Info</h2>
							<li className="text-sm font-semibold">
								<span className="font-medium">Name:</span> {accountInfo.name}
							</li>
							<li className="text-sm font-semibold">
								<span className="font-medium">Email:</span> {accountInfo.email}
							</li>
							<li className="text-sm font-semibold">
								<span className="font-medium">Role:</span> {accountInfo.role}
							</li>
							<li className="text-sm font-semibold">
								<span className="font-medium">Joined:</span> {new Date(accountInfo.createdAt).toLocaleDateString()}
							</li>
						</ul>

						<RecentOrders />
					</>
				)}
			</div>
		</section>
	);
}

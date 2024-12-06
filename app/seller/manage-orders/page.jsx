"use client";

import { useEffect, useState } from "react";

const ManageOrdersPage = () => {
	const [orders, setOrders] = useState([]);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState("");
	const [expandedOrderId, setExpandedOrderId] = useState(null); // Track expanded order

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		if (storedToken) {
			setToken(storedToken);
		} else {
			setError("Authorization token is missing.");
		}
	}, []);

	const fetchOrders = async () => {
		if (!token) return;

		setLoading(true);
		setError("");
		try {
			const res = await fetch("/api/seller/manage-orders", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				const data = await res.json();

				// Normalize address properties
				const ordersWithNormalizedAddresses = data.orders.map((order) => ({
					...order,
					address: order.addressLine1
						? {
							line1: order.addressLine1,
							line2: order.addressLine2,
							city: order.city,
							province: order.province,
							postalCode: order.postalCode,
							country: order.country,
						}
						: null,
				}));

				// Log normalized orders and addresses for debugging
				console.log("Normalized orders:", ordersWithNormalizedAddresses);

				setOrders(ordersWithNormalizedAddresses || []);
			} else {
				throw new Error("Failed to fetch orders.");
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};



	const handleOrderAction = async (orderId, action) => {
		if (!token) {
			setError("Authorization token is missing.");
			return;
		}

		try {
			const res = await fetch(`/api/seller/manage-orders/${orderId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ action }),
			});

			if (res.ok) {
				const data = await res.json();
				setOrders((prev) =>
					prev.map((order) =>
						order.id === orderId ? { ...order, status: data.order.status } : order
					)
				);
				setMessage(`Order ${action === "accept" ? "accepted" : "denied"} successfully.`);
			} else {
				const errorData = await res.json();
				setError(errorData.error || "Failed to update order.");
			}
		} catch (err) {
			setError(err.message);
		}
	};

	const toggleExpandOrder = (orderId) => {
		setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
	};

	useEffect(() => {
		if (token) fetchOrders();
	}, [token]);

	return (
		<section className="min-h-screen p-6">
			<h1 className="text-2xl font-bold">Manage Orders</h1>

			{error && <p className="mt-4 text-red-500">{error}</p>}
			{message && <p className="mt-4 text-green-500">{message}</p>}

			{loading ? (
				<p>Loading orders...</p>
			) : (
				<table className="w-full mt-6 border border-collapse border-gray-300">
					<thead>
						<tr>
							<th className="px-4 py-2 border">Order ID</th>
							<th className="px-4 py-2 border">Buyer</th>
							<th className="px-4 py-2 border">Items</th>
							<th className="px-4 py-2 border">Status</th>
							<th className="px-4 py-2 border">Actions</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id}>
								<td className="px-4 py-2 border">{order.id}</td>
								<td className="px-4 py-2 border">{order.user.name}</td>
								<td className="px-4 py-2 border">
									{order.items.map((item) => (
										<div key={item.id}>
											{item.product.name} x {item.quantity}
										</div>
									))}
								</td>
								<td className="px-4 py-2 border">{order.status}</td>
								<td className="px-4 py-2 border">
									{order.status === "coordinating_with_shipping" && (
										<>
											<button
												onClick={() => handleOrderAction(order.id, "accept")}
												className="px-3 py-1 mr-2 text-white bg-green-500 rounded"
											>
												Accept
											</button>
											<button
												onClick={() => handleOrderAction(order.id, "deny")}
												className="px-3 py-1 text-white bg-red-500 rounded"
											>
												Deny
											</button>
										</>
									)}
									{order.status !== "coordinating_with_shipping" && (
										<span>{order.status}</span>
									)}
									<button
										onClick={() => toggleExpandOrder(order.id)}
										className="ml-2 text-blue-500 underline"
									>
										{expandedOrderId === order.id ? "Hide Details" : "Show Details"}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{expandedOrderId && (
				<div className="p-4 mt-6 border border-gray-300 rounded-md">
					{orders
						.filter((order) => order.id === expandedOrderId)
						.map((order) => (
							<div key={order.id}>
								<h3 className="font-semibold">Shipping Address</h3>
								{order.address ? (
									<>
										<p>{order.address.line1}</p>
										{order.address.line2 && <p>{order.address.line2}</p>}
										<p>
											{order.address.city}, {order.address.province}
										</p>
										<p>{order.address.postalCode}</p>
										<p>{order.address.country}</p>
									</>
								) : (
									<p>No address information available.</p>
								)}

								<h3 className="mt-4 font-semibold">Total Amount: ${order.totalAmount}</h3>
								<h3 className="mt-4 font-semibold">Buyer Information</h3>
								<p>Name: {order.user.name}</p>
								<p>Email: {order.user.email}</p>
							</div>
						))}
				</div>
			)}
		</section>
	);
};

export default ManageOrdersPage;

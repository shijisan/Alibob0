"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = `${firstName} ${lastName}`;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error("Registration failed. Please try again.");
      }

      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleRegister} className="flex-col p-5 space-y-3 border shadow rounded-xl">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <h2 className="text-3xl font-medium text-center">Register</h2>
        <div className="flex flex-col">
          <label htmlFor="name">Full Name:</label>
          <div className="flex w-full" id="name">
            <input
              className="w-1/2 p-1 border rounded-s border-e-0"
              type="text"
              id="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              className="w-1/2 p-1 border rounded-e"
              type="text"
              id="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">Email:</label>
          <input
            className="p-1 border rounded"
            type="email"
            id="email"
            placeholder="johndoe@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password:</label>
          <input
            className="p-1 border rounded"
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            className="p-1 border rounded"
            type="password"
            id="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="flex w-full">
          <button
            type="submit"
            className="w-1/2 p-2 mt-3 transition-colors bg-pink-300 border rounded-lg hover:bg-pink-400 text-blue-950 rounded-e-none border-e-0"
          >
            Register
          </button>
          <a className="w-1/2" href="/login">
            <button
              type="button"
              className="w-full p-2 mt-3 transition-colors bg-blue-100 border rounded-lg text-blue-950 hover:bg-blue-300 rounded-s-none"
            >
              Login
            </button>
          </a>
        </div>
      </form>
    </section>
  );
}

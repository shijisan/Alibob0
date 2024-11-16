"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [errorMessage, setErrorMessage] = useState("");
   const router = useRouter();

   const handleLogin = async (e) => {
      e.preventDefault();

      if (!email || !password) {
         setErrorMessage("Both fields are required");
         return;
      }

      try {
         const response = await fetch("/api/login", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
         });

         if (!response.ok) {
            throw new Error("Login failed. Please check your credentials.");
         }

         const data = await response.json();
         router.push("/account");
         console.log("Login successful:", data);

         localStorage.setItem("token", data.token);

         setEmail("");
         setPassword("");
         setErrorMessage("");
      } catch (error) {
         console.error("Login error:", error);
         setErrorMessage(error.message);
      }
   };

   return (
      <section className="flex items-center justify-center min-h-screen p-5">
         <form onSubmit={handleLogin} className="flex-col w-full p-5 space-y-3 border shadow lg:w-1/3 md:w-1/2 rounded-xl">
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <h2 className="text-3xl font-medium text-center">Login</h2>
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

            <div className="flex w-full">
               <button type="submit" className="w-1/2 p-2 mt-3 transition-colors bg-pink-300 border rounded-lg rounded-e-none border-e-0 hover:bg-pink-400 text-blue-950">
                  Login
               </button>
               <a className="w-1/2" href="/register"><button type="button" className="w-full p-2 mt-3 transition-colors bg-blue-100 border rounded-lg rounded-s-none hover:bg-blue-300 text-blue-950">
                  Register
               </button></a>
            </div>
         </form>
      </section>
   );
}

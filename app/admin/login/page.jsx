"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Failed to login');
        return;
      }

      const { token } = await res.json();
      localStorage.setItem('adminToken', token); 

      router.push('/admin/dashboard'); 
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <section className="flex items-center justify-center w-full min-h-screen">
        <form onSubmit={handleSubmit} className="w-full p-5 space-y-4 bg-white border shadow lg:w-1/3 md:w-1/2 rounded-xl">
          <h2 className="text-3xl font-medium text-center">Admin Login</h2>
          {error && <p className="text-center text-red-500">{error}</p>}
          <div className="flex flex-col">
            <label htmlFor="username">Username:</label>
            <input
              className="p-1 border rounded"
              type="text"
              placeholder="John Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="password">Password:</label>
            <input
              className="p-1 border rounded"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full p-2 transition-colors bg-blue-100 rounded-lg text-blue-950 hover:bg-blue-300">Login</button>
        </form>
      </section>
    </>
  );
}

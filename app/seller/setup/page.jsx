"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerSetupPage() {
   const [shopName, setShopName] = useState('');
   const [shopDescription, setShopDescription] = useState('');
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);
   const router = useRouter();

   useEffect(() => {
      const checkSellerVerification = async () => {
         const token = localStorage.getItem('token');
         if (!token) {
            setError('No token found. Please log in.');
            return;
         }
   
         try {
            const res = await fetch('/api/seller', {
               method: 'GET',
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
   
            if (!res.ok) {
               const data = await res.json();
               setError(data.error || 'Failed to fetch seller verification status');
               return;
            }
   
            const seller = await res.json();
            if (seller.isVerified) {
               router.push('/seller/account');
            }
         } catch (err) {
            setError('Failed to verify seller status');
         }
      };
   
      checkSellerVerification();
   }, [router]);
   

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         const token = localStorage.getItem('token'); 
         const res = await fetch('/api/seller/setup', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
               shopName,
               shopDescription,
            }),
         });

         if (res.ok) {
            router.push('/seller/account'); 
         } else {
            const data = await res.json();
            setError(data.error || 'An error occurred');
         }
      } catch (err) {
         setError('Failed to create seller');
      } finally {
         setLoading(false);
      }
   };

   return (
      <section className="flex flex-col items-center justify-center min-h-screen seller-setup-container">

         {error && <p className="error">{error}</p>}
         <form className='flex flex-col justify-center w-full p-5 space-y-4 border shadow rounded-xl lg:w-1/3 md:w-1/2' onSubmit={handleSubmit}>
            <h2 className='text-3xl font-medium text-center'>Setup Seller Account</h2>
            <div className="flex flex-col">
               <label>
                  Shop Name:
               </label>
                  <input
                     className='p-1 border rounded'
                     type="text"
                     value={shopName}
                     onChange={(e) => setShopName(e.target.value)}
                     required
                     placeholder='Chris&apos; Drug Store'
                  />
               </div>

            <div className="flex flex-col">
            <label>
               Shop Description:
            </label>
               <textarea
                  className='p-1 border rounded'
                  value={shopDescription}
                  onChange={(e) => setShopDescription(e.target.value)}
                  required
                  placeholder='One stop shop for the best quality drugs...'
               />
            </div>

            <button className='p-2 transition-colors bg-blue-100 rounded-lg text-blue-950 hover:bg-blue-300' type="submit" disabled={loading}>
               {loading ? 'Creating...' : 'Create Seller Account'}
            </button>
         </form>
      </section   >
   );
}

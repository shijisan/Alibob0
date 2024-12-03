"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faCartShopping } from "@fortawesome/free-solid-svg-icons";

export default function AdminNavBar() {
   const [menuOpen, setMenuOpen] = useState(false); 

   const handleMenu = () => {
      setMenuOpen(!menuOpen); 
   };

   return (
      <>
         <nav className="px-5 h-[10vh] bg-gradient-to-b from-blue-100 via-blue-100 via-50% to-pink-300 text-blue-950 w-full fixed top-0 flex justify-evenly font-medium z-30">
            <div className="inline-flex items-center w-1/2 lg:w-1/2 justify-evenly">
               <h2 className="hidden text-2xl font-bold md:block">ALIBOBO ADMINS</h2>
            </div>

            <div className="flex items-center justify-center md:hidden">
               <a href="/cart"><FontAwesomeIcon icon={faCartShopping} /></a>
            </div>

            <div className="flex items-center justify-center md:hidden">
               {/* Toggle between bars and times icon */}
               <button onClick={handleMenu}>
                  <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
               </button>
            </div>

            <div
               className={`md:hidden ${menuOpen ? "flex" : "hidden"} flex-col items-center absolute top-[10vh] left-0 w-full bg-gradient-to-b from-blue-100 to-pink-300 z-20`}
            >
               <ul className="w-full text-center bg-pink-300 md:bg-transparent">
                  <li><a href="/account" className="block py-2">Buyer</a></li>
                  <li><a href="/admin/dashboard" className="block py-2">Dashboard</a></li>
                  <li><a href="/admin/manage-sellers" className="block py-2">Sellers</a></li>
                  <li><a href="/admin/categories" className="block py-2">Categories</a></li>
               </ul>
            </div>

            <ul className="items-center hidden w-1/2 md:inline-flex justify-evenly">
               <li><a href="/account">Buyer</a></li>
               <li><a href="/admin/dashboard">Dashboard</a></li>
               <li><a href="/admin/manage-sellers">Sellers</a></li>
               <li><a href="/admin/categories">Categories</a></li>
            </ul>
         </nav>
      </>
   );
}

"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage(){

   const router = useRouter();

   useEffect(()=>{
      const token = localStorage.getItem("token");
      console.log(token);
      if (!token){
         router.push("/login");
      }
   }, [router]);
   
   return(
   <>
   
   </>
   );
}
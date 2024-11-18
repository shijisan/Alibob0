import { useRouter } from "next/navigation";

export default function LogoutButton(){

   const router = useRouter();

   const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      router.push("/login");
   }

   return(
   <>
      <button className="px-4 py-2 text-white bg-red-500 border rounded-md" onClick={handleLogout}>LOGOUT</button>
   </>
   );
}
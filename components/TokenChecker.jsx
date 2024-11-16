"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TokenChecker() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const restrictedPaths = ["/account", "/seller"];

    const isRestrictedPath = restrictedPaths.some((path) => window.location.pathname.startsWith(path));

    if (isRestrictedPath) {
      if (!token) {
        router.push("/login");
      } else {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);

          if (decoded.exp < currentTime) {
            localStorage.removeItem("token");
            router.push("/login");
          }
        } catch (error) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    }
  }, [router]);

  return null;
}

import { Poppins } from "next/font/google";
import { Suspense } from "react";
import AdminNavBar from "@/components/AdminNavBar";
import TokenChecker from "@/components/TokenChecker";
import "../globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Alibobo Admin",
  description: "Made by twinkstian lebonbon james santolomew",
};

export default function AdminLayout({ children }) {
  return (
    <div className={poppins.className}>
      <Suspense fallback={<p>Loading...</p>}>
        <AdminNavBar />
        <TokenChecker />
        {children}
      </Suspense>
    </div>
  );
}

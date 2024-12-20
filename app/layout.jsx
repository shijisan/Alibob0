import { Poppins } from "next/font/google";
import { Suspense } from "react"; 
import "./globals.css";
import NavBar from "@/components/NavBar";
import TokenChecker from "@/components/TokenChecker";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Alibobo",
  description: "Made by twinkstian lebonbon james santolomew",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`}>
        <Suspense fallback={<p>Loading...</p>}>
          <NavBar />
          <TokenChecker />
          {children}
        </Suspense>
      </body>
    </html>
  );
}

import { Inter } from "next/font/google";

import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={inter.className}>
      <Navbar />
      <main className="h-[calc(100vh-56.8px)] mx-auto max-w-[82rem]">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

type DashboardUser = {
   id: string;
   name: string;
   email: string;
   role: string;
};

type UserResponse = {
   success: boolean;
   data?: DashboardUser;
};

const Home = () => {
   const router = useRouter();

   useEffect(() => {
      const checkSession = async () => {
         try {
            const response = await fetch("/api/users/me");
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
               router.replace("/login");
               return;
            }
            const result = await response.json() as UserResponse;

            if (result.success && result.data) {
               if (result.data.role === "admin") {
                  router.replace("/admin/dashboard");
               } else {
                  router.replace("/dashboard");
               }
            } else {
               router.replace("/login");
            }
         } catch {
            router.replace("/login");
         }
      };

      void checkSession();
   }, [router]);

   return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-(--pertama) text-(--kedua)">
         <div className="flex flex-col items-center gap-4">
            <div className="animate-pulse">
               <ShieldCheck size={64} className="text-(--kedua)" />
            </div>

            <h2 className="text-xl font-medium tracking-wide">
               PsychoLab
            </h2>
         </div>
      </div>
   );
};

export default Home;
import { FaceModelPreloader } from "@/components/FaceModelPreloader";
import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
   subsets: ["latin"],
   weight: ["300", "400", "500", "600", "700"],
   variable: "--font-poppins",
});

export const metadata: Metadata = {
   title: "Presensi Psikologi",
   description: "Sistem Presensi Asisten Laboratorium Psikologi",
   formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="id" data-scroll-behavior="smooth" className={`${poppins.variable} `} suppressHydrationWarning>
         <body className="min-h-screen bg-(--background) text-(--pertama)" suppressHydrationWarning>
            <NextTopLoader
               color="var(--pertama)"
               initialPosition={0.08}
               crawlSpeed={200}
               height={3}
               crawl={true}
               showSpinner={false}
               easing="ease"
               speed={200}
               shadow="0 0 10px var(--pertama),0 0 5px var(--pertama)"
            />
            <FaceModelPreloader />
            {children}
            <Toaster position="top-right" closeButton richColors visibleToasts={1} />
         </body>
      </html>
   );
}
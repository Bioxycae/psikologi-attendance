import { FaceModelPreloader } from "@/components/FaceModelPreloader";
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
            <FaceModelPreloader />
            {children}
            <Toaster position="bottom-left" closeButton richColors className="toaster-responsive" />
         </body>
      </html>
   );
}
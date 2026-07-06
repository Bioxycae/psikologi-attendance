import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: "standalone",
   allowedDevOrigins: [
      "*.ngrok-free.app",
      "*.ngrok-free.dev",
      "*.ngrok.io",
   ],
   async headers() {
      return [
         {
            source: "/models/:all*(.*)",
            headers: [
               {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
               },
            ],
         },
         {
            source: "/:path*",
            headers: [
               {
                  key: "X-Frame-Options",
                  value: "SAMEORIGIN",
               },
               {
                  key: "X-Content-Type-Options",
                  value: "nosniff",
               },
               {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
               },
               {
                  key: "Cross-Origin-Opener-Policy",
                  value: "same-origin",
               },
               {
                  key: "Content-Security-Policy",
                  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://get.geojs.io https://ipapi.co https://nominatim.openstreetmap.org; frame-ancestors 'none';",
               },
            ],
         },
      ];
   },
};

export default nextConfig;

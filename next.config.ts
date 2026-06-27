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
      ];
   },
};

export default nextConfig;

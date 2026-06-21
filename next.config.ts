import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: "standalone",
   allowedDevOrigins: [
      "*.ngrok-free.app",
      "*.ngrok-free.dev",
      "*.ngrok.io",
   ],
};

export default nextConfig;

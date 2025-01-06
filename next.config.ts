import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: "5mb", // Ajusta el límite de tamaño si es necesario
    },
  },
};

export default nextConfig;

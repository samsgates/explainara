import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@explainara/ai",
    "@explainara/assessments",
    "@explainara/director",
    "@explainara/knowledge",
    "@explainara/learner",
    "@explainara/mastery",
    "@explainara/memory",
    "@explainara/openmaic-adapter",
    "@explainara/shared",
    "@explainara/skills"
  ],
  experimental: { optimizePackageImports: ["lucide-react"] }
};
export default nextConfig;

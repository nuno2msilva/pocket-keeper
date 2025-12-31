/**
 * Vite Configuration
 * 
 * Sets up the development server and build process.
 * Includes PWA plugin for offline support.
 * 
 * DYNAMIC BASE PATH:
 * The base path is automatically determined from the GITHUB_REPOSITORY environment variable
 * when building in GitHub Actions. For local development, it defaults to '/'.
 * This ensures the deployment works regardless of the repository name.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Dynamically determine the base path for GitHub Pages deployment.
 * - In GitHub Actions: uses the repository name from GITHUB_REPOSITORY env var
 * - In local development: uses '/' for root-relative paths
 * - Fallback to '/' if no repository info is available
 */
function getBasePath(): string {
  // GitHub Actions sets GITHUB_REPOSITORY as 'owner/repo-name'
  const githubRepo = process.env.GITHUB_REPOSITORY;
  
  if (githubRepo) {
    // Extract repository name from 'owner/repo-name' format
    const repoName = githubRepo.split('/')[1];
    if (repoName) {
      return `/${repoName}/`;
    }
  }
  
  // For local development or when not in GitHub Actions
  return '/';
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const basePath = getBasePath();
  
  // Log the base path for debugging during builds
  console.log(`[Vite Config] Building with base path: ${basePath}`);
  
  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      // React with SWC for fast compilation
      react(),
      
      // Development helper for Lovable
      mode === "development" && componentTagger(),
      
      // PWA Plugin - enables offline support
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "placeholder.svg"],
        manifest: {
          name: "ExpenseTrack - Smart Expense Tracking",
          short_name: "ExpenseTrack",
          description: "Track your expenses with detailed receipts, merchants, and products.",
          theme_color: "#1a9b8a",
          background_color: "#f5f7fa",
          display: "standalone",
          orientation: "portrait",
          start_url: basePath,
          icons: [
            {
              src: "/favicon.ico",
              sizes: "64x64",
              type: "image/x-icon",
            },
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // Cache all static assets
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          // Runtime caching for API calls (future use)
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

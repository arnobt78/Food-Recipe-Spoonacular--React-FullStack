import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Proxy API requests to Vercel dev server (when running locally)
  // Frontend runs on port 3000, backend API on port 3001
  // When Vercel dev runs from parent directory with Root Directory setting,
  // it expects requests at /api/* which are forwarded correctly
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VERCEL_DEV_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        // Preserve the original path and query string
        // Vercel dev expects /api/* paths, so we keep them as-is
        rewrite: (path) => {
          // CRITICAL: Keep /api prefix - Vercel catch-all route expects full path
          // The catch-all route [...path].ts is at /api/recipes/[...path]
          // Vercel will extract path segments from request.query.path
          // Example: /api/recipes/716426/information → Vercel extracts ["716426", "information"]
          // We keep the full path so Vercel can properly route it
          return path;
        },
        // Configure proxy to handle errors gracefully
        configure: (proxy, _options) => {
          proxy.on("error", (_err, _req, _res) => {
            console.log(
              "⚠️  Vercel dev server not running. API calls will fail."
            );
            console.log(
              "💡 Run: npm run dev (starts both frontend and backend)"
            );
          });
          // Log proxy requests in development for debugging
          if (process.env.NODE_ENV === "development") {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(`[Vite Proxy] ${req.method} ${req.url} → ${proxyReq.path}`);
            });
          }
        },
      },
    },
  },
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        // Code splitting: Separate vendor chunks
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["framer-motion", "lucide-react"],
          "auth-vendor": ["@auth0/auth0-react"],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional)
    sourcemap: false,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query", "framer-motion"],
  },
});

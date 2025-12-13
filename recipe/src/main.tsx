import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";
import { Toaster } from "sonner";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { setupCachePersistence } from "./utils/queryCachePersistence";
import { setupDevConsole } from "./utils/devConsole";
import "./global.css";

/**
 * Application Entry Point
 *
 * Sets up:
 * - React Query with infinite cache strategy (following REACT_QUERY_SETUP_GUIDE.md)
 * - Toast notifications (Sonner) for user feedback
 * - Global CSS (Tailwind + custom styles)
 *
 * Following DEVELOPMENT_RULES.md and REACT_QUERY_SETUP_GUIDE.md patterns
 */

/**
 * React Query Client Configuration
 *
 * Production-ready setup following REACT_QUERY_SETUP_GUIDE.md:
 * - staleTime: Infinity = Data never becomes stale automatically
 * - refetchOnMount: true = Refetch ONLY when data is stale (invalidated)
 * - Result: Cache forever until manually invalidated, then refetch once
 * - Optimized retry and garbage collection settings
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CRITICAL: Data never becomes stale automatically
      // Only becomes stale when manually invalidated
      staleTime: Infinity,

      // Keep in cache for 5 minutes after component unmounts
      // Adjust based on your needs (longer = more memory, faster loads)
      gcTime: 50 * 60 * 1000,

      // Retry once on failure (faster failure = faster error display)
      retry: 1,

      // Don't refetch on window focus (prevents unnecessary requests)
      refetchOnWindowFocus: false,

      // Don't refetch on reconnect (prevents unnecessary requests)
      refetchOnReconnect: false,

      // CRITICAL: Refetch if data is stale (after invalidation)
      // With staleTime: Infinity, this only triggers after invalidation
      // Normal visits use cache, after invalidation it refetches
      refetchOnMount: true,

      // Use cached data as placeholder while refetching in background
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Don't retry mutations (user should retry manually)
      retry: 0,
    },
  },
});

/**
 * Auth0 Configuration
 * Uses environment variables from .env.local
 */
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || "";
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "";
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE || "";

/**
 * Setup app utilities on initialization
 * - Cache persistence to localStorage
 * - Development console utilities
 */
function setupApp() {
  // Setup automatic cache persistence
  setupCachePersistence(queryClient);

  // Setup development console utilities (dev only)
  setupDevConsole();
}

// Setup cache persistence
setupApp();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: auth0Audience,
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </QueryClientProvider>
      </Auth0Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

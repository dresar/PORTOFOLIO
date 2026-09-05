import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n.ts";

// Auto-recovery for stale dynamic imports after production deployment
const handleChunkError = () => {
  const lastReload = sessionStorage.getItem('chunk_reload_ts');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem('chunk_reload_ts', String(now));
    // Hard reload with cache busting
    const url = new URL(window.location.href);
    url.searchParams.set('reload', String(now));
    window.location.href = url.toString();
  }
};

// Vite-specific dynamic import preload error
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  handleChunkError();
});

// Promise rejection when importing chunk
window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event?.reason?.message || event?.reason || '');
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  ) {
    event.preventDefault();
    handleChunkError();
  }
});

// Global script load error
window.addEventListener('error', (event) => {
  const msg = String(event?.message || '');
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module')
  ) {
    event.preventDefault();
    handleChunkError();
  }
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

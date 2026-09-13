import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n.ts";

const handleChunkError = async () => {
  const lastReload = sessionStorage.getItem('chunk_reload_ts');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 6000) {
    sessionStorage.setItem('chunk_reload_ts', String(now));
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      } catch {}
    }
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      } catch {}
    }
    const url = new URL(window.location.href);
    url.searchParams.set('reload', String(now));
    window.location.replace(url.toString());
  }
};

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  handleChunkError();
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event?.reason?.message || event?.reason || '');
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Failed to load module script') ||
    msg.includes('MIME type') ||
    msg.includes('Strict MIME type')
  ) {
    event.preventDefault();
    handleChunkError();
  }
});

window.addEventListener(
  'error',
  (event) => {
    const msg = String(event?.message || '');
    const isScript = event.target && (event.target as HTMLElement).tagName === 'SCRIPT';
    if (
      isScript ||
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Failed to load module script') ||
      msg.includes('MIME type') ||
      msg.includes('Strict MIME type')
    ) {
      event.preventDefault();
      handleChunkError();
    }
  },
  true
);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

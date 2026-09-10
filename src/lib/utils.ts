import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://server1-etech.vercel.app";

export function normalizeMediaUrl(raw?: string | null) {
  if (!raw) return "";
  let url = raw.trim();
  if (!url) return "";
  
  // If it's already a full URL (http:// or https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
     return url;
  }

  if (import.meta.env.VITE_BACKEND_URL && url.startsWith(import.meta.env.VITE_BACKEND_URL)) {
      url = url.replace(import.meta.env.VITE_BACKEND_URL, "");
  }

  // Handle paths starting with /media, /static, /uploads or just filenames
  const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
  
  // Clean up leading slash
  if (url.startsWith('/')) {
    url = url.substring(1);
  }

  // If path doesn't start with known prefixes, assume it needs one (optional, based on backend)
  // But usually backend returns "uploads/..." or "media/..."
  
  return `${baseUrl}/${url}`;
}

export function formatCompactNumber(number: number): string {
  if (number < 1000) {
    return number.toString();
  }
  return Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    // console.warn("JSON Parse Error:", e, value);
    return fallback;
  }
}

export function sanitizeHtmlContent(raw?: string | null): string {
  if (!raw) return '';
  let content = raw.trim();
  
  // Strip markdown code block start: ```html or ```
  content = content.replace(/^```(?:html|xml|markdown)?\s*/gi, '');
  
  // Strip markdown code block end: ```
  content = content.replace(/\s*```$/gi, '');
  
  // Sanitize with DOMPurify to prevent XSS while preserving rich-text formatting
  return DOMPurify.sanitize(content.trim(), {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'img', 'span', 'div', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'br', 'sub', 'sup', 'figure', 'figcaption',
      'section', 'article', 'aside', 'header', 'footer', 'details', 'summary', 'dl', 'dt', 'dd', 'mark', 'kbd'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'width', 'height', 'title', 'loading'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'formaction'],
  });
}

export function safeUrl(raw?: string | null, fallback = '#'): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  // Block javascript:, data:, vbscript: and dangerous pseudo-protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return fallback;
  }

  // Allow standard web protocols, mailto, tel, and relative paths
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) {
    return trimmed;
  }

  // If user entered "domain.com/path", treat as https://
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return fallback;
}

export function getCloudinaryVideoThumbnail(url?: string | null): string {
  if (!url) return '';
  if (url.includes('/video/upload/')) {
    // Cloudinary automatically generates an image frame poster thumbnail when changing video extension to .jpg
    return url.replace(/\.(mp4|webm|mov|mkv|avi)$/i, '.jpg');
  }
  return url;
}


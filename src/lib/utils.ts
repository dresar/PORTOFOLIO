import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://server1-etech.vercel.app";

export interface MediaUrlOptions {
  width?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
}

export function normalizeMediaUrl(raw?: string | null, options?: MediaUrlOptions): string {
  if (!raw) return "";
  let url = raw.trim();
  if (!url) return "";

  if (url.includes('cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/')) {
    return `/media/${url.split('public/')[1]}`;
  }

  if (url.startsWith('/media/') || url.startsWith('media/')) {
    return `/${url.replace(/^\/+/, '')}`;
  }

  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    return `/media/${url.replace(/^\/+/, '')}`;
  }

  if (url.includes('uploads/articles')) {
    const match = url.match(/uploads\/articles\/.+$/);
    if (match) {
      return `/media/${match[0]}`;
    }
    return url;
  }

  const width = options?.width;
  const quality = options?.quality || 80;

  if (url.includes('ik.imagekit.io')) {
    if (!url.includes('tr=') && !url.includes('/tr:')) {
      const w = width || 600;
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}tr=w-${w},q-${quality || 75},f-auto`;
    }
    return url;
  }

  if (url.includes('images.unsplash.com')) {
    if (width) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}w=${width}&auto=format&q=${quality}`;
    }
    return url;
  }

  if (
    (url.startsWith('http://') || url.startsWith('https://')) &&
    !url.endsWith('.svg') &&
    !url.includes('.svg?') &&
    (url.includes('upload.wikimedia.org') || url.includes('vecteezy.com') || url.includes('googleusercontent.com'))
  ) {
    const w = width || 600;
    return `https://wsrv.nl/?url=${url.replace(/^https?:\/\//, '')}&w=${w}&output=webp&q=${quality}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
     return url;
  }

  if (import.meta.env.VITE_BACKEND_URL && url.startsWith(import.meta.env.VITE_BACKEND_URL)) {
      url = url.replace(import.meta.env.VITE_BACKEND_URL, "");
  }

  const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
  
  if (url.startsWith('/')) {
    url = url.substring(1);
  }

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

export function getVideoThumbnail(url?: string | null): string {
  if (!url) return '';
  if (url.includes('/video/upload/')) {
    return url.replace(/\.(mp4|webm|mov|mkv|avi)$/i, '.jpg');
  }
  return url;
}

export const getCloudinaryVideoThumbnail = getVideoThumbnail;

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


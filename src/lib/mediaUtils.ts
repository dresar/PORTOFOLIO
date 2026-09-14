import { type MediaAsset } from '@/admin/services/mediaApi';

export const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * Extracts numeric upload timestamp from public_id or created_at
 */
export function getAssetTimestamp(asset: { public_id?: string; created_at?: string }): number {
  const id = asset.public_id || '';
  
  // 1. Matches media_<timestamp>_...
  const match = id.match(/media_(\d{10,13})/);
  if (match) {
    const ts = parseInt(match[1], 10);
    if (!isNaN(ts) && ts > 1000000000) return ts;
  }

  // 2. Matches any 13-digit Unix timestamp
  const any13 = id.match(/(\d{13})/);
  if (any13) {
    const ts = parseInt(any13[1], 10);
    if (!isNaN(ts) && ts > 1000000000) return ts;
  }

  // 3. Check created_at ISO string
  if (asset.created_at) {
    const time = new Date(asset.created_at).getTime();
    if (!isNaN(time) && time > 1000000000) return time;
  }

  return 0;
}

/**
 * Checks if an asset was uploaded within the specified minutes (default 5 minutes)
 */
export function isNewUpload(asset: { public_id?: string; created_at?: string }, thresholdMinutes = 5): boolean {
  const ts = getAssetTimestamp(asset);
  if (ts <= 0) return false;
  const diff = Date.now() - ts;
  // Between 0 and threshold (plus up to 60s clock skew allowance)
  return diff >= -60000 && diff <= thresholdMinutes * 60 * 1000;
}

/**
 * Shortens and cleans long public IDs for card display
 * E.g. media_1789369785103_alma_hub.webp -> alma_hub.webp
 */
export function formatMediaName(publicId: string): string {
  if (!publicId) return '';
  const base = publicId.split('/').pop() || publicId;

  // If matches media_<timestamp>_<meaningful_name>
  const mediaMatch = base.match(/^media_\d+_(.+)$/);
  if (mediaMatch && mediaMatch[1]) {
    const rest = mediaMatch[1];
    if (rest.length > 20) {
      const extIndex = rest.lastIndexOf('.');
      if (extIndex > 0) {
        const name = rest.slice(0, extIndex);
        const ext = rest.slice(extIndex);
        return `${name.slice(0, 12)}...${ext}`;
      }
      return `${rest.slice(0, 16)}...`;
    }
    return rest;
  }

  // If general filename is too long
  if (base.length > 20) {
    const extIndex = base.lastIndexOf('.');
    if (extIndex > 0) {
      const name = base.slice(0, extIndex);
      const ext = base.slice(extIndex);
      return `${name.slice(0, 12)}...${ext}`;
    }
    return `${base.slice(0, 16)}...`;
  }

  return base;
}

/**
 * Sorts media assets so newest uploads appear first
 */
export function sortAssetsNewestFirst<T extends { public_id: string; created_at?: string }>(assets: T[]): T[] {
  return [...assets].sort((a, b) => {
    const tsA = getAssetTimestamp(a);
    const tsB = getAssetTimestamp(b);
    if (tsA !== tsB) {
      return tsB - tsA; // Newest first
    }
    return b.public_id.localeCompare(a.public_id);
  });
}

/**
 * Converts and compresses any image to high-efficiency, crisp WebP format
 */
export async function compressImageToWebP(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<{
  base64: string;
  fileName: string;
  format: string;
  fileSize: number;
  originalName: string;
}> {
  const maxDim = options.maxDimension || 1920;
  const quality = options.quality !== undefined ? options.quality : 0.88;

  const isImage = file.type.startsWith('image/');
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

  // Strip file extension to get base name
  const rawBaseName = file.name.replace(/\.[^/.]+$/, '');
  const cleanBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32);

  // If not a raster image (e.g. SVG, GIF, PDF, video), read as-is
  if (!isImage || isSvg || isGif) {
    const base64 = await fileToBase64String(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const publicId = `media_${Date.now()}_${cleanBaseName}.${ext}`;
    return {
      base64,
      fileName: publicId,
      format: ext,
      fileSize: file.size,
      originalName: file.name
    };
  }

  // Compress raster image to WebP using HTML5 Canvas
  const dataUrl = await fileToBase64String(file);
  const img = await loadImage(dataUrl);

  let targetW = img.width;
  let targetH = img.height;

  if (targetW > maxDim || targetH > maxDim) {
    if (targetW > targetH) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D rendering context is not available');
  }

  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const webpBlob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Gagal mengompres gambar ke WebP'))),
      'image/webp',
      quality
    );
  });

  const webpDataUrl = await blobToDataUrl(webpBlob);
  const webpFileName = `media_${Date.now()}_${cleanBaseName || 'img'}.webp`;

  return {
    base64: webpDataUrl,
    fileName: webpFileName,
    format: 'webp',
    fileSize: webpBlob.size,
    originalName: file.name
  };
}

function fileToBase64String(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal mengonversi blob'));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat elemen gambar'));
    img.src = src;
  });
}

import { adminApi } from './api';

export interface MediaConfig {
  id: number;
  cloud_name: string;
  api_key: string;
  api_secret: string;
  label: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  provider?: 'github';
}

export interface MediaAsset {
  public_id: string;
  secure_url: string;
  url: string;
  raw_url?: string;
  sha?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resource_type?: string;
  created_at?: string;
  provider?: 'github';
}

export interface MediaListResponse {
  resources: MediaAsset[];
  total?: number;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  resource_type?: string;
  created_at?: string;
  provider?: 'github';
}

export const mediaApi = {
  getConfigs: async (): Promise<MediaConfig[]> => {
    const res = await adminApi.get('/media/configs');
    return res.data;
  },

  testConfig: async (): Promise<{ success: boolean; cloud_name?: string; repo?: string }> => {
    const res = await adminApi.post('/media/test', {});
    return res.data;
  },

  listAssets: async (options?: { resource_type?: string }): Promise<MediaListResponse> => {
    const params = new URLSearchParams();
    if (options?.resource_type) params.set('resource_type', options.resource_type);
    const res = await adminApi.get(`/media/list${params.toString() ? '?' + params.toString() : ''}`);
    return res.data;
  },

  uploadFile: async (file: string, options?: { folder?: string; public_id?: string }): Promise<UploadResult> => {
    const res = await adminApi.post('/media/upload', { file, ...options });
    return res.data;
  },

  deleteAsset: async (public_ids: string | string[], resource_type = 'image', provider = 'github', sha?: string): Promise<{ success: boolean; results?: any[] }> => {
    const ids = Array.isArray(public_ids) ? public_ids : [public_ids];
    const res = await adminApi.post('/media/delete', { public_ids: ids, sha });
    return res.data;
  },

  activateConfig: async (config_id: number): Promise<{ success: boolean; active: MediaConfig }> => {
    return {
      success: true,
      active: {
        id: config_id,
        cloud_name: 'GitHub Storage',
        api_key: '',
        api_secret: '',
        label: 'GitHub Storage',
        is_active: true,
        provider: 'github'
      }
    };
  }
};

export type CloudinaryConfig = MediaConfig;
export type CloudinaryAsset = MediaAsset;
export type CloudinaryListResponse = MediaListResponse;
export const cloudinaryApi = mediaApi;

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

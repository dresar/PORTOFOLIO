import adminApi from './adminApi';

export interface CloudinaryConfig {
  id: number;
  cloud_name: string;
  api_key: string;
  api_secret: string;
  label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  provider?: 'github' | 'cloudinary';
}

export interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
  created_at: string;
  tags?: string[];
  provider?: 'github' | 'cloudinary';
  _account?: string;
  sha?: string;
}

export interface CloudinaryListResponse {
  resources: CloudinaryAsset[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
  total?: number;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
  created_at: string;
  provider?: 'github' | 'cloudinary';
  _account?: string;
}

export const cloudinaryApi = {
  getConfigs: async (): Promise<CloudinaryConfig[]> => {
    const res = await adminApi.get('/cloudinary/configs');
    return res.data;
  },

  addConfig: async (data: { cloud_name: string; api_key: string; api_secret: string; label?: string }): Promise<CloudinaryConfig> => {
    const res = await adminApi.post('/cloudinary/configs', data);
    return res.data;
  },

  updateConfig: async (id: number, data: Partial<{ cloud_name: string; api_key: string; api_secret: string; label: string }>): Promise<CloudinaryConfig> => {
    const res = await adminApi.put(`/cloudinary/configs?id=${id}`, data);
    return res.data;
  },

  deleteConfig: async (id: number): Promise<void> => {
    await adminApi.delete(`/cloudinary/configs?id=${id}`);
  },

  activateConfig: async (config_id: number): Promise<{ success: boolean; active: CloudinaryConfig }> => {
    const res = await adminApi.post('/cloudinary/activate', { config_id });
    return res.data;
  },

  testConfig: async (config_id?: number): Promise<{ success: boolean; status?: string; cloud_name?: string; label?: string; repo?: string; cdn?: string; provider?: string; error?: string }> => {
    const res = await adminApi.post('/cloudinary/test', config_id ? { config_id } : {});
    return res.data;
  },

  listAssets: async (options?: { resource_type?: string; next_cursor?: string; max_results?: number; provider?: 'all' | 'github' | 'cloudinary'; config_id?: number }): Promise<CloudinaryListResponse> => {
    const params = new URLSearchParams();
    if (options?.resource_type) params.set('resource_type', options.resource_type);
    if (options?.next_cursor) params.set('next_cursor', options.next_cursor);
    if (options?.max_results) params.set('max_results', options.max_results.toString());
    if (options?.provider) params.set('provider', options.provider);
    if (options?.config_id) params.set('config_id', options.config_id.toString());
    const res = await adminApi.get(`/cloudinary/list${params.toString() ? '?' + params.toString() : ''}`);
    return res.data;
  },

  uploadFile: async (file: string, options?: { folder?: string; public_id?: string; provider?: 'github' | 'cloudinary'; config_id?: number }): Promise<UploadResult> => {
    const res = await adminApi.post('/cloudinary/upload', { file, ...options });
    return res.data;
  },

  deleteAsset: async (public_ids: string | string[], resource_type = 'image', provider?: 'github' | 'cloudinary', sha?: string): Promise<{ success: boolean; results?: any[] }> => {
    const data = Array.isArray(public_ids) ? { public_ids, resource_type, provider, sha } : { public_id: public_ids, resource_type, provider, sha };
    const res = await adminApi.post('/cloudinary/delete', data);
    return res.data;
  },
};

/** Convert a File object to base64 data URL */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/** Format bytes to human readable */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

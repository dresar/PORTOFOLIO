import adminApi from './adminApi';

export interface CloudinaryConfig {
  id: number;
  cloud_name: string;
  api_key: string;
  api_secret: string; // always masked from server
  label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
}

export interface CloudinaryListResponse {
  resources: CloudinaryAsset[];
  next_cursor?: string;
  rate_limit_allowed?: number;
  rate_limit_reset_at?: string;
  rate_limit_remaining?: number;
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
}

// ── Config Management ─────────────────────────────────────────────────────────

export const cloudinaryApi = {
  /** List all configs (max 5, api_secret masked) */
  getConfigs: async (): Promise<CloudinaryConfig[]> => {
    const res = await adminApi.get('/cloudinary/configs');
    return res.data;
  },

  /** Add new config */
  addConfig: async (data: { cloud_name: string; api_key: string; api_secret: string; label?: string }): Promise<CloudinaryConfig> => {
    const res = await adminApi.post('/cloudinary/configs', data);
    return res.data;
  },

  /** Update a config (only provided fields are updated) */
  updateConfig: async (id: number, data: Partial<{ cloud_name: string; api_key: string; api_secret: string; label: string }>): Promise<CloudinaryConfig> => {
    const res = await adminApi.put(`/cloudinary/configs?id=${id}`, data);
    return res.data;
  },

  /** Delete a config */
  deleteConfig: async (id: number): Promise<void> => {
    await adminApi.delete(`/cloudinary/configs?id=${id}`);
  },

  /** Set a config as active */
  activateConfig: async (config_id: number): Promise<{ success: boolean; active: CloudinaryConfig }> => {
    const res = await adminApi.post('/cloudinary/activate', { config_id });
    return res.data;
  },

  /** Test a config connection (uses config_id or active config) */
  testConfig: async (config_id?: number): Promise<{ success: boolean; status?: string; cloud_name?: string; error?: string }> => {
    const res = await adminApi.post('/cloudinary/test', config_id ? { config_id } : {});
    return res.data;
  },

  // ── Media Operations ──────────────────────────────────────────────────────

  /** List assets from the active config */
  listAssets: async (options?: { resource_type?: string; next_cursor?: string; max_results?: number }): Promise<CloudinaryListResponse> => {
    const params = new URLSearchParams();
    if (options?.resource_type) params.set('resource_type', options.resource_type);
    if (options?.next_cursor) params.set('next_cursor', options.next_cursor);
    if (options?.max_results) params.set('max_results', options.max_results.toString());
    const res = await adminApi.get(`/cloudinary/list${params.toString() ? '?' + params.toString() : ''}`);
    return res.data;
  },

  /** Upload a file (base64 data URL) to active config */
  uploadFile: async (file: string, options?: { folder?: string; public_id?: string }): Promise<UploadResult> => {
    const res = await adminApi.post('/cloudinary/upload', { file, ...options });
    return res.data;
  },

  /** Delete asset(s) from active config */
  deleteAsset: async (public_ids: string | string[], resource_type = 'image'): Promise<{ success: boolean; results?: any[] }> => {
    const data = Array.isArray(public_ids) ? { public_ids, resource_type } : { public_id: public_ids, resource_type };
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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mediaApi } from '../services/mediaApi';

export const DEFAULT_FOLDERS = ['Umum', 'Projects', 'Certificates', 'Blog', 'Profile', 'Dokumen'] as const;
export type DefaultFolderName = (typeof DEFAULT_FOLDERS)[number];

export interface MediaFolderState {
  customFolders: string[];
  fileFolders: Record<string, string>;
  currentFolder: string | null;
  isSyncing: boolean;
  getAllFolders: () => string[];
  getFileFolder: (publicId: string) => string;
  setCurrentFolder: (folder: string | null) => void;
  initFolders: () => Promise<void>;
  addFolder: (name: string) => Promise<boolean>;
  deleteFolder: (name: string) => Promise<boolean>;
  renameFolder: (oldName: string, newName: string) => Promise<boolean>;
  moveFiles: (publicIds: string[], targetFolder: string) => Promise<boolean>;
}

export const useMediaFolderStore = create<MediaFolderState>()(
  persist(
    (set, get) => ({
      customFolders: [],
      fileFolders: {},
      currentFolder: null,
      isSyncing: false,

      getAllFolders: () => {
        const { customFolders } = get();
        const setFolders = new Set<string>([...DEFAULT_FOLDERS, ...customFolders]);
        return Array.from(setFolders);
      },

      getFileFolder: (publicId: string) => {
        const { fileFolders } = get();
        if (fileFolders[publicId]) {
          return fileFolders[publicId];
        }

        const lower = publicId.toLowerCase();
        if (lower.endsWith('.pdf')) return 'Dokumen';
        if (lower.includes('project') || lower.includes('proyek') || lower.includes('cover')) return 'Projects';
        if (lower.includes('cert') || lower.includes('sertifikat') || lower.includes('hki')) return 'Certificates';
        if (lower.includes('blog') || lower.includes('post') || lower.includes('artikel')) return 'Blog';
        if (lower.includes('profile') || lower.includes('avatar') || lower.includes('hero') || lower.includes('author')) return 'Profile';
        return 'Umum';
      },

      setCurrentFolder: (folder) => set({ currentFolder: folder }),

      initFolders: async () => {
        try {
          set({ isSyncing: true });
          const res = await mediaApi.getFolders();
          if (res && res.mapping) {
            set((state) => ({
              customFolders: Array.from(new Set([...state.customFolders, ...(res.folders || [])])),
              fileFolders: { ...state.fileFolders, ...res.mapping }
            }));
          }
        } catch (e) {
        } finally {
          set({ isSyncing: false });
        }
      },

      addFolder: async (name: string) => {
        const cleanName = name.trim();
        if (!cleanName) return false;

        const all = get().getAllFolders();
        if (all.some((f) => f.toLowerCase() === cleanName.toLowerCase())) {
          return false;
        }

        set((state) => ({
          customFolders: [...state.customFolders, cleanName]
        }));

        try {
          await mediaApi.manageFolder(cleanName, 'create');
        } catch (e) {}

        return true;
      },

      deleteFolder: async (name: string) => {
        const cleanName = name.trim();
        if (DEFAULT_FOLDERS.includes(cleanName as any)) return false;

        set((state) => {
          const nextCustom = state.customFolders.filter((f) => f !== cleanName);
          const nextMapping = { ...state.fileFolders };
          for (const key of Object.keys(nextMapping)) {
            if (nextMapping[key] === cleanName) {
              nextMapping[key] = 'Umum';
            }
          }
          return {
            customFolders: nextCustom,
            fileFolders: nextMapping,
            currentFolder: state.currentFolder === cleanName ? null : state.currentFolder
          };
        });

        try {
          await mediaApi.manageFolder(cleanName, 'delete');
        } catch (e) {}

        return true;
      },

      renameFolder: async (oldName: string, newName: string) => {
        const cleanOld = oldName.trim();
        const cleanNew = newName.trim();
        if (!cleanNew || cleanOld === cleanNew) return false;
        if (DEFAULT_FOLDERS.includes(cleanOld as any)) return false;

        const all = get().getAllFolders();
        if (all.some((f) => f.toLowerCase() === cleanNew.toLowerCase())) {
          return false;
        }

        set((state) => {
          const nextCustom = state.customFolders.map((f) => (f === cleanOld ? cleanNew : f));
          const nextMapping = { ...state.fileFolders };
          for (const key of Object.keys(nextMapping)) {
            if (nextMapping[key] === cleanOld) {
              nextMapping[key] = cleanNew;
            }
          }
          return {
            customFolders: nextCustom,
            fileFolders: nextMapping,
            currentFolder: state.currentFolder === cleanOld ? cleanNew : state.currentFolder
          };
        });

        try {
          await mediaApi.manageFolder(cleanOld, 'rename', cleanNew);
        } catch (e) {}

        return true;
      },

      moveFiles: async (publicIds: string[], targetFolder: string) => {
        if (!publicIds.length || !targetFolder) return false;

        set((state) => {
          const nextMapping = { ...state.fileFolders };
          for (const id of publicIds) {
            nextMapping[id] = targetFolder;
          }
          return { fileFolders: nextMapping };
        });

        try {
          await mediaApi.moveFiles(publicIds, targetFolder);
        } catch (e) {}

        return true;
      }
    }),
    {
      name: 'portfolio_media_folders_v1',
      partialize: (state) => ({
        customFolders: state.customFolders,
        fileFolders: state.fileFolders
      })
    }
  )
);

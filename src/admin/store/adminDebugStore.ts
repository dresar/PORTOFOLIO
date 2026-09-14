import { create } from 'zustand';

export interface DebugLogItem {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  category: 'api' | 'upload' | 'modal' | 'system';
  title: string;
  details?: any;
  status?: number;
}

interface AdminDebugState {
  isOpen: boolean;
  logs: DebugLogItem[];
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addLog: (log: Omit<DebugLogItem, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

export const useAdminDebugStore = create<AdminDebugState>((set) => ({
  isOpen: false,
  logs: [],
  setIsOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  addLog: (log) => {
    const newItem: DebugLogItem = {
      ...log,
      id: `dbg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false })
    };
    // Also always log to window console for DevTools inspection
    const prefix = `[AdminDebug][${log.category.toUpperCase()}][${log.level.toUpperCase()}]`;
    if (log.level === 'error') {
      console.error(prefix, log.title, log.details || '');
    } else if (log.level === 'warn') {
      console.warn(prefix, log.title, log.details || '');
    } else {
      console.log(prefix, log.title, log.details || '');
    }

    set((state) => ({
      logs: [newItem, ...state.logs].slice(0, 100)
    }));
  },
  clearLogs: () => set({ logs: [] })
}));

if (typeof window !== 'undefined') {
  (window as any).__adminDebug = useAdminDebugStore;
}

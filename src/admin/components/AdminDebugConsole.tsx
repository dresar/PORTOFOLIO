import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Trash2, RefreshCw, Copy, Check, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { useAdminDebugStore, type DebugLogItem } from '../store/adminDebugStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function AdminDebugConsole() {
  const { toast } = useToast();
  const { isOpen, toggleOpen, setIsOpen, logs, clearLogs, addLog } = useAdminDebugStore();
  const [filter, setFilter] = useState<'all' | 'error' | 'api' | 'upload'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Capture unhandled window errors and promise rejections
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      addLog({
        level: 'error',
        category: 'system',
        title: `[Window Error] ${event.message || 'Unknown error'}`,
        details: { filename: event.filename, lineno: event.lineno, colno: event.colno, error: event.error?.stack || event.error }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      addLog({
        level: 'error',
        category: 'system',
        title: `[Unhandled Promise] ${reason?.message || String(reason)}`,
        details: { reason, stack: reason?.stack }
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addLog]);

  const errorCount = logs.filter(l => l.level === 'error').length;

  const filteredLogs = logs.filter(item => {
    if (filter === 'error') return item.level === 'error';
    if (filter === 'api') return item.category === 'api';
    if (filter === 'upload') return item.category === 'upload';
    return true;
  });

  const handleCopyLogs = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: '✓ Log disalin ke clipboard' });
    } catch {
      toast({ variant: 'destructive', title: 'Gagal menyalin log' });
    }
  };

  const handleHardPurgeAndReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE_V4');
      localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE_V5');
      sessionStorage.clear();
      toast({ title: '✓ Cache browser dibersihkan, memuat ulang...' });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 left-4 z-[9990] flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={errorCount > 0 ? 'destructive' : 'secondary'}
          onClick={toggleOpen}
          className={cn(
            'h-8 px-3 rounded-full shadow-lg border gap-1.5 text-xs font-mono font-medium backdrop-blur-md',
            errorCount > 0 
              ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500 animate-pulse' 
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
          )}
          title="Admin Debug & Error Console"
        >
          <Bug className="size-3.5" />
          <span>Debug</span>
          {errorCount > 0 && (
            <Badge variant="outline" className="px-1 py-0 text-[10px] h-4 bg-white text-rose-600 font-bold border-none">
              {errorCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Debug Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-14 left-4 right-4 md:right-auto md:w-[620px] max-h-[75vh] z-[9995] bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded bg-primary/20 text-primary flex items-center justify-center">
                  <Bug className="size-3.5" />
                </div>
                <h3 className="text-xs font-bold text-zinc-200">Admin Debug & Error Console</h3>
                <span className="text-[10px] text-zinc-500">({logs.length} events)</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleHardPurgeAndReload}
                  className="h-6 text-[10px] px-2 rounded gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                  title="Bersihkan cache browser & hard reload"
                >
                  <RefreshCw className="size-2.5" />
                  <span>Bust Cache</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLogs}
                  className="h-6 text-[10px] px-2 rounded gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                  title="Salin semua log"
                >
                  {copied ? <Check className="size-2.5 text-emerald-400" /> : <Copy className="size-2.5" />}
                  <span>Salin</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={clearLogs}
                  className="h-6 text-[10px] px-2 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Hapus log"
                >
                  <Trash2 className="size-2.5" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="size-6 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-1.5 bg-zinc-900/50 border-b border-zinc-800/80 flex gap-1 shrink-0 text-[11px]">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={cn('px-2 py-0.5 rounded text-[10px] transition-colors', filter === 'all' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200')}
              >
                Semua ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('error')}
                className={cn('px-2 py-0.5 rounded text-[10px] transition-colors', filter === 'error' ? 'bg-rose-950/80 text-rose-300 font-semibold' : 'text-zinc-400 hover:text-rose-400')}
              >
                Errors ({errorCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('api')}
                className={cn('px-2 py-0.5 rounded text-[10px] transition-colors', filter === 'api' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200')}
              >
                API Requests
              </button>
              <button
                type="button"
                onClick={() => setFilter('upload')}
                className={cn('px-2 py-0.5 rounded text-[10px] transition-colors', filter === 'upload' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200')}
              >
                Uploads
              </button>
            </div>

            {/* Log List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs max-h-[55vh]">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Tidak ada event debug yang tercatat.
                </div>
              ) : (
                filteredLogs.map((item) => {
                  const isExpanded = expandedId === item.id;
                  const isErr = item.level === 'error';
                  const isWarn = item.level === 'warn';
                  const isSuccess = item.level === 'success';

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'rounded-lg border transition-colors p-2 text-[11px] leading-relaxed',
                        isErr 
                          ? 'bg-rose-950/30 border-rose-900/60 text-rose-200' 
                          : isWarn
                          ? 'bg-amber-950/30 border-amber-900/60 text-amber-200'
                          : isSuccess
                          ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                          : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300'
                      )}
                    >
                      <div
                        className="flex items-start justify-between gap-2 cursor-pointer select-none"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-start gap-1.5 min-w-0">
                          {isErr ? (
                            <AlertCircle className="size-3.5 text-rose-400 shrink-0 mt-0.5" />
                          ) : isWarn ? (
                            <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                          )}
                          <span className="font-semibold break-all text-left">{item.title}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-zinc-500">
                          <span>{item.timestamp}</span>
                          {isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                        </div>
                      </div>

                      {isExpanded && item.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 pt-2 border-t border-zinc-800 overflow-x-auto text-[10px] bg-black/60 p-2 rounded text-zinc-300 max-h-48 overflow-y-auto"
                        >
                          <pre>{JSON.stringify(item.details, null, 2)}</pre>
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

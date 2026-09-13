import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuthStore } from '../store/adminAuthStore';
import {
  Loader2,
  Lock,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Delete,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminApi from '../services/adminApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'pin'>('credentials');
  const [tempToken, setTempToken] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const login = useAdminAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      try {
        document.head.removeChild(meta);
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (step === 'pin') {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmitCredentials = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await adminApi.post('/auth/login', data);
      
      if (response.data?.requirePin && response.data?.tempToken) {
        setTempToken(response.data.tempToken);
        setStep('pin');
        setPin('');
        toast({
          title: "Verifikasi PIN 2FA",
          description: "Masukkan PIN 6-digit keamanan Anda.",
        });
        return;
      }

      const { user, token } = response.data;
      login({
        id: String(user.id),
        name: user.name || 'Admin',
        email: user.email,
        avatar: user.avatar || 'https://github.com/shadcn.png'
      }, token);
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${user.name || 'Admin'}.`,
      });
      navigate('/admin/dashboard');

    } catch (error: any) {
      if (error.response?.status === 503) {
        setIsDbModalOpen(true);
      }
      const msg = error.response?.data?.error || error.response?.data?.message || "Email atau kata sandi salah";
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeVerifyPin = async (pinValue: string) => {
    if (!pinValue || pinValue.trim().length === 0 || isLoading) return;

    setIsLoading(true);
    try {
      const response = await adminApi.post('/auth/verify-pin', {
        tempToken,
        pin: pinValue.trim(),
      });

      const { user, token } = response.data;
      login({
        id: String(user.id),
        name: user.name || 'Admin',
        email: user.email,
        avatar: user.avatar || 'https://github.com/shadcn.png'
      }, token);

      toast({
        title: "Autentikasi Berhasil",
        description: `Selamat datang kembali, ${user.name || 'Admin'}.`,
      });
      navigate('/admin/dashboard');

    } catch (error: any) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      setPin('');
      setTimeout(() => pinInputRef.current?.focus(), 150);
      const msg = error.response?.data?.error || "PIN salah atau tidak valid";
      toast({
        variant: "destructive",
        title: "Verifikasi Gagal",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 6) {
      toast({
        variant: "destructive",
        title: "PIN Belum Lengkap",
        description: "Masukkan seluruh 6-digit PIN keamanan.",
      });
      return;
    }
    executeVerifyPin(pin);
  };

  const handleKeypadPress = (digit: string) => {
    if (isLoading || pin.length >= 6) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 6) {
      executeVerifyPin(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isLoading || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    if (isLoading) return;
    setPin('');
    pinInputRef.current?.focus();
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setPin(val);
    if (val.length === 6) {
      executeVerifyPin(val);
    }
  };

  const handleNativePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted) {
      setPin(pasted);
      if (pasted.length === 6) {
        executeVerifyPin(pasted);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#09090b] text-zinc-100 p-4 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <Dialog open={isDbModalOpen} onOpenChange={setIsDbModalOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Koneksi Database Bermasalah</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Admin tidak bisa login karena koneksi database belum tersedia. Periksa konfigurasi server dan coba lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDbModalOpen(false)} className="border-zinc-700 hover:bg-zinc-800">
              Tutup
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Coba Lagi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-[390px] z-10"
      >
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/95 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.div
                key="credentials-step"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Lock className="size-5" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Portal Admin
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Masuk dengan kredensial administrator.
                  </p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmitCredentials)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-zinc-300 block">
                      Email
                    </label>
                    <input 
                      id="email" 
                      type="email"
                      placeholder="admin@ekasyarif.my.id"
                      className="w-full h-10 px-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                      autoComplete="email"
                      autoFocus
                      {...form.register('email')} 
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-red-400 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-xs font-medium text-zinc-300 block">
                        Kata Sandi
                      </label>
                    </div>
                    <div className="relative">
                      <input 
                        id="password" 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        className="w-full h-10 pl-3.5 pr-10 rounded-lg bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
                        autoComplete="current-password"
                        {...form.register('password')} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors rounded-md cursor-pointer"
                        tabIndex={-1}
                        title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs text-red-400 mt-1">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <span>Lanjutkan ke Dashboard</span>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="pin-step"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Verifikasi 2FA
                  </h1>
                  <p className="text-xs text-zinc-400 mt-1">
                    Masukkan 6-digit PIN keamanan administrator.
                  </p>
                </div>

                <form onSubmit={onSubmitPin} className="space-y-4">
                  <motion.div
                    animate={isShaking ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
                    transition={{ duration: 0.35 }}
                    className="relative flex justify-center items-center gap-2 py-1 cursor-pointer select-none"
                    onClick={() => pinInputRef.current?.focus()}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => {
                      const digit = pin[index];
                      const isFilled = Boolean(digit);
                      const isCurrent = pin.length === index;

                      return (
                        <div
                          key={index}
                          className={cn(
                            'flex-1 max-w-[46px] h-12 rounded-lg border flex items-center justify-center font-mono text-base font-bold transition-colors bg-zinc-950/70',
                            isCurrent
                              ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                              : isFilled
                              ? 'border-emerald-500/40 bg-emerald-500/5'
                              : 'border-zinc-800 text-zinc-500',
                            isShaking && 'border-red-500/80 bg-red-500/10'
                          )}
                        >
                          {isFilled ? (
                            showPin ? (
                              <span className="font-bold text-emerald-400 font-mono text-lg">{digit}</span>
                            ) : (
                              <div className="size-2.5 rounded-full bg-emerald-400" />
                            )
                          ) : isCurrent ? (
                            <div className="w-0.5 h-5 bg-emerald-400 rounded-full animate-pulse" />
                          ) : null}
                        </div>
                      );
                    })}

                    <input
                      ref={pinInputRef}
                      id="pin-native-input"
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="opacity-0 absolute inset-0 size-full cursor-pointer pointer-events-auto"
                      value={pin}
                      onChange={handleNativeChange}
                      onPaste={handleNativePaste}
                      autoComplete="one-time-code"
                      aria-label="6-digit PIN"
                    />
                  </motion.div>

                  <div className="flex justify-between items-center px-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-zinc-300">
                        {pin.length}/6
                      </span>
                      <span>Digit</span>
                      {pin.length === 6 && (
                        <span className="text-emerald-400 font-medium flex items-center gap-1 ml-1">
                          <CheckCircle2 className="size-3" />
                          Lengkap
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {pin.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearPin}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="size-3" />
                          <span>Reset</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium transition-colors"
                      >
                        {showPin ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                        <span>{showPin ? 'Tutup' : 'Lihat'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleKeypadPress(num)}
                        disabled={isLoading || pin.length >= 6}
                        className="h-10 rounded-lg bg-zinc-950/50 hover:bg-zinc-800/60 active:scale-95 border border-zinc-800/80 text-zinc-200 font-semibold text-base transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="h-10 rounded-lg bg-zinc-950/30 hover:bg-zinc-800/40 active:scale-95 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer"
                      title={showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
                    >
                      {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadPress('0')}
                      disabled={isLoading || pin.length >= 6}
                      className="h-10 rounded-lg bg-zinc-950/50 hover:bg-zinc-800/60 active:scale-95 border border-zinc-800/80 text-zinc-200 font-semibold text-base transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleBackspace}
                      disabled={isLoading || pin.length === 0}
                      className="h-10 rounded-lg bg-zinc-950/30 hover:bg-zinc-800/40 active:scale-95 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-30"
                      title="Hapus Satu Digit"
                    >
                      <Delete className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <button 
                      type="submit" 
                      disabled={isLoading || pin.length < 6}
                      className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Memverifikasi...</span>
                        </>
                      ) : (
                        <span>Verifikasi PIN</span>
                      )}
                    </button>

                    <button 
                      type="button" 
                      onClick={() => {
                        setStep('credentials');
                        setPin('');
                      }}
                      className="w-full h-8 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="size-3" />
                      <span>Kembali ke Kredensial</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Beranda Portfolio</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

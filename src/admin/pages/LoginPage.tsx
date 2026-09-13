import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Delete,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminApi from '../services/adminApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Kata sandi diperlukan" }),
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
      } catch (e) {
      }
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden bg-background px-3 py-6 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 25, 0], 
            y: [0, -25, 0],
            scale: [1, 1.08, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary/15 blur-[100px] sm:blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -35, 0], 
            y: [0, 35, 0],
            scale: [1, 1.12, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-emerald-500/15 blur-[100px] sm:blur-[120px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <Dialog open={isDbModalOpen} onOpenChange={setIsDbModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Koneksi Database Bermasalah</DialogTitle>
            <DialogDescription>
              Admin tidak bisa login karena koneksi database belum tersedia. Periksa konfigurasi server dan coba lagi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDbModalOpen(false)}>Tutup</Button>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[360px] xs:max-w-[390px] sm:max-w-md z-10"
      >
        <div className="relative rounded-2xl border border-border/70 bg-card/85 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />

          <div className="p-4 xs:p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.div
                  key="credentials-step"
                  initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-1.5">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mx-auto size-13 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb,16,185,129),0.2)]"
                    >
                      <Lock className="size-6" />
                    </motion.div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Portal Admin
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Masuk dengan kredensial administrator.
                    </p>
                  </div>

                  <form onSubmit={form.handleSubmit(onSubmitCredentials)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="email" 
                          type="email"
                          className="pl-9 h-10.5 rounded-xl bg-background/50 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all font-sans text-sm" 
                          autoComplete="email"
                          autoFocus
                          {...form.register('email')} 
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1 font-medium">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Kata Sandi
                        </Label>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="password" 
                          type={showPassword ? 'text' : 'password'}
                          className="pl-9 pr-10 h-10.5 rounded-xl bg-background/50 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all font-sans text-sm" 
                          autoComplete="current-password"
                          {...form.register('password')} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md focus:outline-none cursor-pointer"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1 font-medium">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full h-10.5 rounded-xl font-medium shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all text-sm mt-2 cursor-pointer" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        <>
                          Lanjutkan
                          <Sparkles className="ml-2 size-4 opacity-70" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="pin-step"
                  initial={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-4 sm:space-y-5"
                >
                  <div className="text-center space-y-1.5">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.04, 1],
                        boxShadow: [
                          '0 0 12px rgba(16,185,129,0.2)',
                          '0 0 24px rgba(16,185,129,0.35)',
                          '0 0 12px rgba(16,185,129,0.2)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="mx-auto size-12 sm:size-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500"
                    >
                      <ShieldCheck className="size-6 sm:size-7" />
                    </motion.div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      Autentikasi 2FA
                    </h1>
                    <p className="text-xs text-muted-foreground">
                      Masukkan 6-digit PIN keamanan Anda.
                    </p>
                  </div>

                  <form onSubmit={onSubmitPin} className="space-y-4">
                    <motion.div
                      animate={isShaking ? { x: [-10, 10, -7, 7, -3, 3, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      className="relative flex justify-center items-center gap-1.5 xs:gap-2 sm:gap-2.5 py-1.5 cursor-pointer select-none"
                      onClick={() => pinInputRef.current?.focus()}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const digit = pin[index];
                        const isFilled = Boolean(digit);
                        const isCurrent = pin.length === index;

                        return (
                          <motion.div
                            key={index}
                            animate={{
                              scale: isCurrent ? 1.05 : 1,
                              borderColor: isShaking
                                ? 'rgba(239, 68, 68, 0.9)'
                                : isCurrent
                                ? 'rgba(16, 185, 129, 0.95)'
                                : isFilled
                                ? 'rgba(16, 185, 129, 0.45)'
                                : 'rgba(255, 255, 255, 0.12)',
                              boxShadow: isShaking
                                ? '0 0 12px rgba(239, 68, 68, 0.4)'
                                : isCurrent
                                ? '0 0 14px rgba(16, 185, 129, 0.35)'
                                : isFilled
                                ? '0 0 6px rgba(16, 185, 129, 0.15)'
                                : 'none',
                            }}
                            transition={{ duration: 0.16 }}
                            className={cn(
                              'flex-1 max-w-[44px] xs:max-w-[48px] sm:max-w-[50px] h-12 xs:h-13 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-lg sm:text-xl transition-colors bg-background/70 backdrop-blur-md',
                              isFilled ? 'bg-emerald-500/10' : '',
                              isShaking ? 'border-red-500/80 bg-red-500/10' : ''
                            )}
                          >
                            {isFilled ? (
                              showPin ? (
                                <motion.span
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="font-bold text-emerald-400 font-mono"
                                >
                                  {digit}
                                </motion.span>
                              ) : (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                  className="size-3 sm:size-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                                />
                              )
                            ) : isCurrent ? (
                              <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="w-0.5 h-5 sm:h-6 bg-emerald-400 rounded-full"
                              />
                            ) : null}
                          </motion.div>
                        );
                      })}

                      <input
                        ref={pinInputRef}
                        id="pin-native-input"
                        type={showPin ? 'text' : 'password'}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        className="opacity-0 absolute inset-0 size-full cursor-pointer pointer-events-auto text-base"
                        value={pin}
                        onChange={handleNativeChange}
                        onPaste={handleNativePaste}
                        autoComplete="one-time-code"
                        aria-label="6-digit PIN"
                      />
                    </motion.div>

                    <div className="flex justify-between items-center px-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-foreground/80">
                          {pin.length} / 6
                        </span>
                        <span>Digit</span>
                        {pin.length === 6 && (
                          <span className="text-emerald-500 font-medium flex items-center gap-1 animate-in fade-in ml-1 text-[11px]">
                            <CheckCircle2 className="size-3.5" />
                            Lengkap
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {pin.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearPin}
                            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="size-3" />
                            <span>Reset</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer font-medium transition-colors"
                        >
                          {showPin ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                          <span>{showPin ? 'Tutup' : 'Lihat'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleKeypadPress(num)}
                          disabled={isLoading || pin.length >= 6}
                          className="h-11 sm:h-12 rounded-xl bg-muted/40 hover:bg-muted/70 active:scale-95 border border-border/50 text-foreground font-semibold text-lg sm:text-xl transition-all flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-40"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="h-11 sm:h-12 rounded-xl bg-muted/30 hover:bg-muted/60 active:scale-95 border border-border/40 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center cursor-pointer text-xs font-medium gap-1"
                        title={showPin ? 'Sembunyikan Digit PIN' : 'Lihat Digit PIN'}
                      >
                        {showPin ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('0')}
                        disabled={isLoading || pin.length >= 6}
                        className="h-11 sm:h-12 rounded-xl bg-muted/40 hover:bg-muted/70 active:scale-95 border border-border/50 text-foreground font-semibold text-lg sm:text-xl transition-all flex items-center justify-center cursor-pointer shadow-xs disabled:opacity-40"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={handleBackspace}
                        disabled={isLoading || pin.length === 0}
                        className="h-11 sm:h-12 rounded-xl bg-muted/30 hover:bg-muted/60 active:scale-95 border border-border/40 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
                        title="Hapus Satu Digit"
                      >
                        <Delete className="size-5" />
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button 
                        className="w-full h-10.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-500/35 active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer" 
                        type="submit" 
                        disabled={isLoading || pin.length < 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Memverifikasi...
                          </>
                        ) : (
                          'Verifikasi PIN'
                        )}
                      </Button>

                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                        onClick={() => {
                          setStep('credentials');
                          setPin('');
                        }}
                        disabled={isLoading}
                      >
                        <ArrowLeft className="mr-2 size-3.5" />
                        Kembali ke Login
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

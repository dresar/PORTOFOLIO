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
import { Loader2, Lock, Mail, ShieldCheck, ArrowLeft, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import adminApi from '../services/adminApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [isLoading, setIsLoading] = useState(false);
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
          title: "Verifikasi PIN",
          description: "Masukkan PIN 6-digit.",
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

  const onSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.trim().length === 0) {
      toast({
        variant: "destructive",
        title: "PIN Diperlukan",
        description: "Masukkan PIN keamanan.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminApi.post('/auth/verify-pin', {
        tempToken,
        pin: pin.trim(),
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
        description: `Selamat datang, ${user.name || 'Admin'}.`,
      });
      navigate('/admin/dashboard');

    } catch (error: any) {
      const msg = error.response?.data?.error || "PIN tidak valid atau salah";
      toast({
        variant: "destructive",
        title: "Verifikasi Gagal",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 30, 0], 
            y: [0, -30, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0], 
            y: [0, 40, 0],
            scale: [1, 1.15, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px]"
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
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        <div className="relative rounded-2xl border border-border/60 bg-card/75 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.div
                  key="credentials-step"
                  initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_25px_rgba(var(--primary-rgb,16,185,129),0.2)]"
                    >
                      <Lock className="w-7 h-7" />
                    </motion.div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Portal Admin
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Autentikasi akun admin.
                    </p>
                  </div>

                  <form onSubmit={form.handleSubmit(onSubmitCredentials)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="email" 
                          type="email"
                          className="pl-10 h-11 rounded-xl bg-background/50 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all font-sans text-sm" 
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
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          id="password" 
                          type={showPassword ? 'text' : 'password'}
                          className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary transition-all font-sans text-sm" 
                          autoComplete="current-password"
                          {...form.register('password')} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-md focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1 font-medium">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all text-sm mt-2" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        <>
                          Lanjutkan
                          <Sparkles className="ml-2 h-4 w-4 opacity-70" />
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="pin-step"
                  initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 0 15px rgba(16,185,129,0.2)',
                          '0 0 30px rgba(16,185,129,0.4)',
                          '0 0 15px rgba(16,185,129,0.2)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500"
                    >
                      <ShieldCheck className="w-7 h-7" />
                    </motion.div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      Autentikasi 2FA
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Masukkan 6-digit PIN keamanan.
                    </p>
                  </div>

                  <form onSubmit={onSubmitPin} className="space-y-5">
                    <div className="space-y-3">
                      <div 
                        className="relative flex justify-center items-center gap-2 sm:gap-3 py-2 cursor-pointer"
                        onClick={() => pinInputRef.current?.focus()}
                      >
                        {[0, 1, 2, 3, 4, 5].map((index) => {
                          const isFilled = Boolean(pin[index]);
                          const isCurrent = pin.length === index;
                          return (
                            <motion.div
                              key={index}
                              animate={{
                                scale: isCurrent ? 1.06 : 1,
                                borderColor: isCurrent 
                                  ? 'rgba(16, 185, 129, 0.9)' 
                                  : isFilled 
                                  ? 'rgba(16, 185, 129, 0.45)' 
                                  : 'rgba(255, 255, 255, 0.12)',
                                boxShadow: isCurrent 
                                  ? '0 0 16px rgba(16, 185, 129, 0.4)' 
                                  : isFilled 
                                  ? '0 0 8px rgba(16, 185, 129, 0.2)' 
                                  : 'none',
                              }}
                              transition={{ duration: 0.18 }}
                              className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-lg transition-colors bg-background/60 backdrop-blur-sm select-none ${
                                isFilled ? 'bg-emerald-500/10' : ''
                              }`}
                            >
                              {isFilled ? (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                  className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                                />
                              ) : isCurrent ? (
                                <motion.div
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 0.9, repeat: Infinity }}
                                  className="w-0.5 h-6 bg-emerald-400 rounded-full"
                                />
                              ) : null}
                            </motion.div>
                          );
                        })}

                        <input 
                          ref={pinInputRef}
                          id="pin" 
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
                          value={pin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setPin(val);
                          }}
                          autoComplete="one-time-code"
                        />
                      </div>

                      <div className="flex justify-between items-center px-1 text-[11px] text-muted-foreground">
                        <span>Otorisasi 6-Digit</span>
                        {pin.length === 6 && (
                          <span className="text-emerald-500 font-medium flex items-center gap-1 animate-in fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PIN Lengkap
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full h-11 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/35 active:scale-[0.98] transition-all text-sm" 
                      type="submit" 
                      disabled={isLoading || pin.length < 4}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memverifikasi...
                        </>
                      ) : (
                        'Verifikasi'
                      )}
                    </Button>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full h-10 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                      onClick={() => {
                        setStep('credentials');
                        setPin('');
                      }}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                      Kembali
                    </Button>
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

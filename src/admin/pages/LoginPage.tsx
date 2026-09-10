import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Mail, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
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
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
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
          title: "Verifikasi Dua Langkah",
          description: "Kredensial valid. Masukkan PIN keamanan 6-digit Anda.",
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
        description: `Selamat datang kembali, ${user.name || 'Admin'}!`,
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
        description: "Silakan masukkan PIN keamanan Anda.",
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
        description: `Selamat datang, ${user.name || 'Admin'}!`,
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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
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

      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        {step === 'credentials' ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 text-primary">
                <Lock className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
              <CardDescription>Masukkan email dan kata sandi akun admin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmitCredentials)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="eka.ckp16799@gmail.com" 
                      className="pl-9 h-10 rounded-lg" 
                      autoComplete="email"
                      {...form.register('email')} 
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-10 rounded-lg" 
                      autoComplete="current-password"
                      {...form.register('password')} 
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button className="w-full h-10 rounded-lg font-medium" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memeriksa Kredensial...
                    </>
                  ) : (
                    'Lanjutkan ke Verifikasi'
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 text-emerald-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifikasi Dua Langkah</CardTitle>
              <CardDescription>
                Masukkan 6-digit PIN keamanan Anda untuk membuka akses dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmitPin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN Keamanan (6 Digit)</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      ref={pinInputRef}
                      id="pin" 
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      placeholder="••••••" 
                      className="pl-9 text-center text-xl tracking-[0.4em] font-mono h-12 rounded-lg" 
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    PIN default terpasang untuk akun Anda.
                  </p>
                </div>
                
                <Button className="w-full h-10 rounded-lg font-medium" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memverifikasi PIN...
                    </>
                  ) : (
                    'Verifikasi & Masuk'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setStep('credentials');
                    setPin('');
                  }}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Email & Password
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

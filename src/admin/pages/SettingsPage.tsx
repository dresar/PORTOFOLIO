import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { api } from '../services/api';
import { Loader2, Save, Globe, Shield, Bot, User, Lock, Mail, Edit, X, ShieldCheck, KeyRound } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const settingsSchema = z.object({
  theme: z.string().optional(),
  seoTitle: z.string().min(1, "Judul SEO diperlukan"),
  seoDesc: z.string().optional(),
  cdn_url: z.string().optional().nullable(),
  maintenanceMode: z.boolean().default(false),
  maintenance_end_time: z.string().optional().nullable(),
  ai_provider: z.string().default('gemini'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const profileSchema = z.object({
  name: z.string().min(1, "Nama diperlukan"),
  email: z.string().email("Email tidak valid"),
  avatar: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  pin: z.string().optional(),
  confirmPin: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.pin && data.pin !== data.confirmPin) {
    return false;
  }
  return true;
}, {
  message: "Konfirmasi PIN tidak cocok",
  path: ["confirmPin"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function SiteSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: 'dark',
      seoTitle: '',
      seoDesc: '',
      cdn_url: '',
      maintenanceMode: false,
      maintenance_end_time: '',
      ai_provider: 'gemini',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await api.content.settings.get();
      if (data) {
        form.reset({
          theme: data.theme || 'dark',
          seoTitle: data.seoTitle || '',
          seoDesc: data.seoDesc || '',
          cdn_url: data.cdn_url || '',
          maintenanceMode: Boolean(data.maintenanceMode), // Ensure boolean
          maintenance_end_time: data.maintenance_end_time ? new Date(data.maintenance_end_time).toISOString().slice(0, 16) : '',
          ai_provider: data.ai_provider || 'gemini',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    try {
      const currentSettings = await api.content.settings.get();

      const payload: any = {
        id: currentSettings?.id,
        theme: data.theme ?? currentSettings?.theme ?? 'dark',
        seoTitle: data.seoTitle ?? currentSettings?.seoTitle ?? '',
        seoDesc: data.seoDesc ?? currentSettings?.seoDesc ?? '',
        cdn_url: (data.cdn_url ?? currentSettings?.cdn_url) || null,
        maintenanceMode: Boolean(data.maintenanceMode),
        maintenance_end_time: data.maintenance_end_time ? new Date(data.maintenance_end_time).toISOString() : null,
        ai_provider: data.ai_provider ?? currentSettings?.ai_provider ?? 'gemini',
      };

      await api.content.settings.update(payload);
      
      toast({
        title: "Tersimpan!",
        description: "Pengaturan situs berhasil diperbarui.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Tidak dapat memperbarui pengaturan.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
          <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5"/> Umum & SEO</CardTitle>
              <CardDescription>Konfigurasi informasi dasar situs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
              <Label htmlFor="seoTitle">Judul Situs (SEO)</Label>
              <Input id="seoTitle" {...form.register('seoTitle')} placeholder="Judul" />
              {form.formState.errors.seoTitle && <p className="text-xs text-destructive">{form.formState.errors.seoTitle.message}</p>}
              </div>
              <div className="space-y-2">
              <Label htmlFor="seoDesc">Deskripsi Meta</Label>
              <Textarea id="seoDesc" {...form.register('seoDesc')} placeholder="Deskripsi" />
              </div>
              <div className="space-y-2">
              <Label htmlFor="cdn_url">URL CDN (Opsional)</Label>
              <Input id="cdn_url" {...form.register('cdn_url')} placeholder="URL" />
              </div>
          </CardContent>
          </Card>

          <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5"/> Konfigurasi Sistem</CardTitle>
              <CardDescription>Mode pemeliharaan dan status sistem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                      <Label className="text-base">Mode Pemeliharaan</Label>
                      <p className="text-sm text-muted-foreground">Nonaktifkan akses publik ke situs.</p>
                  </div>
                  <Switch 
                      checked={form.watch('maintenanceMode')} 
                      onCheckedChange={(checked) => form.setValue('maintenanceMode', checked)} 
                  />
              </div>
              
              {form.watch('maintenanceMode') && (
                  <div className="space-y-2">
                      <Label htmlFor="maintenance_end_time">Perkiraan Waktu Selesai</Label>
                      <Input 
                          id="maintenance_end_time" 
                          type="datetime-local" 
                          {...form.register('maintenance_end_time')} 
                      />
                  </div>
              )}
          </CardContent>
          </Card>
      </div>

      <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan
          </Button>
      </div>
    </form>
  );
}

function ProfileSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      avatar: '',
      password: '',
      confirmPassword: '',
      pin: '',
      confirmPin: '',
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.auth.getMe();
      if (data) {
        setHasPin(Boolean((data as any).hasPin));
        form.reset({
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar || '',
          password: '',
          confirmPassword: '',
          pin: '',
          confirmPin: '',
        });
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };

      if (data.password) {
        payload.password = data.password;
      }

      if (data.pin) {
        payload.pin = data.pin;
      }

      const updatedUser = await api.auth.updateMe(payload);
      if (updatedUser) {
        setHasPin(Boolean((updatedUser as any).hasPin));
      }
      
      if (useAdminAuthStore.getState().user) {
        useAdminAuthStore.getState().updateUser(updatedUser as any);
      }

      toast({
        title: "Tersimpan!",
        description: "Profil berhasil diperbarui.",
      });
      
      form.setValue('password', '');
      form.setValue('confirmPassword', '');
      form.setValue('pin', '');
      form.setValue('confirmPin', '');
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: error.message || "Terjadi kesalahan saat menyimpan profil.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Informasi Akun Admin</CardTitle>
            <CardDescription>Informasi akun dan keamanan 2FA.</CardDescription>
          </div>
          {!isEditing ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
             <Button type="button" variant="ghost" size="sm" onClick={() => {
               setIsEditing(false);
               loadProfile();
             }}>
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name" 
                className="pl-9" 
                placeholder="Nama"
                {...form.register('name')} 
                readOnly={!isEditing}
              />
            </div>
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                className="pl-9" 
                placeholder="Email"
                {...form.register('email')} 
                readOnly={!isEditing}
              />
            </div>
            {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">URL Avatar</Label>
            <div className="flex gap-2">
                <Input 
                  id="avatar" 
                  placeholder="URL"
                  {...form.register('avatar')} 
                  readOnly={!isEditing}
                />
                {form.watch('avatar') && (
                    <div className="h-10 w-10 rounded-full overflow-hidden border shrink-0">
                        <img src={form.watch('avatar')} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2">
                  2FA PIN
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold uppercase tracking-wider">
                    {hasPin ? "Aktif" : "Nonaktif"}
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {hasPin 
                    ? "PIN keamanan aktif."
                    : "Belum ada PIN terpasang."}
                </p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="space-y-6 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="col-span-2">
                  <h4 className="text-sm font-medium mb-1">Kata Sandi</h4>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Kata Sandi Baru</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" placeholder="Password" className="pl-9" {...form.register('password')} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" placeholder="Konfirmasi" className="pl-9" {...form.register('confirmPassword')} />
                  </div>
                  {form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="col-span-2 pt-4 border-t">
                <h4 className="text-sm font-medium mb-1">PIN Keamanan (2FA)</h4>
                <div className="grid gap-4 md:grid-cols-2 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN Baru</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="pin" 
                        type="password" 
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="PIN"
                        className="pl-9 font-mono tracking-widest" 
                        {...form.register('pin')} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Konfirmasi PIN</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="confirmPin" 
                        type="password" 
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="Konfirmasi"
                        className="pl-9 font-mono tracking-widest" 
                        {...form.register('confirmPin')} 
                      />
                    </div>
                    {form.formState.errors.confirmPin && <p className="text-xs text-destructive">{form.formState.errors.confirmPin.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Simpan
            </Button>
        </div>
      )}
    </form>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
          <p className="text-muted-foreground">Profil admin dan konfigurasi situs.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="site">Situs</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileSettingsForm />
        </TabsContent>
        <TabsContent value="site" className="space-y-4">
          <SiteSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

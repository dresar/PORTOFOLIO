import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { api } from '../../services/api';

const categorySchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, "Nama kategori wajib diisi"),
    slug: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CertificateCategoryManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            id: undefined,
            name: '',
            slug: '',
        }
    });

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['certificate-categories'],
        queryFn: api.certificateCategories.getAll,
    });

    const sortedCategories = useMemo(() => {
        return [...(categories || [])].sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }, [categories]);

    const createMutation = useMutation({
        mutationFn: api.certificateCategories.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificate-categories'] });
            form.reset({ id: undefined, name: '', slug: '' });
            toast({ title: "Berhasil", description: "Kategori berhasil dibuat." });
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.message;
            if (message?.includes('unique constraint') || message?.includes('already exists')) {
                 toast({ variant: "destructive", title: "Gagal", description: "ID atau nama kategori sudah ada. Gunakan nilai unik." });
                 form.setError('name', { type: 'manual', message: 'ID atau nama kategori sudah digunakan' });
            } else {
                 toast({ variant: "destructive", title: "Gagal", description: "Gagal membuat kategori." });
            }
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: any }) => api.certificateCategories.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificate-categories'] });
            setEditingId(null);
            form.reset({ id: undefined, name: '', slug: '' });
            toast({ title: "Berhasil", description: "Kategori berhasil diperbarui." });
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || error.message;
             if (message?.includes('unique constraint') || message?.includes('already exists')) {
                 toast({ variant: "destructive", title: "Gagal", description: "ID atau nama kategori sudah ada. Gunakan nilai unik." });
                 form.setError('name', { type: 'manual', message: 'ID atau nama kategori sudah digunakan' });
            } else {
                 toast({ variant: "destructive", title: "Gagal", description: "Gagal memperbarui kategori." });
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: api.certificateCategories.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificate-categories'] });
            toast({ title: "Berhasil", description: "Kategori berhasil dihapus." });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus kategori." })
    });

    const onSubmit = (data: CategoryFormValues) => {
        if (!data.slug) {
            data.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        const payload: any = { ...data };
        if (data.id === undefined || isNaN(Number(data.id))) {
            delete payload.id;
        }

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleEdit = (category: any) => {
        setEditingId(category.id);
        form.reset({
            id: Number(category.id),
            name: category.name,
            slug: category.slug,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        form.reset({ id: undefined, name: '', slug: '' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Kelola Kategori
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Kategori Sertifikat</DialogTitle>
                    <DialogDescription>
                        Kelola nama dan ID kategori sertifikat.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        <div className="flex gap-2">
                            <div className="w-24">
                                <Label htmlFor="id" className="text-xs">ID</Label>
                                <Input 
                                    id="id" 
                                    type="number"
                                    placeholder="1" 
                                    className="font-mono text-xs h-9"
                                    {...form.register('id')} 
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="name" className="text-xs">Nama Kategori</Label>
                                <Input 
                                    id="name" 
                                    placeholder="Frontend, AWS, etc." 
                                    className="h-9 text-xs"
                                    {...form.register('name')} 
                                />
                            </div>
                            <div className="flex items-end gap-1">
                                {editingId && (
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={handleCancelEdit}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button type="submit" size="icon" className="h-9 w-9" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                    {form.formState.errors.name && (
                        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="border rounded-md max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[70px]">ID</TableHead>
                                    <TableHead>Nama Kategori</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">Belum ada kategori.</TableCell>
                                    </TableRow>
                                ) : (
                                    sortedCategories.map((cat: any) => (
                                        <TableRow key={cat.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0">
                                                    {cat.id}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {cat.name}
                                                <span className="text-[10px] text-muted-foreground ml-2 block font-mono">{cat.slug}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(cat)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            if (confirm('Hapus kategori ini?')) deleteMutation.mutate(cat.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
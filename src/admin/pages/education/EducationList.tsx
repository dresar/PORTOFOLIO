
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  MoreVertical,
  Award,
  CheckSquare,
  Square,
  Loader2,
  RefreshCw,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EducationList() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'year_desc'>('id_asc');
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const { data: educationList = [], refetch, isFetching } = useQuery({
    queryKey: ['education'],
    queryFn: api.education.getAll,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const filteredAndSortedEducation = useMemo(() => {
    return (educationList || [])
      .filter((edu: any) => edu && edu.id != null)
      .filter((edu: any) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const inst = String(edu.institution || '').toLowerCase();
          const degree = String(edu.degree || '').toLowerCase();
          const field = String(edu.field || '').toLowerCase();
          if (!inst.includes(query) && !degree.includes(query) && !field.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a: any, b: any) => {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;

        if (sortOrder === 'id_asc') {
          return idA - idB;
        }
        if (sortOrder === 'id_desc') {
          return idB - idA;
        }
        if (sortOrder === 'name_asc') {
          return String(a.institution || '').localeCompare(String(b.institution || ''));
        }
        if (sortOrder === 'year_desc') {
          const yearA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const yearB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return yearB - yearA;
        }
        return idA - idB;
      });
  }, [educationList, searchQuery, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedEducation.length && filteredAndSortedEducation.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedEducation.map(e => e.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    setDeleteAlert({ isOpen: true, isBulk: true });
  };

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteAlert.isBulk) {
        await api.education.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} data pendidikan dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.education.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Data pendidikan dihapus." });
      }
      await refetch();
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setIsDeleting(false);
      setDeleteAlert({ isOpen: false });
    }
  };

  const parseGallery = (galleryData: string | any[] | null | undefined): string[] => {
    if (!galleryData) return [];
    let parsed: any[] = [];
    
    if (Array.isArray(galleryData)) {
      parsed = galleryData;
    } else if (typeof galleryData === 'string') {
      try {
        parsed = JSON.parse(galleryData);
      } catch (e) {
        console.error("Failed to parse gallery:", e);
        return [];
      }
    }

    // Normalize to string[]
    return parsed.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && item.url) return item.url;
      return null;
    }).filter(Boolean) as string[];
  };

  const stripHtml = (htmlString?: string) => {
    if (!htmlString) return '';
    return htmlString.replace(/<[^>]*>?/gm, '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Pendidikan
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground">Kelola riwayat pendidikan Anda.</p>
        </div>
        <div className="flex gap-2 items-center">
            {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Hapus ({selectedIds.length})
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            <Button variant="outline" onClick={toggleSelectAll} disabled={educationList.length === 0}>
                {educationList.length > 0 && selectedIds.length === educationList.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {educationList.length > 0 && selectedIds.length === educationList.length ? 'Batal Pilih' : 'Pilih Semua'}
            </Button>
            <Button onClick={() => navigate('/admin/education/new')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pendidikan
            </Button>
        </div>
      </div>

      {/* Toolbar Filter & Sort */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari sekolah / institusi / gelar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-56 flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_asc">ID Terkecil (Default)</SelectItem>
                <SelectItem value="id_desc">ID Terbesar</SelectItem>
                <SelectItem value="name_asc">Institusi (A-Z)</SelectItem>
                <SelectItem value="year_desc">Tahun Terbaru</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground self-end sm:self-center">
          Menampilkan <span className="font-semibold text-foreground">{filteredAndSortedEducation.length}</span> dari {educationList.length} pendidikan
        </div>
      </div>

      {filteredAndSortedEducation.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <GraduationCap className="h-10 w-10 stroke-1" />
            <p className="text-base font-medium">Tidak ada data pendidikan ditemukan</p>
            <p className="text-xs">Coba ubah kata kunci pencarian Anda.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedEducation.map((edu: any) => (
            <Card key={edu.id} className={`relative group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col ${selectedIds.includes(edu.id) ? 'ring-2 ring-primary' : ''}`}>
              <div className="absolute top-2 left-2 z-20">
                  <Checkbox 
                      checked={selectedIds.includes(edu.id)} 
                      onCheckedChange={() => toggleSelect(edu.id)}
                      className="bg-background/80 backdrop-blur-sm"
                  />
              </div>
              {/* Cover Image */}
              <div className="h-32 bg-muted relative">
                  {edu.coverImage || edu.cover_image || edu.cover_image_url ? (
                      <img src={edu.coverImage || edu.cover_image || edu.cover_image_url} alt={edu.institution} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <GraduationCap className="h-12 w-12 text-white/50" />
                      </div>
                  )}
                  {/* Logo Overlay */}
                  <div className="absolute -bottom-6 left-4">
                      <div className="h-16 w-16 rounded-full border-4 border-background bg-white flex items-center justify-center overflow-hidden shadow-sm">
                          {edu.logo || edu.logo_url || edu.image ? (
                              <img src={edu.logo || edu.logo_url || edu.image} alt="Logo" className="h-full w-full object-contain rounded-full p-1" />
                          ) : (
                              <GraduationCap className="h-8 w-8 text-primary" />
                          )}
                      </div>
                  </div>
              </div>

              <CardContent className="pt-10 pb-4 px-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                          ID: {edu.id}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{edu.institution}</h3>
                      <p className="text-sm text-muted-foreground">{edu.degree} {edu.field ? `in ${typeof edu.field === 'string' ? edu.field : 'Unknown Field'}` : ''}</p>
                   </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/education/${edu.id}`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(edu.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                              {edu.startDate ? new Date(edu.startDate).getFullYear() : '-'} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Sekarang'}
                          </span>
                      </div>
                      {edu.location && (
                          <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{edu.location}</span>
                          </div>
                      )}
                  </div>
                  
                  {edu.gpa && (
                      <Badge variant="outline" className="text-xs">
                          <Award className="h-3 w-3 mr-1" /> GPA: {edu.gpa}
                      </Badge>
                  )}

                  {edu.description && (
                      <p className="text-sm line-clamp-3 text-muted-foreground">
                          {stripHtml(edu.description)}
                      </p>
                  )}

                  {/* Gallery Preview */}
                  {(() => {
                      const gallery = parseGallery(edu.gallery);
                      if (gallery.length > 0) {
                          return (
                              <div className="flex gap-1 mt-2 overflow-hidden">
                                  {gallery.slice(0, 3).map((img: string, i: number) => (
                                      <div key={i} className="h-8 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                          <img src={img} className="w-full h-full object-cover" />
                                      </div>
                                  ))}
                                  {gallery.length > 3 && (
                                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                          +{gallery.length - 3}
                                      </div>
                                  )}
                              </div>
                          );
                      }
                      return null;
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Item?` : "Hapus Pendidikan?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus data pendidikan yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus data pendidikan ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

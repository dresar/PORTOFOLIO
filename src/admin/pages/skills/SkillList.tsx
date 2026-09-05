
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { normalizeMediaUrl } from '@/lib/utils';
import { api } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Code2, 
  Server, 
  Layout, 
  Database, 
  Terminal, 
  Palette, 
  Cpu, 
  Globe,
  MoreVertical,
  CheckSquare,
  Square,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DeleteAlert } from "../../components/DeleteAlert";
import { SkillCategoryManager } from "./SkillCategoryManager";

// Helper to get icon based on category
const getCategoryIcon = (category: string | any) => {
  let catName = 'code';
  
  if (typeof category === 'string') {
    catName = category;
  } else if (typeof category === 'object' && category !== null) {
    catName = category.name || category.slug || 'code';
  }
  
  const lower = String(catName || '').toLowerCase();
  
  if (lower.includes('front')) return <Layout className="h-8 w-8 text-blue-500" />;
  if (lower.includes('back')) return <Server className="h-8 w-8 text-green-500" />;
  if (lower.includes('db') || lower.includes('data')) return <Database className="h-8 w-8 text-amber-500" />;
  if (lower.includes('devops') || lower.includes('cloud')) return <Terminal className="h-8 w-8 text-purple-500" />;
  if (lower.includes('design') || lower.includes('ui')) return <Palette className="h-8 w-8 text-pink-500" />;
  return <Code2 className="h-8 w-8 text-primary" />;
};

const BUILTIN_ICONS = [
  { name: 'HTML5', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS3', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'JavaScript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'TypeScript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'React', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Vue', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg' },
  { name: 'Angular', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
  { name: 'Svelte', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg' },
  { name: 'Next.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
  { name: 'Nuxt.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg' },
  { name: 'SolidJS', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/solidjs/solidjs-original.svg' },
  { name: 'Gatsby', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gatsby/gatsby-original.svg' },
  { name: 'jQuery', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg' },
  { name: 'Tailwind CSS', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Bootstrap', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg' },
  { name: 'Sass', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg' },
  { name: 'Redux', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg' },
  { name: 'Vite', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg' },
  { name: 'Webpack', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg' },
  { name: 'Node.js', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Express', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' },
  { name: 'NestJS', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg' },
  { name: 'PHP', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
  { name: 'Laravel', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg' },
  { name: 'Symfony', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/symfony/symfony-original.svg' },
  { name: 'CodeIgniter', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codeigniter/codeigniter-plain.svg' },
  { name: 'Python', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'Django', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg' },
  { name: 'Flask', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg' },
  { name: 'FastAPI', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg' },
  { name: 'Ruby', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg' },
  { name: 'Ruby on Rails', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-original-wordmark.svg' },
  { name: 'Go', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg' },
  { name: 'Rust', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg' },
  { name: 'Java', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'Spring Boot', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg' },
  { name: 'Kotlin', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg' },
  { name: 'Scala', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/scala/scala-original.svg' },
  { name: 'C', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { name: 'C++', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
  { name: 'C#', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { name: '.NET', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg' },
  { name: 'Swift', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg' },
  { name: 'Flutter', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' },
  { name: 'React Native', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Android', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg' },
  { name: 'Apple / iOS', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg' },
  { name: 'Dart', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg' },
  { name: 'PostgreSQL', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'MySQL', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { name: 'SQLite', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg' },
  { name: 'MongoDB', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
  { name: 'Redis', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
  { name: 'MariaDB', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg' },
  { name: 'Cassandra', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cassandra/cassandra-original.svg' },
  { name: 'Elasticsearch', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg' },
  { name: 'DynamoDB', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dynamodb/dynamodb-original.svg' },
  { name: 'Oracle', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
  { name: 'MS SQL Server', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-original-wordmark.svg' },
  { name: 'Firebase', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg' },
  { name: 'Supabase', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg' },
  { name: 'Prisma', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg' },
  { name: 'Docker', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'Kubernetes', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-original.svg' },
  { name: 'AWS', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' },
  { name: 'Google Cloud (GCP)', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg' },
  { name: 'Azure', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg' },
  { name: 'Terraform', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg' },
  { name: 'Ansible', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg' },
  { name: 'Jenkins', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg' },
  { name: 'Nginx', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' },
  { name: 'Apache', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg' },
  { name: 'Git', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'GitHub', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
  { name: 'GitLab', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg' },
  { name: 'Bitbucket', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bitbucket/bitbucket-original.svg' },
  { name: 'Figma', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'Adobe Photoshop', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg' },
  { name: 'VS Code', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
  { name: 'GraphQL', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg' },
  { name: 'Apollo', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apollo/apollo-original.svg' },
  { name: 'WebSockets', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg' },
  { name: 'REST API', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
  { name: 'Swagger', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-original.svg' },
  { name: 'Linux', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
  { name: 'Windows', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg' },
  { name: 'NPM', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg' },
  { name: 'Yarn', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/yarn/yarn-original.svg' },
  { name: 'Bun', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg' },
  { name: 'Jest', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg' },
  { name: 'Cypress', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cypress/cypress-original.svg' },
  { name: 'Playwright', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/playwright/playwright-original.svg' },
  { name: 'OAuth 2.0', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oauth/oauth-original.svg' },
  { name: 'Auth0', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/auth0/auth0-original.svg' },
  { name: 'JWT (JSON Web Token)', url: 'https://img.icons8.com/color/120/jwt.png' },
  { name: 'RBAC (Role-Based Access Control)', url: 'https://img.icons8.com/color/120/user-shield.png' },
  { name: 'Database Normalization', url: 'https://img.icons8.com/color/120/database-relation.png' },
  { name: 'ORM (Object-Relational Mapping)', url: 'https://img.icons8.com/color/120/flowchart.png' },
  { name: 'Bash / Shell', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg' },
  { name: 'Markdown', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg' }
];

export default function SkillList() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<any>(null);
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [iconSearch, setIconSearch] = useState('');
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    id?: number;
    isBulk?: boolean;
  }>({ isOpen: false });

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    name: '',
    categoryId: null as null | number,
    percentage: 50,
    logo_url: ''
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'percentage_desc'>('id_asc');

  const { data: skills = [], isLoading: isSkillLoading, isFetching } = useQuery({
    queryKey: ['skills'],
    queryFn: api.skills.getAll,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: api.skillCategories.getAll,
  });

  // Filter & Sort skills (default sort by ID Ascending so smallest ID comes first)
  const filteredAndSortedSkills = useMemo(() => {
    return skills
      .filter((skill: any) => skill && skill.id != null)
      .filter((skill: any) => {
        // 1. Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const skillName = String(skill.name || '').toLowerCase();
          if (!skillName.includes(query)) return false;
        }

        // 2. Category filter
        if (selectedCategory !== 'all') {
          let skillCatId: string | number | null = null;
          let skillCatName: string = '';

          if (typeof skill.category === 'object' && skill.category !== null) {
            skillCatId = skill.category.id;
            skillCatName = skill.category.name || '';
          } else if (typeof skill.category === 'number') {
            skillCatId = skill.category;
          } else if (typeof skill.category === 'string') {
            skillCatName = skill.category;
          }

          const targetCatObj = categories.find(
            (c: any) => String(c.id) === selectedCategory || String(c.name).toLowerCase() === selectedCategory.toLowerCase()
          );

          const targetId = targetCatObj ? targetCatObj.id : (isNaN(Number(selectedCategory)) ? null : Number(selectedCategory));
          const targetName = targetCatObj ? targetCatObj.name : selectedCategory;

          const matchesId = targetId !== null && skillCatId !== null && Number(skillCatId) === Number(targetId);
          const matchesName = targetName && (
            skillCatName.toLowerCase() === String(targetName).toLowerCase() ||
            (typeof skill.category === 'string' && skill.category.toLowerCase() === String(targetName).toLowerCase())
          );

          if (!matchesId && !matchesName) {
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
          return String(a.name || '').localeCompare(String(b.name || ''));
        }
        if (sortOrder === 'percentage_desc') {
          return (Number(b.percentage || b.proficiency) || 0) - (Number(a.percentage || a.proficiency) || 0);
        }
        return idA - idB;
      });
  }, [skills, selectedCategory, searchQuery, sortOrder, categories]);

  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedSkills.length && filteredAndSortedSkills.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedSkills.map((s: any) => s.id));
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

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteAlert.isBulk) {
        await api.skills.bulkDelete(selectedIds);
        toast({ title: "Berhasil", description: `${selectedIds.length} skill dihapus.` });
        setSelectedIds([]);
      } else if (deleteAlert.id) {
        await api.skills.delete(deleteAlert.id);
        toast({ title: "Berhasil", description: "Skill dihapus." });
      }
      await queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus data." });
    } finally {
      setIsDeleting(false);
      setDeleteAlert({ isOpen: false });
    }
  };

  const handleOpenModal = (skill?: any) => {
    setIconSearch('');
    if (skill) {
      setCurrentSkill(skill);
      setFormData({
        id: Number(skill.id),
        name: skill.name,
        categoryId:
          typeof skill.category === 'object' && skill.category
            ? Number(skill.category.id)
            : typeof skill.category === 'number'
              ? Number(skill.category)
              : (() => {
                  const byName = categories.find((c: any) => String(c.name).toLowerCase() === String(skill.category || '').toLowerCase());
                  return byName ? Number(byName.id) : null;
                })(),
        percentage: skill.percentage || skill.proficiency || 50,
        logo_url: skill.logo_url || ''
      });
    } else {
      setCurrentSkill(null);
      const nextId = skills.length > 0 ? Math.max(...skills.map((s: any) => Number(s.id) || 0)) + 1 : 1;
      setFormData({
        id: nextId,
        name: '',
        categoryId: categories?.[0]?.id ? Number(categories[0].id) : null,
        percentage: 50,
        logo_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        percentage: formData.percentage,
        categoryId: formData.categoryId ?? undefined,
        logo_url: formData.logo_url || undefined
      };

      if (currentSkill) {
        if (formData.id !== undefined && !isNaN(Number(formData.id)) && Number(formData.id) !== Number(currentSkill.id)) {
          payload.id = Number(formData.id);
        }
        await api.skills.update(currentSkill.id, payload);
        toast({ title: "Berhasil", description: "Skill berhasil diperbarui." });
      } else {
        if (formData.id !== undefined && !isNaN(Number(formData.id))) {
          payload.id = Number(formData.id);
        }
        await api.skills.create(payload);
        toast({ title: "Berhasil", description: "Skill berhasil ditambahkan." });
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    } catch (error: any) {
      const errDetail = error?.response?.data?.detail || error?.response?.data?.error || error?.message || String(error || '');
      if (errDetail.includes('duplicate key') || errDetail.includes('already exists') || errDetail.includes('skill_pkey')) {
        toast({
          variant: "destructive",
          title: "ID Sudah Digunakan",
          description: `ID ${formData.id} sudah digunakan oleh skill lain. Silakan gunakan ID unik lainnya.`
        });
      } else {
        toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan skill." });
      }
    }
  };

  const handleDelete = (id: number) => {
    setDeleteAlert({ isOpen: true, id, isBulk: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Skill
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground">Kelola daftar keahlian Anda.</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
            <SkillCategoryManager />
            {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Hapus ({selectedIds.length})
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['skills'] })} disabled={isFetching}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            <Button variant="outline" onClick={toggleSelectAll} disabled={filteredAndSortedSkills.length === 0}>
                {filteredAndSortedSkills.length > 0 && selectedIds.length === filteredAndSortedSkills.length ? <CheckSquare className="mr-2 h-4 w-4" /> : <Square className="mr-2 h-4 w-4" />}
                {filteredAndSortedSkills.length > 0 && selectedIds.length === filteredAndSortedSkills.length ? 'Batal Pilih' : 'Pilih Semua'}
            </Button>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Skill
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
              placeholder="Cari skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-56 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-52 flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={sortOrder} onValueChange={(val: any) => setSortOrder(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id_asc">ID Terkecil (Default)</SelectItem>
                <SelectItem value="id_desc">ID Terbesar</SelectItem>
                <SelectItem value="name_asc">Nama (A-Z)</SelectItem>
                <SelectItem value="percentage_desc">Tingkat Keahlian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground self-end sm:self-center">
          Menampilkan <span className="font-semibold text-foreground">{filteredAndSortedSkills.length}</span> dari {skills.length} skill
        </div>
      </div>

      {filteredAndSortedSkills.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Code2 className="h-10 w-10 stroke-1" />
            <p className="text-base font-medium">Tidak ada skill yang ditemukan</p>
            <p className="text-xs">Coba ubah kata kunci pencarian atau filter kategori Anda.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredAndSortedSkills.map((skill: any) => (
            <Card key={skill.id} className={`relative group overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${selectedIds.includes(skill.id) ? 'ring-2 ring-primary' : ''}`} style={{ borderLeftColor: (skill.percentage || skill.proficiency || 0) >= 80 ? '#22c55e' : (skill.percentage || skill.proficiency || 0) >= 50 ? '#eab308' : '#ef4444' }}>
              <div className="absolute top-2 right-2 z-20">
                   <Checkbox 
                       checked={selectedIds.includes(skill.id)} 
                       onCheckedChange={() => toggleSelect(skill.id)}
                   />
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-secondary/50 rounded-lg w-12 h-12 flex items-center justify-center">
                    {skill.logo_url ? (
                       <img 
                         src={normalizeMediaUrl(skill.logo_url)} 
                         alt={skill.name} 
                         className="w-8 h-8 object-contain" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                       getCategoryIcon(skill.category)
                    )}
                    {/* Hidden fallback icon that shows if image fails */}
                    {skill.logo_url && (
                      <div className="fallback-icon hidden">
                        {getCategoryIcon(skill.category)}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenModal(skill)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(skill.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1.5 mb-4">
                  <h3 className="font-bold text-lg leading-tight">{skill.name}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                      ID: {skill.id}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {typeof skill.category === 'object' && skill.category !== null ? (skill.category.name || 'Unknown') : (skill.category || 'Unknown')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Proficiency</span>
                    <span className="font-medium">{Number(skill.percentage || skill.proficiency) || 0}%</span>
                  </div>
                  <Progress value={Number(skill.percentage || skill.proficiency) || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-xl font-bold">
              {currentSkill ? 'Edit Skill' : 'Tambah Skill Baru'}
            </DialogTitle>
            <DialogDescription>
              {currentSkill ? 'Perbarui informasi dan urutan ID skill yang sudah ada.' : 'Tambahkan skill baru dengan menentukan ID dan detail keahlian.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: ID, Name, Category, Proficiency */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-1.5">
                    <Label htmlFor="skill-id" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">ID Skill</Label>
                    <Input
                      id="skill-id"
                      type="number"
                      value={formData.id !== undefined ? formData.id : ''}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="1"
                      required
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="name" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Nama Skill</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="Contoh: HTML5, React.js"
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="category" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Kategori</Label>
                  <Select 
                    value={formData.categoryId !== null ? String(formData.categoryId) : undefined}
                    onValueChange={(val) => setFormData({...formData, categoryId: Number(val)})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2 bg-muted/20 p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tingkat Keahlian</Label>
                    <span className="text-sm font-bold text-primary">{formData.percentage}%</span>
                  </div>
                  <Slider 
                    value={[formData.percentage]} 
                    max={100} 
                    step={5} 
                    onValueChange={(vals) => setFormData({...formData, percentage: vals[0]})}
                    className="py-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Beginner (0%)</span>
                    <span>Intermediate (50%)</span>
                    <span>Expert (100%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Logo & Builtin Icon Selector */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="logo_url" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Logo URL</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="logo_url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://cdn.jsdelivr.net/gh/.../react.svg"
                      className="flex-1"
                    />
                    {formData.logo_url && (
                      <div className="w-10 h-10 border rounded-md flex items-center justify-center bg-secondary/50 p-1 shrink-0">
                        <img 
                          src={normalizeMediaUrl(formData.logo_url)} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Pilih Icon Bawaan (Opsional)</Label>
                    <span className="text-[11px] text-muted-foreground">Preset Devicon</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="Cari icon... (misal: HTML, React, Node, Python, DB)"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 border rounded-lg bg-muted/20 max-h-[190px] overflow-y-auto">
                    {BUILTIN_ICONS.filter(icon => 
                      icon.name.toLowerCase().includes(iconSearch.toLowerCase())
                    ).map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, logo_url: icon.url })}
                        className={`p-2 flex flex-col items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground transition-all ${
                          formData.logo_url === icon.url ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-transparent bg-background/50'
                        }`}
                        title={icon.name}
                      >
                        <img src={icon.url} alt={icon.name} className="w-6 h-6 object-contain" />
                        <span className="text-[9px] mt-1 truncate max-w-full text-muted-foreground">{icon.name}</span>
                      </button>
                    ))}
                    {BUILTIN_ICONS.filter(icon => 
                      icon.name.toLowerCase().includes(iconSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="col-span-5 text-center text-xs text-muted-foreground py-4">
                        Tidak ada icon ditemukan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="min-w-[110px]">
                Simpan Skill
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteAlert
        isOpen={deleteAlert.isOpen}
        onClose={() => setDeleteAlert({ isOpen: false })}
        onConfirm={confirmDelete}
        title={deleteAlert.isBulk ? `Hapus ${selectedIds.length} Skill?` : "Hapus Skill?"}
        description={
          deleteAlert.isBulk
            ? "Apakah Anda yakin ingin menghapus skill yang dipilih? Tindakan ini tidak dapat dibatalkan."
            : "Apakah Anda yakin ingin menghapus skill ini? Tindakan ini tidak dapat dibatalkan."
        }
      />
    </div>
  );
}

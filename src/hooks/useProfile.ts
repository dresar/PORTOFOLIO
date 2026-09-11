import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { safeJsonParse } from '@/lib/utils';

export const DEFAULT_PROFILE = {
  id: 3,
  fullName: "Eka Syarif Maulana, S.Kom",
  greeting: "Halo",
  role: '["Senior Fullstack Developer","System Analyst","Artificial Intelligence (AI) Engineer"]',
  bio: "Saya adalah lulusan Program Studi Teknologi Informasi Universitas Muhammadiyah Sumatera Utara (UMSU) yang memiliki minat besar dalam bidang teknologi, pengembangan perangkat lunak, dan transformasi digital. Saya memiliki kemampuan dalam pengembangan aplikasi web dan mobile, pengelolaan basis data, serta pemanfaatan teknologi untuk menyelesaikan berbagai permasalahan.",
  shortBio: "Membantu bisnis tumbuh melalui teknologi yang tepat",
  heroImage: "https://res.cloudinary.com/dpgybasuh/image/upload/v1783171293/portfolio/j8e5fm2qiwwbnhvu63u9.jpg",
  aboutImage: "https://res.cloudinary.com/dpgybasuh/image/upload/v1783171293/portfolio/j8e5fm2qiwwbnhvu63u9.jpg",
  resumeUrl: "https://go.fliplink.me/view/C0F05869-43CD-4124-9E6D-A7F9F9FC807A",
  location: "3.6163, 98.6744",
  email: "eka.ckp16799@gmail.com",
  phone: "+6282392115909",
  stats_project_count: "50+",
  stats_exp_years: "3+",
  map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254832.505334234!2d98.50467742924397!3d3.642614143767466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303131cc1c3eb2fd%3A0x23d431c8a6908262!2sMedan%2C%20Kota%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sid!2sid!4v1770224591783!5m2!1sid!2sid",
  status: "available",
  contact_email: "eka.ckp16799@gmail.com"
};

export const useProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileAPI.get,
    initialData: () => safeJsonParse(localStorage.getItem('profile_cache'), DEFAULT_PROFILE),
    retry: false, // Don't retry if failed, just show fallback
    refetchOnWindowFocus: false,
  });

  return {
    profile: profile || DEFAULT_PROFILE,
    isLoading: false,
    error,
  };
};

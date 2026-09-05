import { create } from 'zustand';
import type { Project, Education, Certificate } from '@/types';

export type ModalType = 'education-gallery' | 'education-document' | 'education-detail' | 'certificate' | 'experience-gallery' | 'experience-detail' | 'image-preview' | null;

interface ModalState {
  isOpen: boolean;
  modalType: ModalType;
  educationData: Education | null;
  experienceData: any | null;
  documentUrl: string | null;
  documentTitle: string | null;
  certificateData: Certificate | null;
  
  // Image preview lightbox state
  imagePreviewUrl: string | null;
  imagePreviewTitle: string | null;
  imagePreviewList: string[];
  imagePreviewIndex: number;
  
  openEducationGalleryModal: (education: Education) => void;
  openEducationDocumentModal: (url: string, title: string) => void;
  openEducationDetailModal: (education: Education) => void;
  openCertificateModal: (certificate: Certificate) => void;
  openExperienceGalleryModal: (experience: any) => void;
  openExperienceDetailModal: (experience: any) => void;
  openImagePreviewModal: (url: string, title?: string, allImages?: string[], index?: number) => void;
  setImagePreviewIndex: (index: number) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  educationData: null,
  experienceData: null,
  documentUrl: null,
  documentTitle: null,
  certificateData: null,

  imagePreviewUrl: null,
  imagePreviewTitle: null,
  imagePreviewList: [],
  imagePreviewIndex: 0,

  openEducationGalleryModal: (education) => set({
    isOpen: true,
    modalType: 'education-gallery',
    educationData: education,
  }),

  openEducationDocumentModal: (url, title) => set({
    isOpen: true,
    modalType: 'education-document',
    documentUrl: url,
    documentTitle: title,
  }),

  openEducationDetailModal: (education) => set({
    isOpen: true,
    modalType: 'education-detail',
    educationData: education,
  }),

  openCertificateModal: (certificate) => set({
    isOpen: true,
    modalType: 'certificate',
    certificateData: certificate,
  }),

  openExperienceGalleryModal: (experience) => set({
    isOpen: true,
    modalType: 'experience-gallery',
    experienceData: experience,
  }),

  openExperienceDetailModal: (experience) => set({
    isOpen: true,
    modalType: 'experience-detail',
    experienceData: experience,
  }),

  openImagePreviewModal: (url, title = 'Pratinjau Gambar', allImages = [], index = 0) => set({
    isOpen: true,
    modalType: 'image-preview',
    imagePreviewUrl: url,
    imagePreviewTitle: title,
    imagePreviewList: allImages.length > 0 ? allImages : [url],
    imagePreviewIndex: index,
  }),

  setImagePreviewIndex: (index: number) => set((state) => ({
    imagePreviewIndex: index,
    imagePreviewUrl: state.imagePreviewList[index] || state.imagePreviewUrl,
  })),

  closeModal: () => set({
    isOpen: false,
    modalType: null,
    educationData: null,
    experienceData: null,
    documentUrl: null,
    documentTitle: null,
    certificateData: null,
    imagePreviewUrl: null,
    imagePreviewTitle: null,
    imagePreviewList: [],
    imagePreviewIndex: 0,
  }),
}));

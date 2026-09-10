import { lazy, Suspense } from 'react';
import { useModalStore } from '@/store/modalStore';

const EducationGalleryModal = lazy(() => import('./ui/EducationGalleryModal').then(m => ({ default: m.EducationGalleryModal })));
const EducationDocumentModal = lazy(() => import('./ui/EducationDocumentModal').then(m => ({ default: m.EducationDocumentModal })));
const EducationDetailModal = lazy(() => import('./ui/EducationDetailModal').then(m => ({ default: m.EducationDetailModal })));
const CertificateModal = lazy(() => import('./ui/CertificateModal').then(m => ({ default: m.CertificateModal })));
const ExperienceGalleryModal = lazy(() => import('./ui/ExperienceGalleryModal').then(m => ({ default: m.ExperienceGalleryModal })));
const ExperienceDetailModal = lazy(() => import('./ui/ExperienceDetailModal').then(m => ({ default: m.ExperienceDetailModal })));
const ImagePreviewModal = lazy(() => import('./ui/ImagePreviewModal').then(m => ({ default: m.ImagePreviewModal })));

export const GlobalModal = () => {
  const { modalType } = useModalStore();

  if (!modalType) return null;

  return (
    <Suspense fallback={null}>
      {modalType === 'education-gallery' && <EducationGalleryModal />}
      {modalType === 'education-document' && <EducationDocumentModal />}
      {modalType === 'education-detail' && <EducationDetailModal />}
      {modalType === 'certificate' && <CertificateModal />}
      {modalType === 'experience-gallery' && <ExperienceGalleryModal />}
      {modalType === 'experience-detail' && <ExperienceDetailModal />}
      {modalType === 'image-preview' && <ImagePreviewModal />}
    </Suspense>
  );
};

'use client';

import React from 'react';
import { VDialog } from '@/components/ui/v-dialog';
import { VBtn } from '@/components/ui/v-btn';
import { VIcon } from '@/components/ui/v-icon';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus Data',
  description = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.',
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <VDialog open={open} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs leading-relaxed">
          <VIcon name="fa-solid fa-trash-can" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <span>{description}</span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <VBtn variant="outlined" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </VBtn>
          <VBtn variant="danger" size="sm" onClick={onConfirm} loading={loading} prependIcon="fa-solid fa-trash-can">
            Ya, Hapus
          </VBtn>
        </div>
      </div>
    </VDialog>
  );
}

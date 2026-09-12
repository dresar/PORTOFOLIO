'use client';

import React, { useState } from 'react';
import { ContactMessage } from '@/db/schema';
import { markMessageAsReadAction, deleteMessageAction } from '@/actions/content.actions';
import { VCard, VCardHeader, VCardTitle, VCardSubtitle, VCardContent } from '@/components/ui/v-card';
import { VBtn } from '@/components/ui/v-btn';
import { VChip } from '@/components/ui/v-chip';
import { VIcon } from '@/components/ui/v-icon';
import { VDialog } from '@/components/ui/v-dialog';
import { VSnackbar } from '@/components/ui/v-snackbar';
import { DeleteConfirmModal } from '@/components/admin/delete-confirm-modal';

export function MessagesManager({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messagesList] = useState<ContactMessage[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDetailModalOpen(true);

    // Otomatis tandai sebagai telah dibaca jika sebelumnya belum
    if (!msg.isRead) {
      await markMessageAsReadAction(msg.id, true);
    }
  };

  const handleToggleRead = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(true);

    const res = await markMessageAsReadAction(msg.id, !msg.isRead);
    setActionLoading(false);

    if (res.success) {
      setSnackbar({ show: true, message: 'Status pesan berhasil diperbarui.', type: 'success' });
      window.location.reload();
    } else {
      setSnackbar({ show: true, message: res.error || 'Gagal mengubah status pesan.', type: 'error' });
    }
  };

  const handleDeleteClick = (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMessage(msg);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMessage) return;
    setActionLoading(true);

    const res = await deleteMessageAction(selectedMessage.id);
    setActionLoading(false);

    if (res.success) {
      setDeleteModalOpen(false);
      setDetailModalOpen(false);
      setSnackbar({ show: true, message: 'Pesan berhasil dihapus.', type: 'success' });
      window.location.reload();
    } else {
      setSnackbar({ show: true, message: res.error || 'Gagal menghapus pesan.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <VCard elevation={1}>
        <VCardHeader>
          <div>
            <VCardTitle>Kotak Masuk Pesan Kontak</VCardTitle>
            <VCardSubtitle>Kelola pesan dari formulir kontak publik website portofolio</VCardSubtitle>
          </div>
        </VCardHeader>

        <VCardContent className="p-0">
          {messagesList.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <VIcon name="fa-solid fa-inbox" className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium">Kotak masuk kosong. Belum ada pesan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Pengirim</th>
                    <th className="py-3.5 px-4">Subjek & Pesan</th>
                    <th className="py-3.5 px-4">Waktu</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {messagesList.map((msg) => (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenDetail(msg)}
                      className={`cursor-pointer transition-colors ${
                        !msg.isRead ? 'bg-blue-950/20 hover:bg-blue-950/30 font-medium' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{msg.name}</div>
                        <div className="text-[11px] text-slate-400">{msg.email}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="text-slate-200 font-semibold truncate">{msg.subject}</div>
                        <div className="text-[11px] text-slate-400 truncate line-clamp-1">{msg.message}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {!msg.isRead ? (
                          <VChip color="primary" size="sm">
                            Belum Dibaca
                          </VChip>
                        ) : (
                          <VChip color="default" size="sm">
                            Terbaca
                          </VChip>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <VBtn
                            variant="text"
                            size="sm"
                            onClick={(e) => handleToggleRead(msg, e)}
                            className="text-slate-400 hover:text-blue-400 hover:bg-slate-800 h-8 px-2"
                            title={msg.isRead ? 'Tandai Belum Dibaca' : 'Tandai Terbaca'}
                          >
                            <VIcon name={msg.isRead ? 'fa-solid fa-envelope' : 'fa-solid fa-check'} className="w-3.5 h-3.5" />
                          </VBtn>
                          <VBtn
                            variant="text"
                            size="sm"
                            onClick={(e) => handleDeleteClick(msg, e)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                            title="Hapus"
                          >
                            <VIcon name="fa-solid fa-trash-can" className="w-3.5 h-3.5" />
                          </VBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </VCardContent>
      </VCard>

      {/* Modal Dialog Detail Pesan */}
      <VDialog
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          window.location.reload();
        }}
        title="Detail Pesan Kontak"
        maxWidth="md"
      >
        {selectedMessage && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dari:</span>
                <span className="font-bold text-white text-sm">{selectedMessage.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <a href={`mailto:${selectedMessage.email}`} className="text-blue-400 hover:underline">
                  {selectedMessage.email}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Waktu Kirim:</span>
                <span className="text-slate-300">
                  {new Date(selectedMessage.createdAt).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                <span className="text-slate-400">Subjek:</span>
                <span className="font-semibold text-slate-200">{selectedMessage.subject}</span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Isi Pesan:</label>
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap text-sm">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <VBtn
                variant="danger"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                prependIcon="fa-solid fa-trash-can"
              >
                Hapus Pesan
              </VBtn>

              <div className="flex items-center gap-2">
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}>
                  <VBtn variant="primary" size="sm" prependIcon="fa-solid fa-envelope">
                    Balas via Email
                  </VBtn>
                </a>
                <VBtn
                  variant="outlined"
                  size="sm"
                  onClick={() => {
                    setDetailModalOpen(false);
                    window.location.reload();
                  }}
                >
                  Tutup
                </VBtn>
              </div>
            </div>
          </div>
        )}
      </VDialog>

      {/* Modal Dialog Konfirmasi Hapus */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Pesan Kontak"
        description={`Apakah Anda yakin ingin menghapus pesan dari "${selectedMessage?.name}"?`}
        loading={actionLoading}
      />

      <VSnackbar
        show={snackbar.show}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImageToGithubAction } from '@/actions/upload.actions';
import { VBtn } from './v-btn';
import { VIcon } from './v-icon';
import { VChip } from './v-chip';
import { cn } from '@/lib/utils';

interface VImageUploaderProps {
  label: string;
  name: string;
  value?: string;
  onChange?: (url: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

export function VImageUploader({
  label,
  name,
  value: controlledValue,
  onChange,
  placeholder = 'https://raw.githubusercontent.com/...',
  hint,
  required = false,
}: VImageUploaderProps) {
  const [url, setUrl] = useState(controlledValue || '');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setErrorMsg(null);
    if (onChange) onChange(newUrl);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    const res = await uploadImageToGithubAction(formData);
    setUploading(false);

    if (res.success && res.url) {
      handleUrlChange(res.url);
      setSuccessMsg('Gambar berhasil diunggah ke GitHub CDN!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Gagal mengunggah gambar ke GitHub.');
    }

    // Reset input agar bisa memilih file yang sama lagi jika perlu
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isGithubCdn = url.includes('raw.githubusercontent.com') || url.includes('jsdelivr.net');

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
          <span>{label}</span>
          {isGithubCdn && (
            <VChip color="success" size="sm" icon="fa-brands fa-github">
              GitHub CDN
            </VChip>
          )}
        </label>
        {url && (
          <button
            type="button"
            onClick={() => handleUrlChange('')}
            className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
          >
            Hapus Gambar
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Preview Thumbnail */}
        <div className="relative w-20 h-20 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {url ? (
            <Image
              src={url}
              alt="Preview"
              fill
              sizes="80px"
              className="object-cover"
              onError={() => setErrorMsg('Gagal memuat pratinjau gambar dari URL.')}
            />
          ) : (
            <VIcon name="fa-solid fa-image" className="w-8 h-8 text-slate-700" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <VIcon name="fa-solid fa-spinner" className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Input & Action Area */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              name={name}
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              required={required}
              className={cn(
                'flex-1 h-9 px-3 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 font-mono',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
              )}
            />

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
            />

            <VBtn
              type="button"
              variant="tonal"
              size="sm"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
              prependIcon="fa-brands fa-github"
              className="whitespace-nowrap flex-shrink-0"
            >
              Upload CDN
            </VBtn>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{hint || 'Ketik URL manual atau pilih file untuk diunggah ke GitHub CDN.'}</span>
            <span>Maks: 10MB (PNG/JPG/WebP/SVG)</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          <VIcon name="fa-solid fa-circle-xmark" className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </p>
      )}

      {successMsg && (
        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
          <VIcon name="fa-solid fa-circle-check" className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{successMsg}</span>
        </p>
      )}
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { VisualOptionCard } from '../shared/VisualOptionCard';
import { JACKET_TYPE_OPTIONS } from '../constants/jacket-types';
import type { JacketType, WizardAction } from '../wizard-types';
import imageCompression from 'browser-image-compression';

interface StepJacketTypeProps {
  jacketType: JacketType | '';
  referenceImages: string[];
  dispatch: React.Dispatch<WizardAction>;
}

export function StepJacketType({ jacketType, referenceImages, dispatch }: StepJacketTypeProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        });
        const formData = new FormData();
        formData.append('file', compressed);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          dispatch({ type: 'ADD_REFERENCE_IMAGE', url: data.url });
        }
      }
    } catch {
      // upload error
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">자켓 종류 선택</h2>
      <p className="text-sm text-slate-500 mb-6">원하시는 자켓 스타일을 선택하세요.</p>

      {/* 자켓 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {JACKET_TYPE_OPTIONS.map(opt => (
          <VisualOptionCard
            key={opt.value}
            image={opt.image}
            label={opt.label}
            description={opt.description}
            features={opt.features}
            selected={jacketType === opt.value}
            onClick={() => dispatch({ type: 'SET_JACKET_TYPE', value: opt.value })}
            size="lg"
            disabled={opt.disabled}
            disabledLabel="준비중"
          />
        ))}
      </div>

      {/* 참고 이미지 업로드 */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-2">참고 스타일 이미지</h3>
        <p className="text-sm text-slate-500 mb-4">원하시는 스타일의 사진을 첨부해 주세요. (선택)</p>
        <div className="flex flex-wrap gap-3">
          {referenceImages.map((url, idx) => (
            <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => dispatch({ type: 'REMOVE_REFERENCE_IMAGE', index: idx })}
                className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-blue-400 transition-colors">
            <Upload className="h-5 w-5 text-slate-400 mb-1" />
            <span className="text-xs text-slate-400">{uploading ? '업로드...' : '추가'}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

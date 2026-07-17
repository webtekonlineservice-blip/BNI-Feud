'use client';

import { supabase } from '@/lib/supabase';

interface Slide {
  id: string;
  url: string;
  order: number;
  filename: string;
}

interface SlidesTabProps {
  slides: Slide[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (slide: Slide) => void;
  onMove: (slide: Slide, direction: 'up' | 'down') => void;
  onReorder: (dragId: string, dropSlide: Slide) => void;
}

export default function SlidesTab({ slides, uploading, onUpload, onDelete, onReorder }: SlidesTabProps) {
  const sorted = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-6">
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-bni-red text-white rounded font-medium hover:opacity-90 transition cursor-pointer">
          {uploading ? 'Uploading...' : 'Upload Slide'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={onUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Slides Grid */}
      {sorted.length === 0 ? (
        <p className="text-gray-500">No slides uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sorted.map((slide) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('slideId', slide.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dragId = e.dataTransfer.getData('slideId');
                if (dragId === slide.id) return;
                onReorder(dragId, slide);
              }}
              className="border border-gray-200 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:border-bni-red transition"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={slide.url}
                  alt={`Slide ${slide.order}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <button
                  onClick={() => onDelete(slide)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700 transition"
                  title="Delete slide"
                >
                  &times;
                </button>
                <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  #{slide.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

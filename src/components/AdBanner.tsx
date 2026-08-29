import React from 'react';
import { Megaphone, ArrowRight } from 'lucide-react';
import { AdSlot } from '../types';
import { useApp } from '../context/AppContext';

export const AdBanner: React.FC<{ slot: AdSlot }> = ({ slot }) => {
  const { showToast } = useApp();

  if (!slot.enabled) {
    return (
      <div
        id={`ad-slot-${slot.id}`}
        className="relative rounded-2xl border border-dashed border-white/10 bg-[#16161E]/60 aspect-[4/3] flex items-center justify-center"
      >
        <span className="text-[11px] text-zinc-600 font-medium">광고 비활성</span>
      </div>
    );
  }

  return (
    <button
      id={`ad-slot-${slot.id}`}
      onClick={() => showToast('광고 상세 페이지로 이동합니다 (준비 중)')}
      className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-[#16161E] aspect-[4/3] text-left group shadow-lg"
    >
      <img
        src={slot.imageUrl}
        alt={slot.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

      <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold text-black bg-amber-400 px-2 py-0.5 rounded-full">
        <Megaphone className="w-3 h-3" />
        광고
      </span>

      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
        <h4 className="text-xs sm:text-sm font-extrabold text-white line-clamp-1">{slot.title}</h4>
        <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-1">{slot.subtitle}</p>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
          {slot.linkLabel}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </button>
  );
};

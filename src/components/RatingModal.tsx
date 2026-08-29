import React, { useState } from 'react';
import { X, Star, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RatingModal: React.FC = () => {
  const { ratingModalDrama, setRatingModalDrama, submitDramaRating } = useApp();
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  if (!ratingModalDrama) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDramaRating(ratingModalDrama.bookId, selectedRating);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#161620] rounded-3xl border border-white/10 p-5 space-y-4 shadow-2xl">
        <button
          onClick={() => setRatingModalDrama(null)}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white">작품 평가하기</h3>
          <p className="text-xs text-zinc-400 truncate max-w-[240px] mx-auto">
            {ratingModalDrama.bookName}
          </p>
        </div>

        {/* Star Rating Picker */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              className="p-1 text-amber-400 hover:scale-125 transition-transform"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= selectedRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-600'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="text-center text-xs font-bold text-amber-300">
          {selectedRating === 5
            ? '🔥 최고의 띵작! 강력 추천합니다!'
            : selectedRating === 4
            ? '✨ 흥미진진하고 재미있어요!'
            : selectedRating === 3
            ? '👍 볼만해요.'
            : '🤔 아쉬운 점이 있어요.'}
        </div>

        {/* Comment Box */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="이 드라마의 감상평을 남겨주세요 (선택)"
            rows={3}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-rose-500 transition-colors resize-none"
          />

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 transition-all"
          >
            평가 등록하기
          </button>
        </form>
      </div>
    </div>
  );
};

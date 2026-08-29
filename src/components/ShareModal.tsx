import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShareModal: React.FC = () => {
  const { shareModalDrama, setShareModalDrama, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!shareModalDrama) return null;

  const shareUrl = `${window.location.origin}/?drama=${shareModalDrama.bookId}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    showToast('드라마 링크가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSnsShare = (snsName: string) => {
    showToast(`${snsName} 공유 링크를 생성했습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#181822] rounded-3xl border border-white/10 p-5 space-y-4 shadow-2xl">
        <button
          onClick={() => setShareModalDrama(null)}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white">드라마 공유하기</h3>
          <p className="text-xs text-zinc-400">친구에게 재미있는 숏폼 드라마를 추천해보세요!</p>
        </div>

        {/* Drama Preview Chip */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/40 border border-white/5">
          <img
            src={shareModalDrama.cover}
            alt={shareModalDrama.bookName}
            className="w-12 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0 text-left">
            <h4 className="text-xs font-bold text-white truncate">{shareModalDrama.bookName}</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">{shareModalDrama.genre}</p>
            <span className="text-[10px] text-rose-400 font-semibold">총 {shareModalDrama.totalEpisodes}화</span>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <button
            onClick={() => handleSnsShare('카카오톡')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-[#FEE500] text-black font-black flex items-center justify-center shadow">
              <MessageCircle className="w-5 h-5 fill-black" />
            </div>
            <span className="text-[11px] text-zinc-300">카카오톡</span>
          </button>

          <button
            onClick={() => handleSnsShare('인스타그램')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">인스타그램</span>
          </button>

          <button
            onClick={() => handleSnsShare('QR코드')}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-[#2A2A38] text-zinc-200 flex items-center justify-center shadow border border-white/10">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-zinc-300">QR코드</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow">
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-[11px] text-zinc-300">{copied ? '복사완료' : '링크복사'}</span>
          </button>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/50 border border-white/10 text-xs text-zinc-400">
          <span className="truncate flex-1 font-mono text-[11px]">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0"
          >
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>
    </div>
  );
};

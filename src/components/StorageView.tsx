import React, { useState } from 'react';
import { Bookmark, Clock, Download, Play, Trash2, ChevronRight, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageSubTabType } from '../types';

export const StorageView: React.FC = () => {
  const {
    watchHistory,
    favorites,
    dramas,
    clearWatchHistory,
    removeWatchHistoryItem,
    playDrama,
    openDramaDetail,
    toggleFavorite,
    setActiveTab
  } = useApp();

  const [subTab, setSubTab] = useState<StorageSubTabType>('history');

  const favoriteDramas = dramas.filter(d => favorites.includes(d.bookId));

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-5xl mx-auto space-y-4 animate-fadeIn">
      {/* Header with Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-6">
          <button
            id="subtab-storage-history"
            onClick={() => setSubTab('history')}
            className={`flex items-center gap-1.5 pb-2 text-sm sm:text-base font-bold transition-all relative ${
              subTab === 'history' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>시청 내역 ({watchHistory.length})</span>
            {subTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            id="subtab-storage-favorites"
            onClick={() => setSubTab('favorites')}
            className={`flex items-center gap-1.5 pb-2 text-sm sm:text-base font-bold transition-all relative ${
              subTab === 'favorites' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>찜한 콘텐츠 ({favoriteDramas.length})</span>
            {subTab === 'favorites' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
            )}
          </button>

          <button
            id="subtab-storage-downloads"
            onClick={() => setSubTab('downloads')}
            className={`flex items-center gap-1.5 pb-2 text-sm sm:text-base font-bold transition-all relative ${
              subTab === 'downloads' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>다운로드 (0)</span>
            {subTab === 'downloads' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {subTab === 'history' && watchHistory.length > 0 && (
          <button
            id="btn-clear-history"
            onClick={clearWatchHistory}
            className="text-xs text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>전체 삭제</span>
          </button>
        )}
      </div>

      {/* 1. Watch History Sub-Tab */}
      {subTab === 'history' && (
        <div className="space-y-3">
          {watchHistory.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Clock className="w-8 h-8" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">아직 시청한 드라마가 없습니다.</p>
              <button
                id="btn-empty-go-home"
                onClick={() => setActiveTab('home')}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                인기 드라마 보러가기
              </button>
            </div>
          ) : (
            watchHistory.map((item) => {
              const matchedDrama = dramas.find(d => d.bookId === item.bookId);

              return (
                <div
                  id={`history-item-${item.bookId}`}
                  key={item.bookId}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#181822] hover:bg-[#20202E] border border-white/5 transition-all group"
                >
                  {/* Poster Thumbnail */}
                  <div
                    onClick={() => matchedDrama && playDrama(matchedDrama, item.lastWatchedEpisode)}
                    className="relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 shrink-0 cursor-pointer"
                  >
                    <img
                      src={item.cover}
                      alt={item.bookName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 fill-white text-white" />
                    </div>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h4
                      onClick={() => matchedDrama && openDramaDetail(matchedDrama)}
                      className="text-sm font-bold text-white truncate cursor-pointer hover:text-rose-400 transition-colors"
                    >
                      {item.bookName}
                    </h4>

                    <p className="text-xs text-zinc-400">
                      {item.lastWatchedEpisode}화 시청 중 • {item.updatedAt}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`btn-resume-${item.bookId}`}
                      onClick={() => matchedDrama && playDrama(matchedDrama, item.lastWatchedEpisode)}
                      className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-rose-600/30"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>이어보기</span>
                    </button>

                    <button
                      id={`btn-delete-history-${item.bookId}`}
                      onClick={() => removeWatchHistoryItem(item.bookId)}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      title="기록 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. Favorites Sub-Tab */}
      {subTab === 'favorites' && (
        <div>
          {favoriteDramas.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Heart className="w-8 h-8" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">찜한 콘텐츠가 없습니다.</p>
              <button
                onClick={() => setActiveTab('home')}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                드라마 둘러보기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {favoriteDramas.map((drama) => (
                <div
                  id={`fav-card-${drama.bookId}`}
                  key={drama.bookId}
                  onClick={() => openDramaDetail(drama)}
                  className="group cursor-pointer select-none relative"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 border border-white/5 shadow-md">
                    <img
                      src={drama.cover}
                      alt={drama.bookName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(drama.bookId);
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-rose-500 hover:scale-110 active:scale-90 transition-transform"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1 mt-1.5 group-hover:text-rose-400">
                    {drama.bookName}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {drama.tagNames[0] || drama.genre}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Downloads Sub-Tab */}
      {subTab === 'downloads' && (
        <div className="py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Download className="w-8 h-8" />
          </div>
          <p className="text-sm text-zinc-400 font-medium">다운로드된 영상이 없습니다.</p>
          <p className="text-xs text-zinc-500">Wi-Fi 환경에서 미리 다운로드하여 데이터 걱정 없이 시청하세요.</p>
        </div>
      )}
    </div>
  );
};

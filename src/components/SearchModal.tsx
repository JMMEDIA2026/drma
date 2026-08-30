import React, { useState } from 'react';
import { Search, X, TrendingUp, Play, Clock, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

const POPULAR_SEARCH_KEYWORDS = [
  '100억 슈퍼카',
  '무림고수',
  '더빙',
  '시스템',
  '환생',
  '인생 2회차',
  '아내 바보',
  '여왕마마',
  '치트키',
  '복수'
];

export const SearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    dramas,
    openDramaDetail,
    playDrama
  } = useApp();

  const [keyword, setKeyword] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    '무림고수',
    '내 100억 슈퍼카'
  ]);

  if (!searchModalOpen) return null;

  const handleSearchSubmit = (k: string) => {
    setKeyword(k);
    if (k.trim() && !recentSearches.includes(k.trim())) {
      setRecentSearches(prev => [k.trim(), ...prev.slice(0, 4)]);
    }
  };

  const results = keyword.trim()
    ? dramas.filter(d =>
        d.bookName.toLowerCase().includes(keyword.toLowerCase()) ||
        d.tagNames.some(t => t.toLowerCase().includes(keyword.toLowerCase())) ||
        d.introduction.toLowerCase().includes(keyword.toLowerCase()) ||
        d.genre.toLowerCase().includes(keyword.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      {/* Container */}
      <div
        id="search-modal-container"
        className="w-full max-w-lg sm:max-w-2xl bg-[#15151D] rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 bg-[#1F1F2A] rounded-2xl px-3.5 py-2.5 border border-white/10 focus-within:border-rose-500 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              id="input-search-drama"
              type="text"
              value={keyword}
              onChange={(e) => handleSearchSubmit(e.target.value)}
              placeholder="드라마 제목, 장르, 키워드 검색..."
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              autoFocus
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            id="btn-close-search"
            onClick={() => setSearchModalOpen(false)}
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-1"
          >
            닫기
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {/* If there's a search term, show results */}
          {keyword.trim() ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>검색 결과 ({results.length}건)</span>
              </div>

              {results.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm space-y-1">
                  <p>"{keyword}"에 대한 검색 결과가 없습니다.</p>
                  <p className="text-xs text-zinc-600">인기 키워드로 검색해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((drama) => (
                    <div
                      key={drama.bookId}
                      onClick={() => {
                        openDramaDetail(drama);
                        setSearchModalOpen(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl bg-[#1C1C26] hover:bg-[#232332] border border-white/5 cursor-pointer transition-all group"
                    >
                      <img
                        src={drama.cover}
                        alt={drama.bookName}
                        className="w-12 h-16 rounded-lg object-cover bg-zinc-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                          {drama.bookName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                          <span>{drama.genre}</span>
                          <span>•</span>
                          <span className="text-amber-400">★ {(drama.rating ?? 4.8).toFixed(1)}</span>
                          <span>•</span>
                          <span>조회 {drama.hotCode}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playDrama(drama, 1);
                          setSearchModalOpen(false);
                        }}
                        className="p-2 rounded-full bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-all shrink-0"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" /> 최근 검색어
                    </span>
                    <button
                      onClick={() => setRecentSearches([])}
                      className="hover:text-white transition-colors"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((rec, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearchSubmit(rec)}
                        className="px-3 py-1.5 rounded-full text-xs bg-[#1F1F2A] hover:bg-[#2A2A38] text-zinc-200 border border-white/5 transition-colors"
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>실시간 급상승 키워드</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_SEARCH_KEYWORDS.map((kw, i) => (
                    <button
                      key={kw}
                      onClick={() => handleSearchSubmit(kw)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1C1C26] hover:bg-[#232332] text-left transition-colors border border-white/5 group"
                    >
                      <span className={`text-xs font-bold ${i < 3 ? 'text-rose-500' : 'text-zinc-500'}`}>
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                        {kw}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

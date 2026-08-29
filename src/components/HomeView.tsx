import React, { useState } from 'react';
import { Play, Flame, ChevronRight, Sparkles, TrendingUp, Filter, Trash2, Globe, ShieldAlert, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Drama } from '../types';
import { BENTO_COLLECTIONS } from '../data/dramas';
import { AdBanner } from './AdBanner';
import { getGenreTheme, getDramaYear } from '../data/genreStyles';

const TAG_FILTERS = [
  '전체',
  '복수',
  '인생 역전',
  '더빙',
  '사이다',
  '환생',
  '빙의',
  '로맨스',
  '판타지',
  '현대',
  '사극',
  '대남주',
  '대여주',
  '치트키',
  '초자연',
  '가족'
];

const LANGUAGE_FILTERS = [
  '전체',
  '한국어 더빙',
  '자막 (원어)'
];

export const HomeView: React.FC = () => {
  const {
    dramas,
    isLoading,
    homeCategory,
    openDramaDetail,
    playDrama,
    selectedTagFilter,
    setSelectedTagFilter,
    selectedLanguageFilter,
    setSelectedLanguageFilter,
    watchHistory,
    removeWatchHistoryItem,
    adSlots,
    ageVerified,
    verifyAge,
    userProfile
  } = useApp();

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Top banner dramas
  const heroDramas = dramas.slice(0, 5);

  // Filtered dramas based on category and tags
  const getFilteredDramas = (): Drama[] => {
    if (homeCategory === '신작') {
      return [...dramas].reverse();
    }
    if (homeCategory === '인기 순위') {
      return [...dramas].sort((a, b) => {
        const getHot = (v: string) => {
          if (v.includes('M')) return parseFloat(v) * 1000;
          if (v.includes('K')) return parseFloat(v);
          return parseFloat(v) || 0;
        };
        return getHot(b.hotCode) - getHot(a.hotCode);
      });
    }
    if (homeCategory === '분류') {
      let list = dramas;
      if (selectedTagFilter && selectedTagFilter !== '전체') {
        list = list.filter(d =>
          d.tagNames.includes(selectedTagFilter) ||
          d.genre.includes(selectedTagFilter) ||
          (selectedTagFilter === '더빙' && d.isDubbed)
        );
      }
      if (selectedLanguageFilter === '한국어 더빙') {
        list = list.filter(d => d.isDubbed);
      } else if (selectedLanguageFilter === '자막 (원어)') {
        list = list.filter(d => !d.isDubbed);
      }
      return list;
    }
    if (homeCategory === '성인' && userProfile.isLifetime) {
      return dramas.filter(d => d.ageRating === '19');
    }
    // Default '추천'
    return dramas;
  };

  const displayDramas = getFilteredDramas();

  return (
    <div className="pb-24 pt-1 px-3 sm:px-4 max-w-5xl mx-auto space-y-5 animate-fadeIn">
      {/* Category: '분류' Tag Filter Chips */}
      {homeCategory === '분류' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold pl-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>장르별</span>
          </div>
          {TAG_FILTERS.map(tag => {
            const isSelected = (!selectedTagFilter && tag === '전체') || selectedTagFilter === tag;
            return (
              <button
                id={`btn-filter-${tag}`}
                key={tag}
                onClick={() => setSelectedTagFilter(tag === '전체' ? null : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-[#1C1C24] text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      {/* Category: '분류' Language Filter Chips */}
      {homeCategory === '분류' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold pl-1 shrink-0">
            <Globe className="w-3.5 h-3.5" />
            <span>언어별</span>
          </div>
          {LANGUAGE_FILTERS.map(lang => {
            const isSelected = (!selectedLanguageFilter && lang === '전체') || selectedLanguageFilter === lang;
            return (
              <button
                id={`btn-lang-filter-${lang}`}
                key={lang}
                onClick={() => setSelectedLanguageFilter(lang === '전체' ? null : lang)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-[#1C1C24] text-zinc-400 hover:text-zinc-200 border border-white/5'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      )}

      {/* Continue Watching Section (이어보기) - Small Card List style with emphasized progress bar */}
      {homeCategory === '추천' && watchHistory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50" />
              이어보기
            </h3>
            <span className="text-xs text-zinc-400 font-medium">최근 시청 중인 작품</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {watchHistory.slice(0, 2).map((item) => {
              const matchedDrama = dramas.find(d => d.bookId === item.bookId);
              return (
                <div
                  id={`continue-watching-${item.bookId}`}
                  key={item.bookId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-rose-500/30 transition-all group backdrop-blur-md shadow-lg"
                >
                  <div
                    onClick={() => matchedDrama && playDrama(matchedDrama, item.lastWatchedEpisode)}
                    className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-lg overflow-hidden bg-zinc-800 shrink-0 cursor-pointer shadow-md"
                  >
                    <img
                      src={item.cover}
                      alt={item.bookName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 fill-white text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/30">
                        {item.lastWatchedEpisode}화 시청 중
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-extrabold text-rose-400">{item.progressPercent}%</span>
                        <span className="text-[10px] text-zinc-500">• {item.updatedAt}</span>
                      </div>
                    </div>

                    <h4
                      onClick={() => matchedDrama && openDramaDetail(matchedDrama)}
                      className="text-xs sm:text-sm font-bold text-white truncate cursor-pointer hover:text-rose-400 transition-colors"
                    >
                      {item.bookName}
                    </h4>

                    {/* Emphasized Progress Bar */}
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 h-full rounded-full transition-all duration-500 shadow-sm shadow-rose-500/50"
                        style={{ width: `${item.progressPercent}%` }}
                      />
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <button
                        id={`btn-resume-${item.bookId}`}
                        onClick={() => matchedDrama && playDrama(matchedDrama, item.lastWatchedEpisode)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>이어보기</span>
                      </button>
                      <button
                        id={`btn-remove-history-${item.bookId}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWatchHistoryItem(item.bookId);
                        }}
                        title="시청 기록 삭제"
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured Hero Banner Slider (Visible in '추천' & '신작') */}
      {(homeCategory === '추천' || homeCategory === '신작') && heroDramas.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden bg-[#16161E] border border-white/5 shadow-xl">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full">
            <img
              src={heroDramas[activeHeroIndex]?.cover}
              alt={heroDramas[activeHeroIndex]?.bookName}
              className="w-full h-full object-cover transition-transform duration-700 ease-out scale-105"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-[#101014]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#101014]/80 via-transparent to-transparent" />

            {/* Banner Content */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                  {heroDramas[activeHeroIndex]?.badge || '인기'}
                </span>
                <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  조회수 {heroDramas[activeHeroIndex]?.hotCode}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight line-clamp-1">
                {heroDramas[activeHeroIndex]?.bookName}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 mt-1 max-w-xl">
                {heroDramas[activeHeroIndex]?.introduction}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 mt-3">
                <button
                  id={`btn-hero-play-${heroDramas[activeHeroIndex]?.bookId}`}
                  onClick={() => playDrama(heroDramas[activeHeroIndex])}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>지금 감상하기</span>
                </button>
                <button
                  id={`btn-hero-info-${heroDramas[activeHeroIndex]?.bookId}`}
                  onClick={() => openDramaDetail(heroDramas[activeHeroIndex])}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-medium transition-all"
                >
                  상세 정보
                </button>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
              {heroDramas.map((_, i) => (
                <button
                  id={`hero-dot-${i}`}
                  key={i}
                  onClick={() => setActiveHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeHeroIndex === i ? 'w-4 bg-rose-500' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sponsored Ad Slots (2 halves) */}
      {homeCategory === '추천' && (
        <div className="grid grid-cols-2 gap-3">
          {adSlots.map(slot => (
            <AdBanner key={slot.id} slot={slot} />
          ))}
        </div>
      )}

      {/* Bento Themed Collections (Matching '데릴사위' and '바보인 척' from screenshots) */}
      {homeCategory === '추천' && (
        <div className="space-y-4">
          {BENTO_COLLECTIONS.map((bento) => {
            const featured = dramas.find(d => d.bookId === bento.featuredDramaId) || dramas[0];
            const listItems = dramas.filter(d => bento.itemIds.includes(d.bookId));

            const isWine = bento.theme === 'wine';
            const bgGradient = isWine
              ? 'from-[#2D1B24] to-[#1A1218]'
              : 'from-[#231A30] to-[#14121E]';
            const borderTint = isWine ? 'border-rose-900/30' : 'border-purple-900/30';
            const titleColor = isWine ? 'text-rose-200' : 'text-purple-200';

            return (
              <div
                key={bento.id}
                className={`rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br ${bgGradient} border ${borderTint} shadow-lg`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className={`w-4 h-4 ${isWine ? 'text-rose-400' : 'text-purple-400'}`} />
                    <h3 className={`text-base font-bold ${titleColor}`}>
                      {bento.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTagFilter(bento.title);
                      // switch to category
                    }}
                    className="flex items-center text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>더보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2-Column Bento layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Left Column: Mini stacked list */}
                  <div className="md:col-span-6 flex flex-col justify-between space-y-2">
                    {listItems.slice(0, 4).map((item) => (
                      <div
                        id={`bento-item-${item.bookId}`}
                        key={item.bookId}
                        onClick={() => openDramaDetail(item)}
                        className="flex items-center gap-3 p-2 rounded-xl bg-black/20 hover:bg-black/40 border border-white/5 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group"
                      >
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                          <img
                            src={item.cover}
                            alt={item.bookName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate group-hover:text-rose-300 transition-colors">
                            {item.bookName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-zinc-400">
                              {item.tagNames[0] || '드라마'}
                            </span>
                            <span className="text-[11px] text-amber-400 font-medium">
                              ★ {item.rating || '4.8'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Large Featured Poster Card */}
                  {featured && (
                    <div
                      id={`bento-featured-${featured.bookId}`}
                      onClick={() => openDramaDetail(featured)}
                      className="md:col-span-6 relative rounded-xl overflow-hidden bg-black/30 border border-white/10 group cursor-pointer aspect-[16/10] md:aspect-auto flex flex-col justify-end p-3.5"
                    >
                      <img
                        src={featured.cover}
                        alt={featured.bookName}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      {/* Overlays */}
                      <div className="relative z-10">
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          {featured.tagNames.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-zinc-200 border border-white/10"
                            >
                              {t} &gt;
                            </span>
                          ))}
                          <span className="text-[11px] font-bold text-amber-300 ml-auto flex items-center gap-0.5">
                            <Play className="w-3 h-3 fill-amber-300" />
                            {featured.hotCode}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-rose-300 transition-colors">
                          {featured.bookName}
                        </h4>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Adult Content Age Gate */}
      {homeCategory === '성인' && userProfile.isLifetime && !ageVerified && (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-16 px-6 rounded-2xl bg-[#171018] border border-red-500/20">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-white">성인 인증이 필요합니다</h3>
            <p className="text-xs text-zinc-400 max-w-xs">
              만 19세 이상만 이용 가능한 콘텐츠입니다. 본인 인증 후 계속 시청해주세요.
            </p>
          </div>
          <button
            id="btn-verify-age"
            onClick={() => verifyAge()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
          >
            성인 인증하고 계속 보기
          </button>
        </div>
      )}

      {/* Main Drama Posters Grid */}
      {(homeCategory !== '성인' || (userProfile.isLifetime && ageVerified)) && (
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              {homeCategory === '인기 순위'
                ? '실시간 인기 차트 TOP'
                : homeCategory === '신작'
                ? '따끈따끈한 신작 드라마'
                : homeCategory === '분류'
                ? `${selectedTagFilter || '전체'} 드라마`
                : homeCategory === '성인'
                ? '19세 이상 성인 컨텐츠'
                : '지금 뜨는 인기 숏폼'}
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            총 {displayDramas.length}편
          </span>
        </div>

        {/* 3-Column Grid on Mobile, 4-Column on Desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {displayDramas.map((drama, index) => (
            <div
              id={`card-drama-${drama.bookId}`}
              key={drama.bookId}
              onClick={() => openDramaDetail(drama)}
              className="group cursor-pointer flex flex-col select-none transition-transform hover:-translate-y-1 active:scale-95"
            >
              {/* Poster Image Container */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#1C1C24] border border-white/5 shadow-md">
                <img
                  src={drama.cover}
                  alt={drama.bookName}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Top Badge (인기 / 더빙 / 신작 / Rank) */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                  {homeCategory === '인기 순위' ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[11px] font-black shadow-md ${
                        index === 0
                          ? 'bg-amber-500 text-black'
                          : index === 1
                          ? 'bg-zinc-300 text-black'
                          : index === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-black/70 text-white backdrop-blur-sm'
                      }`}
                    >
                      {index + 1}
                    </span>
                  ) : (
                    <>
                      {drama.isDubbed ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow">
                          더빙
                        </span>
                      ) : drama.badge === '인기' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow">
                          인기
                        </span>
                      ) : drama.badge === 'HOT' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-600 text-white shadow">
                          HOT
                        </span>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Bottom-right view count */}
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-0.5">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>{drama.hotCode}</span>
                </div>
              </div>

              {/* Drama Details Below Poster */}
              <div className="mt-1.5 space-y-1">
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-rose-400 transition-colors">
                  {drama.bookName}
                </h4>

                {/* Mini genre + year tags — icon/color-coded per genre for quick scanning */}
                {(() => {
                  const genreTag = drama.tagNames[0] || drama.genre;
                  const theme = getGenreTheme(genreTag);
                  const GenreIcon = theme.icon;
                  const year = getDramaYear(drama);
                  return (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        <GenreIcon className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate max-w-[64px]">{genreTag}</span>
                      </span>
                      {year && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-zinc-400 border border-white/10">
                          <Calendar className="w-2.5 h-2.5" />
                          {year}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

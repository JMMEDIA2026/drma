import React from 'react';
import { Search, Crown, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HomeCategoryType } from '../types';
import { LANGUAGES } from '../i18n/translations';

const BASE_CATEGORIES: HomeCategoryType[] = ['추천', '신작', '인기 순위', '분류'];

// Display labels are translated via t(); the underlying category values stay
// in Korean since HomeView's filtering logic compares against them directly.
const CATEGORY_LABEL_KEYS: Record<HomeCategoryType, string> = {
  '추천': 'cat_recommend',
  '신작': 'cat_new',
  '인기 순위': 'cat_ranking',
  '분류': 'cat_classify',
  '성인': 'cat_adult',
};

export const Navbar: React.FC = () => {
  const {
    homeCategory,
    setHomeCategory,
    setSearchModalOpen,
    setActiveTab,
    claimDailyCheckIn,
    userProfile,
    dramas,
    t,
    language,
    isAuthenticated,
    setLanguageModalOpen
  } = useApp();

  const currentLanguage = LANGUAGES.find(lng => lng.code === language) ?? LANGUAGES[0];

  const randomPlaceholder = dramas.length > 0
    ? dramas[0].bookName
    : '나 없이도 잘해봐!';

  const categories: HomeCategoryType[] = isAuthenticated && userProfile.isLifetime
    ? [...BASE_CATEGORIES, '성인']
    : BASE_CATEGORIES;

  return (
    <header className="sticky top-0 z-40 bg-[#101014]/95 backdrop-blur-md border-b border-white/5 pt-2 pb-1 px-3 sm:px-4 select-none">
      {/* Top Search & Action Bar */}
      <div className="flex items-center gap-2.5 max-w-5xl mx-auto">
        {/* Search Input Button */}
        <button
          id="btn-open-search"
          onClick={() => setSearchModalOpen(true)}
          className="flex-1 flex items-center gap-2.5 bg-[#1C1C24] hover:bg-[#23232D] transition-colors rounded-full px-3.5 py-2 text-left border border-white/5 group"
        >
          <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors shrink-0" />
          <span className="text-sm text-zinc-400 truncate font-normal">
            {randomPlaceholder}
          </span>
        </button>

        {/* Language Selector Button */}
        <button
          id="btn-nav-language"
          onClick={() => setLanguageModalOpen(true)}
          className="relative rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95 shrink-0 overflow-hidden w-9 h-9 flex items-center justify-center"
          title={t('common_language')}
        >
          <img
            src={`https://flagcdn.com/${currentLanguage.flag}.svg`}
            alt={currentLanguage.native}
            className="w-6 h-6 rounded-full object-cover"
          />
        </button>

        {/* Crown VIP Button */}
        <button
          id="btn-nav-vip"
          onClick={() => setActiveTab('membership')}
          className="relative p-2 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/30 text-amber-400 transition-all hover:scale-105 active:scale-95 shrink-0"
          title="VIP 멤버십"
        >
          <Crown className="w-5 h-5 fill-amber-400/20" />
          {userProfile.isVip && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse ring-2 ring-[#101014]" />
          )}
        </button>

        {/* Gift Daily Reward Button */}
        <button
          id="btn-nav-gift"
          onClick={() => {
            if (!userProfile.checkedInToday) {
              claimDailyCheckIn();
            } else {
              setActiveTab('membership');
            }
          }}
          className="relative p-2 rounded-full bg-gradient-to-br from-rose-500/20 to-red-600/10 hover:from-rose-500/30 hover:to-red-600/20 border border-rose-500/30 text-rose-400 transition-all hover:scale-105 active:scale-95 shrink-0"
          title="출석 보상"
        >
          <Gift className="w-5 h-5" />
          {!userProfile.checkedInToday && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-[#101014]"></span>
            </span>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <nav className="flex items-center gap-6 max-w-5xl mx-auto mt-2 px-1 overflow-x-auto no-scrollbar">
        {categories.map((category) => {
          const isActive = homeCategory === category;
          return (
            <button
              id={`tab-category-${category}`}
              key={category}
              onClick={() => setHomeCategory(category)}
              className={`relative flex items-center gap-1 py-2 text-[15px] whitespace-nowrap transition-colors font-medium ${
                isActive
                  ? 'text-white font-bold'
                  : category === '성인'
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t(CATEGORY_LABEL_KEYS[category])}
              {category === '성인' && (
                <span className="px-1 py-0.5 rounded text-[9px] font-black bg-red-500 text-white leading-none">
                  19
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 to-rose-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

import React from 'react';
import { Home, PlaySquare, Sparkles, Bookmark, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MainTabType } from '../types';

interface NavItem {
  id: MainTabType;
  labelKey: string;
  icon: React.ElementType;
  hasBadge?: boolean;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', labelKey: 'nav_home', icon: Home },
  { id: 'reels', labelKey: 'nav_reels', icon: PlaySquare },
  { id: 'membership', labelKey: 'nav_membership', icon: Sparkles },
  { id: 'storage', labelKey: 'nav_storage', icon: Bookmark, requiresAuth: true },
  { id: 'mypage', labelKey: 'nav_mypage', icon: User, hasBadge: true, requiresAuth: true },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, userProfile, t, isAuthenticated, setAuthViewOpen, showToast } = useApp();

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !isAuthenticated) {
      showToast('로그인이 필요한 메뉴입니다.');
      setAuthViewOpen(true);
      return;
    }
    setActiveTab(item.id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#101014]/95 backdrop-blur-lg border-t border-white/5 py-1.5 px-3 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto select-none">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const showBadge = item.hasBadge && (!userProfile.checkedInToday || userProfile.couponsCount > 0);

          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-transform active:scale-90 ${
                isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <span className={`nav-icon-glow ${isActive ? 'is-active' : ''}`} />
                <Icon
                  className={`relative z-[1] w-5 h-5 transition-all ${
                    isActive ? 'stroke-[2.4px] text-white scale-110' : 'stroke-[1.7px]'
                  }`}
                />
                {showBadge && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#101014] z-[2]" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight ${
                  isActive ? 'font-bold text-white' : 'font-medium text-zinc-400'
                }`}
              >
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

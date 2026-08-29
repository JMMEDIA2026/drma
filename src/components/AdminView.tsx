import React, { useState } from 'react';
import { X, Shield, Megaphone, Users, Trash2, BarChart3, Film, LayoutDashboard, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Drama } from '../types';

type AdminSection = 'dashboard' | 'members' | 'videos' | 'ads';

const BADGE_OPTIONS: NonNullable<Drama['badge']>[] = ['인기', '신작', '더빙', '독점', 'HOT', '추천'];

const MENU_ITEMS: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'members', label: '회원관리', icon: Users },
  { id: 'videos', label: '영상관리', icon: Film },
  { id: 'ads', label: '광고관리', icon: Megaphone },
];

export const AdminView: React.FC = () => {
  const {
    adminPanelOpen,
    setAdminPanelOpen,
    adSlots,
    updateAdSlot,
    dramas,
    updateDrama,
    deleteDrama,
    listAccounts,
    deleteAccount,
    authUser
  } = useApp();

  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [accountsVersion, setAccountsVersion] = useState(0);
  const [videoSearch, setVideoSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');

  if (!adminPanelOpen) return null;

  const accounts = listAccounts();

  const handleDeleteAccount = (email: string) => {
    deleteAccount(email);
    setAccountsVersion(v => v + 1);
  };

  // '카테고리' = 장르(genre) 필드에서 추출한 고유 태그, '분류' = 테마 분류(themeCategory)
  const categoryOptions = Array.from(
    new Set(dramas.flatMap(d => d.genre.split('/').map(g => g.trim()).filter(Boolean)))
  ).sort();
  const classificationOptions = Array.from(
    new Set(dramas.map(d => d.themeCategory).filter((v): v is NonNullable<Drama['themeCategory']> => !!v))
  ).sort();

  const filteredDramas = dramas.filter(d => {
    const matchesSearch = d.bookName.toLowerCase().includes(videoSearch.trim().toLowerCase());
    const matchesCategory = !categoryFilter || d.genre.split('/').map(g => g.trim()).includes(categoryFilter);
    const matchesClassification = !classificationFilter || d.themeCategory === classificationFilter;
    return matchesSearch && matchesCategory && matchesClassification;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#101014] text-zinc-100 flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#101014]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-400" />
          <h1 className="text-base font-extrabold text-white">관리자 페이지</h1>
        </div>
        <button
          id="btn-admin-close"
          onClick={() => setAdminPanelOpen(false)}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section Menu */}
      <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#101014] border-b border-white/5 overflow-x-auto no-scrollbar">
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              id={`btn-admin-menu-${item.id}`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-[#1C1C24] text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-6 pb-16">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#171722] border border-white/5 p-3.5 text-center">
                <BarChart3 className="w-4 h-4 text-rose-400 mx-auto mb-1.5" />
                <div className="text-lg font-black text-white">{dramas.length}</div>
                <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">등록 드라마</div>
              </div>
              <div className="rounded-2xl bg-[#171722] border border-white/5 p-3.5 text-center">
                <Users className="w-4 h-4 text-rose-400 mx-auto mb-1.5" />
                <div className="text-lg font-black text-white">{accounts.length}</div>
                <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">가입 회원</div>
              </div>
              <div className="rounded-2xl bg-[#171722] border border-white/5 p-3.5 text-center">
                <Megaphone className="w-4 h-4 text-rose-400 mx-auto mb-1.5" />
                <div className="text-lg font-black text-white">{adSlots.filter(s => s.enabled).length}/{adSlots.length}</div>
                <div className="text-[10px] text-zinc-500 font-semibold mt-0.5">활성 광고</div>
              </div>
            </div>
          )}

          {/* MEMBERS */}
          {activeSection === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-white px-1">
                <Users className="w-4 h-4 text-rose-400" />
                <span>가입 회원 관리</span>
                <span className="text-xs text-zinc-500 font-medium">({accounts.length}명)</span>
              </div>

              <div className="rounded-2xl bg-[#171722] border border-white/5 overflow-hidden divide-y divide-white/5">
                {accounts.length === 0 && (
                  <div className="p-4 text-xs text-zinc-500 text-center">가입된 회원이 없습니다.</div>
                )}
                {accounts.map(account => (
                  <div
                    key={account.email}
                    id={`admin-account-${account.email}`}
                    className="p-3.5 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{account.nickname}</div>
                      <div className="text-[11px] text-zinc-500 truncate">
                        {account.email}
                        {authUser?.email === account.email && (
                          <span className="ml-1.5 text-rose-400 font-bold">(현재 로그인)</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAccount(account.email)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors shrink-0"
                      title="계정 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIDEOS */}
          {activeSection === 'videos' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-white px-1">
                <Film className="w-4 h-4 text-rose-400" />
                <span>영상(드라마) 관리</span>
                <span className="text-xs text-zinc-500 font-medium">
                  ({filteredDramas.length}/{dramas.length}편)
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={videoSearch}
                  onChange={(e) => setVideoSearch(e.target.value)}
                  placeholder="제목으로 검색"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1C1C24] border border-white/10 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-rose-500"
                />
              </div>

              {/* Category (genre) & Classification (theme) filters — managed separately */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 block mb-1">카테고리 (장르)</label>
                  <select
                    id="admin-video-filter-category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1C1C24] border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                  >
                    <option value="">전체 카테고리</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 block mb-1">분류 (테마)</label>
                  <select
                    id="admin-video-filter-classification"
                    value={classificationFilter}
                    onChange={(e) => setClassificationFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#1C1C24] border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                  >
                    <option value="">전체 분류</option>
                    {classificationOptions.map(theme => (
                      <option key={theme} value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-[#171722] border border-white/5 overflow-hidden divide-y divide-white/5">
                {filteredDramas.length === 0 && (
                  <div className="p-4 text-xs text-zinc-500 text-center">검색 결과가 없습니다.</div>
                )}
                {filteredDramas.map(drama => (
                  <div
                    key={drama.bookId}
                    id={`admin-video-${drama.bookId}`}
                    className="p-3 flex items-center gap-3"
                  >
                    <img
                      src={drama.cover}
                      alt={drama.bookName}
                      className="w-11 h-14 rounded-lg object-cover shrink-0 bg-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{drama.bookName}</div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {drama.genre} · {drama.totalEpisodes}화 · ★{(drama.rating ?? 0).toFixed(1)}
                      </div>
                      <select
                        value={drama.badge || ''}
                        onChange={(e) =>
                          updateDrama(drama.bookId, { badge: (e.target.value || undefined) as Drama['badge'] })
                        }
                        className="mt-1.5 text-[10px] font-semibold bg-black/40 border border-white/10 text-zinc-200 rounded-lg px-2 py-1 outline-none focus:border-rose-500"
                      >
                        <option value="">배지 없음</option>
                        {BADGE_OPTIONS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => deleteDrama(drama.bookId)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors shrink-0"
                      title="영상 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADS */}
          {activeSection === 'ads' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-white px-1">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>광고 슬롯 관리</span>
              </div>

              <div className="space-y-3">
                {adSlots.map(slot => (
                  <div
                    key={slot.id}
                    id={`admin-ad-${slot.id}`}
                    className="rounded-2xl bg-[#171722] border border-white/5 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400">{slot.id}</span>
                      <button
                        onClick={() => updateAdSlot(slot.id, { enabled: !slot.enabled })}
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                          slot.enabled ? 'bg-rose-600' : 'bg-zinc-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            slot.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-500 block mb-1">제목</label>
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) => updateAdSlot(slot.id, { title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-500 block mb-1">부제목</label>
                        <input
                          type="text"
                          value={slot.subtitle}
                          onChange={(e) => updateAdSlot(slot.id, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-500 block mb-1">버튼 문구</label>
                        <input
                          type="text"
                          value={slot.linkLabel}
                          onChange={(e) => updateAdSlot(slot.id, { linkLabel: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-500 block mb-1">이미지 URL</label>
                        <input
                          type="text"
                          value={slot.imageUrl}
                          onChange={(e) => updateAdSlot(slot.id, { imageUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-rose-500 truncate"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

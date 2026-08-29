import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Drama, MainTabType, HomeCategoryType, UserProfile, WatchHistoryItem, UserReview, RecommendationResult, AuthUser, AdSlot } from '../types';
import { fetchLatestDramas, fetchRealEpisodes } from '../services/api';
import { INITIAL_DRAMAS } from '../data/dramas';

export interface AppProfilePreset {
  id: string;
  nickname: string;
  avatar: string;
  tagline: string;
  preferredGenres: string[];
}

export const PRESET_PROFILES: AppProfilePreset[] = [
  {
    id: 'user_k',
    nickname: '드라마러버_K',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    tagline: '사이다 복수극 & 회귀/환생 숏폼 올인',
    preferredGenres: ['복수', '사이다', '환생', '무협']
  },
  {
    id: 'user_minsu',
    nickname: '액션사이다_민수',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    tagline: '통쾌한 먼치킨 액션 & 무협 최강자 선호',
    preferredGenres: ['액션', '무협', '최강자', '다크히어로']
  },
  {
    id: 'user_jieun',
    nickname: '로맨스홀릭_지은',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    tagline: '달달한 로코 & 궁중 사극 정주행러',
    preferredGenres: ['로맨스', '궁중', '로맨스코미디', '선결혼후연애']
  }
];

export const ALL_GENRE_TAGS = [
  '복수', '사이다', '환생', '무협', '액션', '로맨스', '현대', '재벌',
  '궁중', '다크히어로', '최강자', '인생 역전', '초자연', '더빙', '학원', '스릴러'
];

interface StoredAccount {
  email: string;
  passwordHash: string;
  nickname: string;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadAccounts(): StoredAccount[] {
  try {
    const saved = localStorage.getItem('dramabox_accounts');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem('dramabox_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

const DEFAULT_AD_SLOTS: AdSlot[] = [
  {
    id: 'ad_slot_1',
    enabled: true,
    title: '코인 3배 충전 이벤트',
    subtitle: '지금 충전하면 보너스 코인 즉시 지급',
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=600&auto=format&fit=crop',
    linkLabel: '충전하러 가기',
  },
  {
    id: 'ad_slot_2',
    enabled: true,
    title: 'SVIP 연간 45% 할인',
    subtitle: '전편 무제한 · 광고 없는 몰입 시청',
    imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=600&auto=format&fit=crop',
    linkLabel: '멤버십 보기',
  },
];

interface AppContextType {
  dramas: Drama[];
  isLoading: boolean;
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  homeCategory: HomeCategoryType;
  setHomeCategory: (cat: HomeCategoryType) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  selectedLanguageFilter: string | null;
  setSelectedLanguageFilter: (lang: string | null) => void;
  selectedDrama: Drama | null;
  openDramaDetail: (drama: Drama) => void;
  closeDramaDetail: () => void;
  activePlayerDrama: Drama | null;
  activeEpisodeIndex: number;
  playDrama: (drama: Drama, episodeId?: number) => void;
  nextEpisode: () => void;
  prevEpisode: () => void;
  nextDrama: () => void;
  prevDrama: () => void;
  favorites: string[];
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  watchHistory: WatchHistoryItem[];
  continueWatching: WatchHistoryItem[];
  clearWatchHistory: () => void;
  removeWatchHistoryItem: (bookId: string) => void;
  userProfile: UserProfile;
  switchProfile: (presetId: string) => void;
  updateProfileInfo: (nickname: string, avatar: string) => void;
  togglePreferredGenre: (genre: string) => void;
  toggleLikeDrama: (bookId: string) => void;
  toggleDislikeDrama: (bookId: string) => void;
  isDramaLiked: (bookId: string) => boolean;
  isDramaDisliked: (bookId: string) => boolean;
  addUserReview: (reviewData: { bookId: string; dramaTitle: string; dramaCover: string; rating: number; comment: string; tags?: string[] }) => void;
  deleteUserReview: (reviewId: string) => void;
  editUserReview: (reviewId: string, rating: number, comment: string) => void;
  claimDailyCheckIn: () => boolean;
  addCoins: (amount: number) => void;
  upgradeVip: (tier: 'VIP' | 'SVIP') => void;
  purchaseLifetimePass: () => void;
  unlockEpisode: (bookId: string, episodeId: number) => boolean;
  unlockedEpisodes: Record<string, number[]>;
  updateSettings: (settings: Partial<UserProfile['settings']>) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  shareModalDrama: Drama | null;
  setShareModalDrama: (drama: Drama | null) => void;
  refreshDramas: () => Promise<void>;
  ratingModalDrama: Drama | null;
  setRatingModalDrama: (drama: Drama | null) => void;
  submitDramaRating: (bookId: string, rating: number) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  personalizedRecommendations: RecommendationResult[];
  ensureRealEpisodes: (bookId: string) => void;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  authError: string | null;
  signup: (email: string, password: string, nickname: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  adSlots: AdSlot[];
  updateAdSlot: (id: string, changes: Partial<AdSlot>) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;
  listAccounts: () => { email: string; nickname: string }[];
  deleteAccount: (email: string) => void;
  updateDrama: (bookId: string, changes: Partial<Drama>) => void;
  deleteDrama: (bookId: string) => void;
  ageVerified: boolean;
  verifyAge: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'user_k',
  nickname: '드라마러버_K',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  isVip: true,
  vipTier: 'VIP',
  vipExpiryDate: '2026.12.31',
  coins: 480,
  bonusPoints: 1250,
  couponsCount: 3,
  checkedInToday: false,
  checkInStreak: 5,
  preferredGenres: ['복수', '사이다', '환생', '무협'],
  likedDramas: ['42000024099', '42000023219'],
  dislikedDramas: [],
  userReviews: [
    {
      id: 'my_rev_1',
      bookId: '42000024099',
      dramaTitle: '산에서 온 서방님은 무림고수(더빙)',
      dramaCover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      rating: 5,
      comment: '스토리 전개가 진짜 시원시원하고 액션 타격감이 최고예요! 더빙도 성우분들 연기 너무 찰집니다.',
      tags: ['사이다 전개', '더빙 최고', '명작'],
      createdAt: '2026.02.24',
      userName: '드라마러버_K',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      likesCount: 15,
      isMine: true
    }
  ],
  settings: {
    videoQuality: '1080p',
    audioLanguage: 'ko',
    autoPlayNext: true,
    notifications: true,
    dataSaver: false,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dramas, setDramas] = useState<Drama[]>(INITIAL_DRAMAS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTabState] = useState<MainTabType>('home');

  const setActiveTab = (tab: MainTabType) => {
    if (activeTab === 'reels' && tab !== 'reels' && activePlayerDrama) {
      setWatchHistory(prev => {
        const filtered = prev.filter(item => item.bookId !== activePlayerDrama.bookId);
        const ep = activeEpisodeIndex;
        const total = activePlayerDrama.totalEpisodes || 60;
        const progress = Math.min(100, Math.max(10, Math.floor((ep / total) * 100)));
        const updatedItem: WatchHistoryItem = {
          bookId: activePlayerDrama.bookId,
          bookName: activePlayerDrama.bookName,
          cover: activePlayerDrama.cover,
          lastWatchedEpisode: ep,
          totalEpisodes: total,
          progressPercent: progress,
          updatedAt: '방금 전',
          genre: activePlayerDrama.genre
        };
        const newList = [updatedItem, ...filtered];
        try {
          localStorage.setItem('dramabox_history', JSON.stringify(newList));
        } catch (e) {}
        return newList;
      });
    }
    setActiveTabState(tab);
  };
  const [homeCategory, setHomeCategory] = useState<HomeCategoryType>('추천');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string | null>(null);
  
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  const [activePlayerDrama, setActivePlayerDrama] = useState<Drama | null>(INITIAL_DRAMAS[0]);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState<number>(1);
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dramabox_favorites');
      return saved ? JSON.parse(saved) : ['42000024099', '42000023219', '42000024103'];
    } catch {
      return ['42000024099', '42000023219', '42000024103'];
    }
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('dramabox_history');
      return saved ? JSON.parse(saved) : [
        {
          bookId: '42000024099',
          bookName: '산에서 온 서방님은 무림고수(더빙)',
          cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
          lastWatchedEpisode: 1,
          totalEpisodes: 80,
          progressPercent: 45,
          updatedAt: '방금 전',
          genre: '무협 / 액션'
        },
        {
          bookId: '42000023219',
          bookName: '내 100억 슈퍼카에 손대지 마!',
          cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
          lastWatchedEpisode: 3,
          totalEpisodes: 65,
          progressPercent: 80,
          updatedAt: '2시간 전',
          genre: '복수 / 로맨스'
        }
      ];
    } catch {
      return [];
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('dramabox_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_USER,
          ...parsed,
          preferredGenres: parsed.preferredGenres || DEFAULT_USER.preferredGenres,
          likedDramas: parsed.likedDramas || DEFAULT_USER.likedDramas,
          dislikedDramas: parsed.dislikedDramas || [],
          userReviews: parsed.userReviews || DEFAULT_USER.userReviews
        };
      }
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('dramabox_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem('dramabox_auth_user', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('dramabox_auth_user');
      }
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [authUser]);

  const signup = async (email: string, password: string, nickname: string): Promise<boolean> => {
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setAuthError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    if (password.length < 8) {
      setAuthError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }
    if (!nickname.trim()) {
      setAuthError('닉네임을 입력해주세요.');
      return false;
    }

    const accounts = loadAccounts();
    if (accounts.some(a => a.email === normalizedEmail)) {
      setAuthError('이미 가입된 이메일입니다.');
      return false;
    }

    const passwordHash = await hashPassword(password);
    accounts.push({ email: normalizedEmail, passwordHash, nickname: nickname.trim() });
    saveAccounts(accounts);

    setUserProfile(prev => ({ ...prev, nickname: nickname.trim() }));
    setAuthUser({ email: normalizedEmail, nickname: nickname.trim() });
    showToast(`${nickname.trim()}님, 회원가입을 환영합니다! 🎉`);
    return true;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = loadAccounts();
    const account = accounts.find(a => a.email === normalizedEmail);

    if (!account) {
      setAuthError('가입되지 않은 이메일입니다. 먼저 회원가입을 진행해주세요.');
      return false;
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== account.passwordHash) {
      setAuthError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    setUserProfile(prev => ({ ...prev, nickname: account.nickname }));
    setAuthUser({ email: account.email, nickname: account.nickname });
    showToast(`${account.nickname}님, 다시 오신 것을 환영합니다!`);
    return true;
  };

  const logout = () => {
    setAuthUser(null);
    showToast('로그아웃 되었습니다.');
  };

  const [adSlots, setAdSlots] = useState<AdSlot[]>(() => {
    try {
      const saved = localStorage.getItem('dramabox_ad_slots');
      return saved ? JSON.parse(saved) : DEFAULT_AD_SLOTS;
    } catch {
      return DEFAULT_AD_SLOTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dramabox_ad_slots', JSON.stringify(adSlots));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [adSlots]);

  const updateAdSlot = (id: string, changes: Partial<AdSlot>) => {
    setAdSlots(prev => prev.map(slot => (slot.id === id ? { ...slot, ...changes } : slot)));
  };

  const [adminPanelOpen, setAdminPanelOpen] = useState<boolean>(false);

  const listAccounts = () => loadAccounts().map(a => ({ email: a.email, nickname: a.nickname }));

  const deleteAccount = (email: string) => {
    const accounts = loadAccounts().filter(a => a.email !== email);
    saveAccounts(accounts);
    showToast('계정이 삭제되었습니다.');
  };

  const updateDrama = (bookId: string, changes: Partial<Drama>) => {
    setDramas(prev => prev.map(d => (d.bookId === bookId ? { ...d, ...changes } : d)));
  };

  const deleteDrama = (bookId: string) => {
    setDramas(prev => prev.filter(d => d.bookId !== bookId));
    showToast('영상이 삭제되었습니다.');
  };

  const [ageVerified, setAgeVerified] = useState<boolean>(() => {
    try {
      return localStorage.getItem('dramabox_age_verified') === 'true';
    } catch {
      return false;
    }
  });

  const verifyAge = () => {
    setAgeVerified(true);
    try {
      localStorage.setItem('dramabox_age_verified', 'true');
    } catch (e) {
      console.warn('Storage save failed', e);
    }
    showToast('성인 인증이 완료되었습니다.');
  };

  const [unlockedEpisodes, setUnlockedEpisodes] = useState<Record<string, number[]>>({});
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [shareModalDrama, setShareModalDrama] = useState<Drama | null>(null);
  const [ratingModalDrama, setRatingModalDrama] = useState<Drama | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Load dramas from API on initial mount
  const refreshDramas = async () => {
    setIsLoading(true);
    try {
      const loaded = await fetchLatestDramas();
      setDramas(loaded);
      if (!activePlayerDrama && loaded.length > 0) {
        setActivePlayerDrama(loaded[0]);
      }
    } catch (e) {
      console.error('Failed to load dramas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDramas();
  }, []);

  // Loads the real DramaBox episode list (with playable mp4 URLs for
  // unlocked episodes) for a drama the first time it's opened/played,
  // and merges it into that drama's `episodes` field.
  const realEpisodesRequested = useRef<Set<string>>(new Set());
  const ensureRealEpisodes = (bookId: string) => {
    if (realEpisodesRequested.current.has(bookId)) return;
    realEpisodesRequested.current.add(bookId);

    fetchRealEpisodes(bookId).then(realEpisodes => {
      if (!realEpisodes) return;
      setDramas(prev => prev.map(d => (d.bookId === bookId ? { ...d, episodes: realEpisodes } : d)));
      setActivePlayerDrama(prev => (prev && prev.bookId === bookId ? { ...prev, episodes: realEpisodes } : prev));
      setSelectedDrama(prev => (prev && prev.bookId === bookId ? { ...prev, episodes: realEpisodes } : prev));
    }).catch(() => {
      // Not on the live catalog (curated/mock bookId) — keep existing episodes.
    });
  };

  // Save favorites & history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dramabox_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('dramabox_history', JSON.stringify(watchHistory));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [watchHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('dramabox_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [userProfile]);

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(bookId);
      if (exists) {
        showToast('관심(찜) 목록에서 삭제되었습니다.');
        return prev.filter(id => id !== bookId);
      } else {
        showToast('관심(찜) 목록에 추가되었습니다! ❤️');
        return [...prev, bookId];
      }
    });
  };

  const isFavorite = (bookId: string) => favorites.includes(bookId);

  const openDramaDetail = (drama: Drama) => {
    setSelectedDrama(drama);
    ensureRealEpisodes(drama.bookId);
  };

  const closeDramaDetail = () => {
    setSelectedDrama(null);
  };

  const playDrama = (drama: Drama, episodeId: number = 1) => {
    setActivePlayerDrama(drama);
    setActiveEpisodeIndex(episodeId);
    setActiveTab('reels');
    setSelectedDrama(null);
    ensureRealEpisodes(drama.bookId);

    // Update watch history
    setWatchHistory(prev => {
      const filtered = prev.filter(item => item.bookId !== drama.bookId);
      const newItem: WatchHistoryItem = {
        bookId: drama.bookId,
        bookName: drama.bookName,
        cover: drama.cover,
        lastWatchedEpisode: episodeId,
        totalEpisodes: drama.totalEpisodes || 60,
        progressPercent: Math.floor(Math.random() * 40) + 20,
        updatedAt: '방금 전',
        genre: drama.genre
      };
      return [newItem, ...filtered];
    });
  };

  const nextEpisode = () => {
    if (!activePlayerDrama) return;
    if (activeEpisodeIndex < (activePlayerDrama.totalEpisodes || 60)) {
      const nextEp = activeEpisodeIndex + 1;
      setActiveEpisodeIndex(nextEp);
      showToast(`${nextEp}화 재생 중`);
      setWatchHistory(prev => {
        const filtered = prev.filter(item => item.bookId !== activePlayerDrama.bookId);
        const newItem: WatchHistoryItem = {
          bookId: activePlayerDrama.bookId,
          bookName: activePlayerDrama.bookName,
          cover: activePlayerDrama.cover,
          lastWatchedEpisode: nextEp,
          totalEpisodes: activePlayerDrama.totalEpisodes || 60,
          progressPercent: Math.min(100, Math.floor((nextEp / (activePlayerDrama.totalEpisodes || 60)) * 100)),
          updatedAt: '방금 전',
          genre: activePlayerDrama.genre
        };
        return [newItem, ...filtered];
      });
    } else {
      nextDrama();
    }
  };

  const prevEpisode = () => {
    if (!activePlayerDrama) return;
    if (activeEpisodeIndex > 1) {
      const prevEp = activeEpisodeIndex - 1;
      setActiveEpisodeIndex(prevEp);
      showToast(`${prevEp}화 재생 중`);
      setWatchHistory(prev => {
        const filtered = prev.filter(item => item.bookId !== activePlayerDrama.bookId);
        const newItem: WatchHistoryItem = {
          bookId: activePlayerDrama.bookId,
          bookName: activePlayerDrama.bookName,
          cover: activePlayerDrama.cover,
          lastWatchedEpisode: prevEp,
          totalEpisodes: activePlayerDrama.totalEpisodes || 60,
          progressPercent: Math.min(100, Math.floor((prevEp / (activePlayerDrama.totalEpisodes || 60)) * 100)),
          updatedAt: '방금 전',
          genre: activePlayerDrama.genre
        };
        return [newItem, ...filtered];
      });
    }
  };

  const nextDrama = () => {
    if (!activePlayerDrama || dramas.length === 0) return;
    const currentIndex = dramas.findIndex(d => d.bookId === activePlayerDrama.bookId);
    const nextIndex = (currentIndex + 1) % dramas.length;
    const next = dramas[nextIndex];
    playDrama(next, 1);
    showToast(`다음 드라마: ${next.bookName}`);
  };

  const prevDrama = () => {
    if (!activePlayerDrama || dramas.length === 0) return;
    const currentIndex = dramas.findIndex(d => d.bookId === activePlayerDrama.bookId);
    const prevIndex = (currentIndex - 1 + dramas.length) % dramas.length;
    const prev = dramas[prevIndex];
    playDrama(prev, 1);
    showToast(`이전 드라마: ${prev.bookName}`);
  };

  const clearWatchHistory = () => {
    setWatchHistory([]);
    showToast('시청 내역이 모두 삭제되었습니다.');
  };

  const removeWatchHistoryItem = (bookId: string) => {
    setWatchHistory(prev => prev.filter(i => i.bookId !== bookId));
    showToast('시청 기록에서 삭제되었습니다.');
  };

  // Profile management
  const switchProfile = (presetId: string) => {
    const preset = PRESET_PROFILES.find(p => p.id === presetId);
    if (!preset) return;
    setUserProfile(prev => ({
      ...prev,
      id: preset.id,
      nickname: preset.nickname,
      avatar: preset.avatar,
      preferredGenres: preset.preferredGenres
    }));
    showToast(`👤 '${preset.nickname}' 프로필로 전환되었습니다!`);
  };

  const updateProfileInfo = (nickname: string, avatar: string) => {
    setUserProfile(prev => ({
      ...prev,
      nickname,
      avatar
    }));
    showToast('프로필 정보가 수정되었습니다.');
  };

  const togglePreferredGenre = (genre: string) => {
    setUserProfile(prev => {
      const exists = prev.preferredGenres.includes(genre);
      const updated = exists
        ? prev.preferredGenres.filter(g => g !== genre)
        : [...prev.preferredGenres, genre];
      showToast(exists ? `'${genre}' 선호 해제됨` : `'${genre}' 선호 장르 추가됨 ✨`);
      return {
        ...prev,
        preferredGenres: updated
      };
    });
  };

  const toggleLikeDrama = (bookId: string) => {
    setUserProfile(prev => {
      const isLiked = prev.likedDramas.includes(bookId);
      const newDislikes = prev.dislikedDramas.filter(id => id !== bookId);
      if (isLiked) {
        showToast('좋아요를 취소했습니다.');
        return {
          ...prev,
          likedDramas: prev.likedDramas.filter(id => id !== bookId),
          dislikedDramas: newDislikes
        };
      } else {
        showToast('👍 좋아요 표시 완료! 유사한 K-드라마가 더 많이 추천됩니다.');
        return {
          ...prev,
          likedDramas: [...prev.likedDramas, bookId],
          dislikedDramas: newDislikes
        };
      }
    });
  };

  const toggleDislikeDrama = (bookId: string) => {
    setUserProfile(prev => {
      const isDisliked = prev.dislikedDramas.includes(bookId);
      const newLikes = prev.likedDramas.filter(id => id !== bookId);
      if (isDisliked) {
        showToast('싫어요를 취소했습니다.');
        return {
          ...prev,
          dislikedDramas: prev.dislikedDramas.filter(id => id !== bookId),
          likedDramas: newLikes
        };
      } else {
        showToast('👎 싫어요 표시 완료. 이 드라마는 추천에서 제외됩니다.');
        return {
          ...prev,
          dislikedDramas: [...prev.dislikedDramas, bookId],
          likedDramas: newLikes
        };
      }
    });
  };

  const isDramaLiked = (bookId: string) => userProfile.likedDramas.includes(bookId);
  const isDramaDisliked = (bookId: string) => userProfile.dislikedDramas.includes(bookId);

  // Review management
  const addUserReview = (reviewData: { bookId: string; dramaTitle: string; dramaCover: string; rating: number; comment: string; tags?: string[] }) => {
    const newRev: UserReview = {
      id: `rev_${Date.now()}`,
      bookId: reviewData.bookId,
      dramaTitle: reviewData.dramaTitle,
      dramaCover: reviewData.dramaCover,
      rating: reviewData.rating,
      comment: reviewData.comment,
      tags: reviewData.tags || ['강력 추천', '꿀잼'],
      createdAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.'),
      userName: userProfile.nickname,
      userAvatar: userProfile.avatar,
      likesCount: 1,
      isMine: true
    };

    setUserProfile(prev => ({
      ...prev,
      userReviews: [newRev, ...prev.userReviews.filter(r => r.bookId !== reviewData.bookId)]
    }));

    // Update drama rating in memory
    setDramas(prev => prev.map(d => {
      if (d.bookId === reviewData.bookId) {
        const currentCount = d.ratingCount || 100;
        const currentAvg = d.rating || 4.8;
        const newAvg = Number(((currentAvg * currentCount + reviewData.rating) / (currentCount + 1)).toFixed(1));
        const communityReviews = d.communityReviews ? [newRev, ...d.communityReviews] : [newRev];
        return {
          ...d,
          rating: newAvg,
          ratingCount: currentCount + 1,
          communityReviews
        };
      }
      return d;
    }));

    showToast(`⭐ 별점(${reviewData.rating}점)과 리뷰가 등록되었습니다!`);
    setRatingModalDrama(null);
  };

  const deleteUserReview = (reviewId: string) => {
    setUserProfile(prev => ({
      ...prev,
      userReviews: prev.userReviews.filter(r => r.id !== reviewId)
    }));
    showToast('작성하신 리뷰가 삭제되었습니다.');
  };

  const editUserReview = (reviewId: string, rating: number, comment: string) => {
    setUserProfile(prev => ({
      ...prev,
      userReviews: prev.userReviews.map(r => r.id === reviewId ? { ...r, rating, comment } : r)
    }));
    showToast('리뷰가 수정되었습니다.');
  };

  const claimDailyCheckIn = (): boolean => {
    if (userProfile.checkedInToday) {
      showToast('이미 오늘의 출석체크 보상을 받았습니다!');
      return false;
    }
    const rewardCoins = 50;
    const rewardBonus = 100;
    setUserProfile(prev => ({
      ...prev,
      checkedInToday: true,
      checkInStreak: prev.checkInStreak + 1,
      coins: prev.coins + rewardCoins,
      bonusPoints: prev.bonusPoints + rewardBonus
    }));
    showToast(`출석 보상 완료! 🪙+${rewardCoins} 코인, ⭐+${rewardBonus}P 지급!`);
    return true;
  };

  const addCoins = (amount: number) => {
    setUserProfile(prev => ({
      ...prev,
      coins: prev.coins + amount
    }));
    showToast(`🪙 ${amount} 코인이 성공적으로 충전되었습니다!`);
  };

  const upgradeVip = (tier: 'VIP' | 'SVIP') => {
    setUserProfile(prev => ({
      ...prev,
      isVip: true,
      vipTier: tier,
      isLifetime: false,
      vipExpiryDate: '2027.08.31'
    }));
    showToast(`👑 ${tier} 멤버십 가입이 완료되었습니다! 전편 무제한 시청 가능.`);
  };

  const purchaseLifetimePass = () => {
    setUserProfile(prev => ({
      ...prev,
      isVip: true,
      vipTier: '평생회원',
      isLifetime: true,
      vipExpiryDate: undefined
    }));
    showToast('🎉 평생 이용권 구매 완료! 이제 모든 드라마를 평생 무제한으로 시청하실 수 있습니다.');
  };

  const unlockEpisode = (bookId: string, episodeId: number): boolean => {
    if (userProfile.isVip) {
      showToast(`VIP 혜택으로 ${episodeId}화가 무료 잠금해제 되었습니다!`);
      return true;
    }
    if (userProfile.coins < 20) {
      showToast('코인이 부족합니다. 코인을 충전하거나 VIP를 이용하세요.');
      return false;
    }
    setUserProfile(prev => ({ ...prev, coins: prev.coins - 20 }));
    setUnlockedEpisodes(prev => ({
      ...prev,
      [bookId]: [...(prev[bookId] || []), episodeId]
    }));
    showToast(`${episodeId}화 잠금해제 완료 (-20 코인)`);
    return true;
  };

  const updateSettings = (newSettings: Partial<UserProfile['settings']>) => {
    setUserProfile(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
    showToast('설정이 저장되었습니다.');
  };

  const submitDramaRating = (bookId: string, rating: number) => {
    const drama = dramas.find(d => d.bookId === bookId);
    if (drama) {
      addUserReview({
        bookId,
        dramaTitle: drama.bookName,
        dramaCover: drama.cover,
        rating,
        comment: `${rating >= 4 ? '너무 재미있게 몰입해서 봤습니다! 강력 추천합니다.' : '무난하게 킬링타임으로 볼만합니다.'}`,
        tags: rating >= 4 ? ['몰입감 최고', '추천작'] : ['가벼운 킬링타임']
      });
    }
  };

  // Intelligent Recommendation Engine
  const personalizedRecommendations = useMemo<RecommendationResult[]>(() => {
    if (dramas.length === 0) return [];

    // Filter out disliked dramas completely
    const availableDramas = dramas.filter(d => !userProfile.dislikedDramas.includes(d.bookId));

    // Extract watched genres & tags
    const watchedTags = new Set<string>();
    watchHistory.forEach(item => {
      const match = dramas.find(d => d.bookId === item.bookId);
      if (match) {
        match.tagNames?.forEach(t => watchedTags.add(t));
        if (match.genre) {
          match.genre.split('/').forEach(g => watchedTags.add(g.trim()));
        }
      }
    });

    // Extract liked tags
    const likedTags = new Set<string>();
    userProfile.likedDramas.forEach(id => {
      const match = dramas.find(d => d.bookId === id);
      if (match) {
        match.tagNames?.forEach(t => likedTags.add(t));
      }
    });

    const results: RecommendationResult[] = availableDramas.map(drama => {
      let score = 50; // base score
      const matchedTags: string[] = [];

      // 1. Check user preferred genres
      userProfile.preferredGenres.forEach(genre => {
        const inTags = drama.tagNames?.some(t => t.includes(genre) || genre.includes(t));
        const inGenre = drama.genre?.includes(genre);
        const inTheme = drama.themeCategory?.includes(genre);
        if (inTags || inGenre || inTheme) {
          score += 25;
          matchedTags.push(genre);
        }
      });

      // 2. Check watch history overlaps
      drama.tagNames?.forEach(tag => {
        if (watchedTags.has(tag)) {
          score += 15;
          if (!matchedTags.includes(tag)) matchedTags.push(tag);
        }
      });

      // 3. Check liked dramas overlap
      drama.tagNames?.forEach(tag => {
        if (likedTags.has(tag)) {
          score += 20;
          if (!matchedTags.includes(tag)) matchedTags.push(tag);
        }
      });

      // 4. Boost if already favorited or high rating
      if (favorites.includes(drama.bookId)) {
        score += 10;
      }
      if ((drama.rating || 0) >= 4.8) {
        score += 8;
      }

      // Cap matchScore to realistic 82% ~ 99%
      const normalizedScore = Math.min(99, Math.max(78, Math.round((score / 150) * 100)));

      // Generate human reason
      let matchReason = '회원님의 시청 취향과 유사한 트렌드 드라마';
      if (matchedTags.length >= 2) {
        matchReason = `'${matchedTags.slice(0, 2).join("', '")}' 키워드 일치 & 시청 기록 기반`;
      } else if (matchedTags.length === 1) {
        matchReason = `선호 장르 '${matchedTags[0]}' 맞춤 추천`;
      } else if (userProfile.likedDramas.length > 0) {
        matchReason = '회원님이 좋아요한 작품과 가장 유사한 분위기';
      }

      return {
        drama,
        matchScore: normalizedScore,
        matchReason,
        matchedTags: matchedTags.slice(0, 3)
      };
    });

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }, [dramas, userProfile.preferredGenres, userProfile.likedDramas, userProfile.dislikedDramas, watchHistory, favorites]);

  return (
    <AppContext.Provider
      value={{
        dramas,
        isLoading,
        activeTab,
        setActiveTab,
        homeCategory,
        setHomeCategory,
        selectedTagFilter,
        setSelectedLanguageFilter,
        selectedLanguageFilter,
        setSelectedTagFilter,
        selectedDrama,
        openDramaDetail,
        closeDramaDetail,
        activePlayerDrama,
        activeEpisodeIndex,
        playDrama,
        nextEpisode,
        prevEpisode,
        nextDrama,
        prevDrama,
        favorites,
        toggleFavorite,
        isFavorite,
        watchHistory,
        continueWatching: watchHistory,
        clearWatchHistory,
        removeWatchHistoryItem,
        userProfile,
        switchProfile,
        updateProfileInfo,
        togglePreferredGenre,
        toggleLikeDrama,
        toggleDislikeDrama,
        isDramaLiked,
        isDramaDisliked,
        addUserReview,
        deleteUserReview,
        editUserReview,
        claimDailyCheckIn,
        addCoins,
        upgradeVip,
        purchaseLifetimePass,
        unlockEpisode,
        unlockedEpisodes,
        updateSettings,
        searchModalOpen,
        setSearchModalOpen,
        shareModalDrama,
        setShareModalDrama,
        refreshDramas,
        ratingModalDrama,
        setRatingModalDrama,
        submitDramaRating,
        toastMessage,
        showToast,
        personalizedRecommendations,
        ensureRealEpisodes,
        authUser,
        isAuthenticated: !!authUser,
        authError,
        signup,
        login,
        logout,
        adSlots,
        updateAdSlot,
        adminPanelOpen,
        setAdminPanelOpen,
        listAccounts,
        deleteAccount,
        updateDrama,
        deleteDrama,
        ageVerified,
        verifyAge,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import React, { useState } from 'react';
import {
  User,
  Crown,
  Coins,
  Ticket,
  Clock,
  Heart,
  Settings,
  HelpCircle,
  FileText,
  Trash2,
  ChevronRight,
  Sparkles,
  Shield,
  Bell,
  Monitor,
  Volume2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Play,
  Star,
  Users,
  SlidersHorizontal,
  Plus,
  MessageSquare,
  Edit2,
  X,
  TrendingUp,
  Award,
  LogOut
} from 'lucide-react';
import { useApp, PRESET_PROFILES, ALL_GENRE_TAGS } from '../context/AppContext';
import { Drama, RecommendationResult, UserReview } from '../types';

export const MyPageView: React.FC = () => {
  const {
    userProfile,
    updateSettings,
    setActiveTab,
    watchHistory,
    favorites,
    clearWatchHistory,
    removeWatchHistoryItem,
    showToast,
    switchProfile,
    updateProfileInfo,
    togglePreferredGenre,
    toggleLikeDrama,
    toggleDislikeDrama,
    isDramaLiked,
    isDramaDisliked,
    dramas,
    openDramaDetail,
    playDrama,
    toggleFavorite,
    isFavorite,
    deleteUserReview,
    personalizedRecommendations,
    claimDailyCheckIn,
    authUser,
    logout,
    setAdminPanelOpen
  } = useApp();

  const [activeSection, setActiveSection] = useState<'recommend' | 'favorites' | 'history' | 'reviews' | 'settings'>('recommend');
  const [copiedId, setCopiedId] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editNicknameInput, setEditNicknameInput] = useState(userProfile.nickname);
  const [editAvatarInput, setEditAvatarInput] = useState(userProfile.avatar);

  const handleCopyId = () => {
    navigator.clipboard?.writeText(userProfile.id);
    setCopiedId(true);
    showToast('유저 ID가 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (editNicknameInput.trim()) {
      updateProfileInfo(editNicknameInput.trim(), editAvatarInput.trim() || userProfile.avatar);
      setEditProfileOpen(false);
    }
  };

  // Get full drama objects for favorites
  const favoriteDramas = dramas.filter(d => favorites.includes(d.bookId));

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-5xl mx-auto space-y-5 animate-fadeIn text-zinc-100">
      {/* 1. Profile Header & Persona Switcher */}
      <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#201C30] via-[#161522] to-[#101017] border border-white/10 shadow-2xl overflow-hidden">
        {/* Subtle background ambient blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar with VIP badge */}
            <div className="relative shrink-0">
              <img
                src={userProfile.avatar}
                alt={userProfile.nickname}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-400/60 shadow-lg"
              />
              {userProfile.isVip && (
                <span className="absolute -bottom-1 -right-1 p-1.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full text-zinc-950 shadow-lg">
                  <Crown className="w-3.5 h-3.5 fill-zinc-950" />
                </span>
              )}
            </div>

            {/* User Details */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-black text-white truncate tracking-tight">
                  {userProfile.nickname}
                </h2>
                <button
                  id="btn-edit-profile"
                  onClick={() => {
                    setEditNicknameInput(userProfile.nickname);
                    setEditAvatarInput(userProfile.avatar);
                    setEditProfileOpen(true);
                  }}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>수정</span>
                </button>
                <button
                  id="btn-open-admin"
                  onClick={() => setAdminPanelOpen(true)}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>관리자</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>ID: {userProfile.id}</span>
                <button
                  onClick={handleCopyId}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="ID 복사"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-amber-400" />
                  {userProfile.vipTier} 회원 {userProfile.isLifetime ? '(평생 이용)' : `(~${userProfile.vipExpiryDate})`}
                </span>

                <button
                  id="btn-daily-checkin"
                  onClick={() => claimDailyCheckIn()}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                    userProfile.checkedInToday
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 cursor-default'
                      : 'bg-rose-600/30 text-rose-300 border-rose-500/50 hover:bg-rose-600 hover:text-white animate-pulse'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  <span>{userProfile.checkedInToday ? `출석 완료 (${userProfile.checkInStreak}일 연속)` : '오늘의 출석 보상 받기!'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Preset Profile Switcher */}
          <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1.5 shrink-0 sm:max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-rose-400" /> 사용자 프로필 전환
              </span>
              <span className="text-[10px] text-zinc-400">3개 프리셋</span>
            </div>
            <div className="flex items-center gap-1.5">
              {PRESET_PROFILES.map((preset) => {
                const isActive = userProfile.id === preset.id;
                return (
                  <button
                    id={`btn-preset-profile-${preset.id}`}
                    key={preset.id}
                    onClick={() => switchProfile(preset.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border ${
                      isActive
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                        : 'bg-[#181822] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                    title={preset.tagline}
                  >
                    <img
                      src={preset.avatar}
                      alt={preset.nickname}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate text-[11px]">{preset.nickname.split('_')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Wallet Overview Box */}
        <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-black/50 border border-white/5 backdrop-blur-md">
          {/* Coins */}
          <div
            onClick={() => setActiveTab('membership')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          >
            <span className="text-[11px] text-zinc-400 font-medium">보유 코인</span>
            <span className="text-base sm:text-lg font-black text-amber-400 mt-0.5">
              🪙 {userProfile.coins}
            </span>
            <span className="text-[10px] text-amber-400/80 font-bold mt-0.5">충전하기 &gt;</span>
          </div>

          {/* Bonus Points */}
          <div
            onClick={() => setActiveTab('membership')}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border-x border-white/5"
          >
            <span className="text-[11px] text-zinc-400 font-medium">보너스 P</span>
            <span className="text-base sm:text-lg font-black text-rose-400 mt-0.5">
              ⭐ {userProfile.bonusPoints}P
            </span>
            <span className="text-[10px] text-rose-400/80 font-bold mt-0.5">포인트몰 &gt;</span>
          </div>

          {/* Coupons */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <span className="text-[11px] text-zinc-400 font-medium">무료 쿠폰</span>
            <span className="text-base sm:text-lg font-black text-white mt-0.5">
              🎫 {userProfile.couponsCount}장
            </span>
            <span className="text-[10px] text-zinc-400 font-medium mt-0.5">보유 중</span>
          </div>
        </div>
      </div>

      {/* 2. MyPage Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 sm:gap-4 overflow-x-auto no-scrollbar pt-1">
        <button
          id="tab-mypage-recommend"
          onClick={() => setActiveSection('recommend')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'recommend'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>맞춤 추천</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600/30 text-rose-400 font-extrabold">
            {personalizedRecommendations.length}
          </span>
          {activeSection === 'recommend' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
          )}
        </button>

        <button
          id="tab-mypage-favorites"
          onClick={() => setActiveSection('favorites')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'favorites'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" />
          <span>관심 목록 (찜)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 font-bold">
            {favorites.length}
          </span>
          {activeSection === 'favorites' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
          )}
        </button>

        <button
          id="tab-mypage-history"
          onClick={() => setActiveSection('history')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'history'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-4 h-4 text-zinc-400" />
          <span>시청 기록</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300 font-bold">
            {watchHistory.length}
          </span>
          {activeSection === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
          )}
        </button>

        <button
          id="tab-mypage-reviews"
          onClick={() => setActiveSection('reviews')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'reviews'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>내 리뷰 & 별점</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-bold">
            {userProfile.userReviews.length}
          </span>
          {activeSection === 'reviews' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
          )}
        </button>

        <button
          id="tab-mypage-settings"
          onClick={() => setActiveSection('settings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
            activeSection === 'settings'
              ? 'text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>설정 & 지원</span>
          {activeSection === 'settings' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-rose-500 rounded-full" />
          )}
        </button>
      </div>

      {/* SECTION 1: PERSONALIZED RECOMMENDATIONS (맞춤 추천 콘텐츠) */}
      {activeSection === 'recommend' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Genre Preference Interactive Chips */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#171722] border border-white/5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white">선호 장르 설정</h3>
                <span className="text-xs text-zinc-400">(태그를 눌러 실시간 추천을 변경하세요)</span>
              </div>
              <span className="text-xs text-rose-400 font-semibold">{userProfile.preferredGenres.length}개 선택됨</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ALL_GENRE_TAGS.map((genre) => {
                const isSelected = userProfile.preferredGenres.includes(genre);
                return (
                  <button
                    id={`btn-genre-${genre}`}
                    key={genre}
                    onClick={() => togglePreferredGenre(genre)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/20 border border-rose-500/50'
                        : 'bg-[#20202E] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <span>#{genre}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Content Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{userProfile.nickname}님을 위한 개인화 추천 K-드라마</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  시청 기록, 찜 목록 및 좋아요 피드백을 기반으로 매칭된 맞춤 리스트입니다.
                </p>
              </div>
            </div>

            {personalizedRecommendations.length === 0 ? (
              <div className="p-12 text-center bg-[#171722] rounded-2xl border border-white/5 space-y-3">
                <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-semibold text-zinc-400">
                  선택하신 장르에 해당하는 추천 드라마가 없습니다. 장르 태그를 추가해보세요!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {personalizedRecommendations.map(({ drama, matchScore, matchReason, matchedTags }: RecommendationResult) => {
                  const isFav = isFavorite(drama.bookId);
                  const isLiked = isDramaLiked(drama.bookId);
                  const isDisliked = isDramaDisliked(drama.bookId);

                  return (
                    <div
                      key={drama.bookId}
                      className="p-3 sm:p-4 rounded-2xl bg-[#171722] hover:bg-[#1C1C2A] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex gap-3.5">
                        {/* Cover image with click to open detail */}
                        <div
                          onClick={() => openDramaDetail(drama)}
                          className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 cursor-pointer shadow-md"
                        >
                          <img
                            src={drama.cover}
                            alt={drama.bookName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {drama.badge && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white">
                              {drama.badge}
                            </span>
                          )}
                        </div>

                        {/* Info & Match Reason */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{matchScore}% 일치</span>
                            </span>
                            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {drama.rating || '4.8'}
                            </span>
                          </div>

                          <h4
                            onClick={() => openDramaDetail(drama)}
                            className="text-sm sm:text-base font-bold text-white truncate cursor-pointer hover:text-rose-400 transition-colors"
                          >
                            {drama.bookName}
                          </h4>

                          <p className="text-[11px] text-rose-300/90 font-medium line-clamp-1 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/30">
                            💡 {matchReason}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {drama.tagNames?.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  matchedTags.includes(tag)
                                    ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40'
                                    : 'bg-white/5 text-zinc-400'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar: Like / Dislike / Favorite / Play */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                        {/* Like & Dislike Interactive Feedback */}
                        <div className="flex items-center gap-1 bg-[#12121A] rounded-xl p-1 border border-white/5">
                          <button
                            id={`btn-like-drama-${drama.bookId}`}
                            onClick={() => toggleLikeDrama(drama.bookId)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isLiked
                                ? 'bg-rose-600 text-white shadow'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                            title="좋아요 (유사 드라마 추천 강화)"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                            <span className="text-[11px]">좋아요</span>
                          </button>

                          <button
                            id={`btn-dislike-drama-${drama.bookId}`}
                            onClick={() => toggleDislikeDrama(drama.bookId)}
                            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              isDisliked
                                ? 'bg-zinc-700 text-white'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                            }`}
                            title="싫어요 (추천 목록에서 즉시 제외)"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Favorite & Play CTA */}
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn-fav-rec-${drama.bookId}`}
                            onClick={() => toggleFavorite(drama.bookId)}
                            className={`p-2 rounded-xl border transition-all ${
                              isFav
                                ? 'bg-rose-600/20 border-rose-500/40 text-rose-500'
                                : 'bg-[#12121A] border-white/5 text-zinc-400 hover:text-white'
                            }`}
                            title={isFav ? '관심 목록에서 제거' : '관심 목록에 추가'}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                          </button>

                          <button
                            id={`btn-play-rec-${drama.bookId}`}
                            onClick={() => playDrama(drama, 1)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/20 transition-all active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>바로보기</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: FAVORITES (관심 목록 / 찜한 드라마) */}
      {activeSection === 'favorites' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>내가 찜한 K-드라마 ({favoriteDramas.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">관심 목록에 보관된 작품들입니다</span>
          </div>

          {favoriteDramas.length === 0 ? (
            <div className="p-12 text-center bg-[#171722] rounded-3xl border border-white/5 space-y-4">
              <Heart className="w-10 h-10 text-zinc-600 mx-auto stroke-1" />
              <p className="text-sm font-semibold text-zinc-300">아직 찜한 드라마가 없습니다.</p>
              <button
                onClick={() => setActiveSection('recommend')}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                추천 드라마 둘러보기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {favoriteDramas.map((drama) => (
                <div
                  key={drama.bookId}
                  className="rounded-2xl bg-[#171722] border border-white/5 overflow-hidden flex flex-col justify-between group hover:border-white/15 transition-all shadow-md"
                >
                  <div
                    onClick={() => openDramaDetail(drama)}
                    className="relative aspect-[3/4] bg-zinc-800 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={drama.cover}
                      alt={drama.bookName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      id={`btn-remove-fav-${drama.bookId}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(drama.bookId);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-rose-500 hover:scale-110 transition-transform"
                      title="찜 해제"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </button>
                    {drama.badge && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-600 text-white">
                        {drama.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <h4
                        onClick={() => openDramaDetail(drama)}
                        className="text-xs font-bold text-white line-clamp-1 cursor-pointer hover:text-rose-400"
                      >
                        {drama.bookName}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {drama.genre} • {drama.totalEpisodes}화
                      </p>
                    </div>

                    <button
                      id={`btn-play-fav-${drama.bookId}`}
                      onClick={() => playDrama(drama, 1)}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>재생하기</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: WATCH HISTORY (시청 기록) */}
      {activeSection === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>최근 시청 기록 ({watchHistory.length})</span>
            </h3>
            {watchHistory.length > 0 && (
              <button
                id="btn-clear-all-history"
                onClick={clearWatchHistory}
                className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>전체 삭제</span>
              </button>
            )}
          </div>

          {watchHistory.length === 0 ? (
            <div className="p-12 text-center bg-[#171722] rounded-3xl border border-white/5 space-y-3">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto stroke-1" />
              <p className="text-sm font-semibold text-zinc-300">시청 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {watchHistory.map((item) => {
                const drama = dramas.find(d => d.bookId === item.bookId);
                return (
                  <div
                    key={item.bookId}
                    className="p-3 sm:p-4 rounded-2xl bg-[#171722] hover:bg-[#1C1C2A] border border-white/5 flex items-center justify-between gap-3 transition-all"
                  >
                    <div
                      onClick={() => drama && playDrama(drama, item.lastWatchedEpisode)}
                      className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                        <img src={item.cover} alt={item.bookName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm font-bold text-white truncate hover:text-rose-400 transition-colors">
                          {item.bookName}
                        </h4>
                        <p className="text-xs text-zinc-400">
                          {item.lastWatchedEpisode}화 시청 중 • {item.updatedAt}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full max-w-xs bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-rose-500 h-full rounded-full"
                            style={{ width: `${item.progressPercent || 50}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-resume-${item.bookId}`}
                        onClick={() => drama && playDrama(drama, item.lastWatchedEpisode)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>이어보기</span>
                      </button>

                      <button
                        id={`btn-del-history-${item.bookId}`}
                        onClick={() => removeWatchHistoryItem(item.bookId)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                        title="기록 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: USER REVIEWS & RATINGS (내 리뷰 & 별점) */}
      {activeSection === 'reviews' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>내가 남긴 평가 및 리뷰 ({userProfile.userReviews.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">드라마 상세 페이지에서 리뷰를 남길 수 있습니다</span>
          </div>

          {userProfile.userReviews.length === 0 ? (
            <div className="p-12 text-center bg-[#171722] rounded-3xl border border-white/5 space-y-3">
              <Star className="w-10 h-10 text-zinc-600 mx-auto stroke-1" />
              <p className="text-sm font-semibold text-zinc-300">작성하신 리뷰가 없습니다.</p>
              <p className="text-xs text-zinc-400">좋아하는 드라마 상세 페이지에서 첫 리뷰를 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userProfile.userReviews.map((rev: UserReview) => {
                const drama = dramas.find(d => d.bookId === rev.bookId);
                return (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#171722] border border-white/5 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.dramaCover}
                          alt={rev.dramaTitle}
                          className="w-12 h-16 rounded-lg object-cover border border-white/10"
                        />
                        <div>
                          <h4
                            onClick={() => drama && openDramaDetail(drama)}
                            className="text-sm font-bold text-white cursor-pointer hover:text-rose-400"
                          >
                            {rev.dramaTitle}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-amber-400 mt-0.5">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                            <span className="font-bold ml-1">{rev.rating}.0점</span>
                            <span className="text-zinc-400 text-[10px] ml-2">• {rev.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id={`btn-del-review-${rev.id}`}
                        onClick={() => deleteUserReview(rev.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                        title="리뷰 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal bg-[#111118] p-3 rounded-xl border border-white/5">
                      {rev.comment}
                    </p>

                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rev.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: SETTINGS & SUPPORT (설정 및 고객지원) */}
      {activeSection === 'settings' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Playback Settings */}
          <div className="rounded-2xl bg-[#171722] border border-white/5 overflow-hidden divide-y divide-white/5">
            <div className="px-4 py-3 bg-[#1D1D28] text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>재생 및 서비스 설정</span>
            </div>

            {/* Video Quality */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-sm font-semibold text-white">기본 시청 화질</div>
                  <div className="text-xs text-zinc-400">네트워크 속도에 맞춘 화질을 선택하세요</div>
                </div>
              </div>
              <select
                value={userProfile.settings.videoQuality}
                onChange={(e) => updateSettings({ videoQuality: e.target.value as any })}
                className="bg-[#121218] border border-white/10 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-500"
              >
                <option value="auto">자동 (Auto)</option>
                <option value="1080p">1080p FHD (VIP 권장)</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD (데이터 절약)</option>
              </select>
            </div>

            {/* Audio Language */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-sm font-semibold text-white">오디오 / 더빙 설정</div>
                  <div className="text-xs text-zinc-400">한국어 더빙 지원작 우선 재생</div>
                </div>
              </div>
              <select
                value={userProfile.settings.audioLanguage}
                onChange={(e) => updateSettings({ audioLanguage: e.target.value as any })}
                className="bg-[#121218] border border-white/10 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-500"
              >
                <option value="ko">한국어 더빙 우선</option>
                <option value="original">원어 오리지널</option>
              </select>
            </div>

            {/* Auto Next */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">다음 화 자동 재생</div>
                <div className="text-xs text-zinc-400">에피소드 종료 시 다음 화를 연속 재생합니다</div>
              </div>
              <button
                onClick={() => updateSettings({ autoPlayNext: !userProfile.settings.autoPlayNext })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  userProfile.settings.autoPlayNext ? 'bg-rose-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    userProfile.settings.autoPlayNext ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Push Notification */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-zinc-400" />
                <div>
                  <div className="text-sm font-semibold text-white">신작 알림 수신</div>
                  <div className="text-xs text-zinc-400">찜한 드라마 신규 회차 업데이트 알림</div>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ notifications: !userProfile.settings.notifications })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  userProfile.settings.notifications ? 'bg-rose-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    userProfile.settings.notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Customer Support & Policies */}
          <div className="rounded-2xl bg-[#171722] border border-white/5 overflow-hidden divide-y divide-white/5">
            <div className="px-4 py-3 bg-[#1D1D28] text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <span>고객센터 & 약관</span>
            </div>

            {/* Clear History */}
            <div
              onClick={clearWatchHistory}
              className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium text-white">시청 기록 전체 초기화</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Terms */}
            <div
              onClick={() => showToast('DramaBox 서비스 이용약관 및 개인정보 처리방침 안내')}
              className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-zinc-400" />
                <span className="text-sm font-medium text-white">서비스 이용약관 및 개인정보 처리방침</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Logout */}
            <div
              id="btn-logout"
              onClick={logout}
              className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-rose-400" />
                <div>
                  <span className="text-sm font-medium text-white">로그아웃</span>
                  {authUser && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">{authUser.email}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Version info */}
            <div className="p-4 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>DramaBox K-Drama Streaming v2.8.0</span>
              </div>
              <span className="text-emerald-400 font-semibold">최신 버전 이용 중</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#181822] rounded-3xl border border-white/10 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditProfileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold text-white">프로필 정보 수정</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">닉네임</label>
                <input
                  type="text"
                  value={editNicknameInput}
                  onChange={(e) => setEditNicknameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">프로필 이미지 URL</label>
                <input
                  type="text"
                  value={editAvatarInput}
                  onChange={(e) => setEditAvatarInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-rose-500 truncate"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Play, Heart, Share2, Star, Lock, Sparkles, ThumbsUp, ThumbsDown, MessageSquarePlus, Film, User, Calendar, ShieldCheck, Check, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Drama, CastMember, UserReview } from '../types';

export const DramaDetailSheet: React.FC = () => {
  const {
    selectedDrama,
    closeDramaDetail,
    playDrama,
    toggleFavorite,
    isFavorite,
    dramas,
    setShareModalDrama,
    setRatingModalDrama,
    unlockEpisode,
    userProfile,
    toggleLikeDrama,
    toggleDislikeDrama,
    isDramaLiked,
    isDramaDisliked,
    addUserReview
  } = useApp();

  const [activeTab, setActiveTab] = useState<'synopsis' | 'episodes' | 'reviews'>('synopsis');
  const [showReviewInput, setShowReviewInput] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>(['사이다 전개', '스토리 탄탄']);

  if (!selectedDrama) return null;

  const isFav = isFavorite(selectedDrama.bookId);
  const isLiked = isDramaLiked(selectedDrama.bookId);
  const isDisliked = isDramaDisliked(selectedDrama.bookId);

  // Filter similar dramas by matching tags
  const similarDramas = dramas
    .filter(d => d.bookId !== selectedDrama.bookId)
    .slice(0, 6);

  const episodes = selectedDrama.episodes || [];

  // Existing reviews
  const existingReviews: UserReview[] = [
    ...(userProfile.userReviews.filter(r => r.bookId === selectedDrama.bookId)),
    ...(selectedDrama.communityReviews || [])
  ];

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addUserReview({
      bookId: selectedDrama.bookId,
      dramaTitle: selectedDrama.bookName,
      dramaCover: selectedDrama.cover,
      rating: reviewRating,
      comment: reviewComment.trim(),
      tags: selectedReviewTags
    });
    setReviewComment('');
    setShowReviewInput(false);
  };

  const toggleReviewTag = (tag: string) => {
    setSelectedReviewTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={closeDramaDetail} />

      {/* Main Drawer Container */}
      <div
        id="modal-drama-detail"
        className="relative w-full max-w-lg sm:max-w-2xl bg-[#131318] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] z-10 overflow-hidden text-zinc-100"
      >
        {/* Top Header with Drag Handle & Close */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/5 bg-[#16161D]">
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto sm:hidden" />
          <span className="hidden sm:inline-block text-xs font-semibold text-zinc-400">드라마 상세 정보</span>
          <button
            id="btn-close-detail-modal"
            onClick={closeDramaDetail}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-5 flex-1 custom-scrollbar">
          {/* Drama Basic Info Banner */}
          <div className="flex items-start gap-4">
            <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10 shadow-xl">
              <img
                src={selectedDrama.cover}
                alt={selectedDrama.bookName}
                className="w-full h-full object-cover"
              />
              {selectedDrama.badge && (
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md">
                  {selectedDrama.badge}
                </span>
              )}
              {selectedDrama.isDubbed && (
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-zinc-950">
                  더빙판
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-white/10">
                  {selectedDrama.ageRating ? `${selectedDrama.ageRating}세` : '15세'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-semibold text-zinc-300 border border-white/10">
                  {selectedDrama.genre}
                </span>
                {selectedDrama.releaseDate && (
                  <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                    <Calendar className="w-3 h-3 text-zinc-500" /> {selectedDrama.releaseDate}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-snug">
                {selectedDrama.bookName}
              </h2>

              <p className="text-xs text-zinc-400">
                조회수 {selectedDrama.hotCode} • 총 {selectedDrama.totalEpisodes}화 완결
              </p>

              {/* Rating & Quick Actions */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  id="btn-open-rating-modal"
                  onClick={() => setActiveTab('reviews')}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 active:scale-95 transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{(selectedDrama.rating ?? 4.8).toFixed(1)}</span>
                  <span className="text-[11px] text-zinc-400">({(selectedDrama.ratingCount || 1200).toLocaleString()} 리뷰 &gt;)</span>
                </button>

                {/* Quick Like / Dislike */}
                <div className="flex items-center gap-1 bg-[#1A1A22] rounded-lg p-0.5 border border-white/5">
                  <button
                    id="btn-detail-like"
                    onClick={() => toggleLikeDrama(selectedDrama.bookId)}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      isLiked
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                    title="좋아요 (추천 반영)"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    <span className="text-[11px]">{isLiked ? '추천됨' : '좋아요'}</span>
                  </button>

                  <button
                    id="btn-detail-dislike"
                    onClick={() => toggleDislikeDrama(selectedDrama.bookId)}
                    className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                      isDisliked
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                    title="싫어요 (추천 제외)"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switcher: 줄거리/정보 vs 회차 vs 평점&리뷰 */}
          <div className="flex border-b border-white/10 gap-6">
            <button
              id="tab-detail-synopsis"
              onClick={() => setActiveTab('synopsis')}
              className={`pb-2.5 text-sm font-semibold transition-all relative ${
                activeTab === 'synopsis'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              줄거리 & 정보
              {activeTab === 'synopsis' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              id="tab-detail-episodes"
              onClick={() => setActiveTab('episodes')}
              className={`pb-2.5 text-sm font-semibold transition-all relative ${
                activeTab === 'episodes'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              회차 ({episodes.length}화)
              {activeTab === 'episodes' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              id="tab-detail-reviews"
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              리뷰 ({existingReviews.length})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-full" />
              )}
            </button>
          </div>

          {/* TAB 1: 줄거리 & 제작/출연 정보 */}
          {activeTab === 'synopsis' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Description Body */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">줄거리 (SYNOPSIS)</h3>
                <p className="text-sm text-zinc-200 leading-relaxed font-normal bg-[#181820] p-3.5 rounded-xl border border-white/5">
                  {selectedDrama.introduction}
                </p>
              </div>

              {/* Tag Chips */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">핵심 키워드</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDrama.tagNames.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#20202A] text-zinc-300 border border-white/5 hover:border-rose-500/30 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cast Members (출연진) */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-rose-400" /> 출연진 (CAST)
                </h3>
                {selectedDrama.cast && selectedDrama.cast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {selectedDrama.cast.map((c: CastMember, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-[#1A1A22] rounded-xl border border-white/5">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{c.characterName} 역</p>
                          <p className="text-[9px] text-rose-400/80 truncate">{c.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 bg-[#1A1A22] p-2.5 rounded-xl">주연: {selectedDrama.protagonist || '공식 캐스팅 정보 준비 중'}</p>
                )}
              </div>

              {/* Production & Director Metadata */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-amber-400" /> 제작 및 스튜디오 정보
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#181820] p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">감독 (Director)</span>
                    <span className="font-semibold text-white">{selectedDrama.director || 'JmBox 메인 연출팀'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">제작사 (Production)</span>
                    <span className="font-semibold text-white">{selectedDrama.production || selectedDrama.author || 'StoryMatrix Studio'}</span>
                  </div>
                  <div className="flex justify-between py-1 sm:border-b-0">
                    <span className="text-zinc-400">방영일 (Release)</span>
                    <span className="font-semibold text-white">{selectedDrama.releaseDate || '2025.10'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">관람 등급</span>
                    <span className="font-semibold text-emerald-400">{selectedDrama.ageRating || '15'}세 이상 관람가</span>
                  </div>
                </div>
              </div>

              {/* Similar Dramas */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">비슷한 추천 콘텐츠</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {similarDramas.map((sim) => (
                    <div
                      key={sim.bookId}
                      onClick={() => playDrama(sim, 1)}
                      className="cursor-pointer group select-none"
                    >
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800 border border-white/5">
                        <img
                          src={sim.cover}
                          alt={sim.bookName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white flex items-center gap-0.5">
                          <Play className="w-2 h-2 fill-white" />
                          <span>{sim.hotCode}</span>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1 mt-1 group-hover:text-rose-400">
                        {sim.bookName}
                      </h4>
                      <p className="text-[10px] text-zinc-400">
                        {sim.tagNames[0] || '드라마'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 회차 (Episodes List) */}
          {activeTab === 'episodes' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                <span>1~5화 무료 감상 • 6화부터 VIP/코인 감상</span>
                {userProfile.isVip && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> VIP 전편 무료
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {episodes.map((ep) => {
                  const isLocked = !ep.isFree && !userProfile.isVip;

                  return (
                    <button
                      id={`btn-episode-${ep.id}`}
                      key={ep.id}
                      onClick={() => {
                        if (isLocked) {
                          const unlocked = unlockEpisode(selectedDrama.bookId, ep.id);
                          if (unlocked) {
                            playDrama(selectedDrama, ep.id);
                          }
                        } else {
                          playDrama(selectedDrama, ep.id);
                        }
                      }}
                      className={`relative py-3 px-2 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all border ${
                        ep.isFree || userProfile.isVip
                          ? 'bg-[#1F1F2A] hover:bg-rose-900/30 border-white/10 text-zinc-100 hover:border-rose-500/50 active:scale-95'
                          : 'bg-[#181820] text-zinc-400 border-white/5 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{ep.id}화</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 font-normal">{ep.duration}</span>

                      {ep.isFree ? (
                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-600 text-white shadow">
                          무료
                        </span>
                      ) : isLocked ? (
                        <span className="absolute top-1 right-1 text-amber-400/80">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <span className="absolute top-1 right-1 text-emerald-400">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: 평점 & 리뷰 (Ratings & Reviews) */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Rating Summary Bar */}
              <div className="p-4 bg-[#181820] rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-white">{(selectedDrama.rating ?? 4.8).toFixed(1)}</span>
                    <div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-[11px] text-zinc-400">총 {(selectedDrama.ratingCount || 1200).toLocaleString()}명 평가</p>
                    </div>
                  </div>
                </div>

                <button
                  id="btn-toggle-review-input"
                  onClick={() => setShowReviewInput(prev => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow hover:opacity-90 active:scale-95 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>리뷰 작성하기</span>
                </button>
              </div>

              {/* Review Input Box (Collapsible) */}
              {showReviewInput && (
                <form onSubmit={handleReviewSubmit} className="p-4 bg-[#1F1F2B] rounded-2xl border border-rose-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">별점 선택</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-1">{reviewRating}점</span>
                    </div>
                  </div>

                  {/* Praise Tags */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-zinc-400">추천 키워드 태그 선택</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['사이다 전개', '스토리 탄탄', '연기력 대박', '더빙 최고', '몰입감 폭발', '꿀잼 보장', '인생작'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleReviewTag(t)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selectedReviewTags.includes(t)
                              ? 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-zinc-800 border-white/5 text-zinc-400'
                          }`}
                        >
                          +{t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Text Area */}
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="이 드라마의 관전 포인트나 솔직한 감상평을 남겨주세요."
                    className="w-full h-20 bg-zinc-900/90 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewInput(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!reviewComment.trim()}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-all"
                    >
                      등록하기
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-2.5">
                {existingReviews.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 text-xs">
                    아직 등록된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!
                  </div>
                ) : (
                  existingReviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-[#181820] rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.userAvatar}
                            alt={rev.userName}
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{rev.userName}</span>
                              {rev.isMine && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                                  내 리뷰
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                              <div className="flex items-center text-amber-400">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-2.5 h-2.5 fill-amber-400" />
                                ))}
                              </div>
                              <span>• {rev.createdAt}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                        {rev.comment}
                      </p>

                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rev.tags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-zinc-300">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="p-4 bg-[#101014] border-t border-white/10 flex items-center gap-3">
          {/* Favorite Button */}
          <button
            id="btn-detail-fav"
            onClick={() => toggleFavorite(selectedDrama.bookId)}
            className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center shrink-0 min-w-[54px] active:scale-95 ${
              isFav
                ? 'bg-rose-600/20 border-rose-500/40 text-rose-500'
                : 'bg-[#1C1C24] border-white/10 text-zinc-400 hover:text-white'
            }`}
            title="관심 목록에 추가/삭제"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            id="btn-detail-share"
            onClick={() => setShareModalDrama(selectedDrama)}
            className="p-3 rounded-2xl bg-[#1C1C24] border border-white/10 text-zinc-400 hover:text-white transition-colors shrink-0 active:scale-95"
            title="공유하기"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Play CTA Button */}
          <button
            id="btn-detail-play"
            onClick={() => playDrama(selectedDrama, 1)}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:opacity-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-[0.98] transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>첫 화부터 바로 감상</span>
          </button>
        </div>
      </div>
    </div>
  );
};

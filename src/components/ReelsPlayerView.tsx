import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ListOrdered,
  Search,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Star,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatTime(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, totalSeconds) : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const ReelsPlayerView: React.FC = () => {
  const {
    activePlayerDrama,
    activeEpisodeIndex,
    nextEpisode,
    prevEpisode,
    nextDrama,
    prevDrama,
    openDramaDetail,
    toggleFavorite,
    isFavorite,
    setShareModalDrama,
    setSearchModalOpen,
    setRatingModalDrama,
    dramas,
    toggleLikeDrama,
    toggleDislikeDrama,
    isDramaLiked,
    isDramaDisliked,
    userProfile,
    isLoading
  } = useApp();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(15);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(90);
  const [showSynopsisExpanded, setShowSynopsisExpanded] = useState<boolean>(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const drama = activePlayerDrama || dramas[0];
  const isFav = drama ? isFavorite(drama.bookId) : false;
  const isLiked = drama ? isDramaLiked(drama.bookId) : false;
  const isDisliked = drama ? isDramaDisliked(drama.bookId) : false;

  const currentEpisode = drama?.episodes?.find(ep => ep.id === activeEpisodeIndex);
  const videoSrc = currentEpisode?.videoSrc;

  // Reset playback position whenever the drama or episode changes
  useEffect(() => {
    setProgress(0);
    setElapsedSeconds(0);
    setDurationSeconds(90);
    setIsPlaying(true);
  }, [drama?.bookId, activeEpisodeIndex]);

  // Keep the real <video> element in sync with our play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    if (isPlaying) {
      video.play().catch(() => {
        // Autoplay with sound can be blocked until a user gesture occurs; ignore.
      });
    } else {
      video.pause();
    }
  }, [isPlaying, videoSrc]);

  // Fallback: simulate progress for episodes without a real stream URL
  // (locked/paid episodes, or dramas not on the live DramaBox catalog)
  useEffect(() => {
    if (videoSrc) return;
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            nextEpisode();
            return 0;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextEpisode, videoSrc]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setElapsedSeconds(video.currentTime);
    setDurationSeconds(video.duration);
    setProgress(Math.min(100, (video.currentTime / video.duration) * 100));
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (diff > 60) {
      nextEpisode();
    } else if (diff < -60) {
      prevEpisode();
    }
    setTouchStartY(null);
  };

  if (!drama) {
    return (
      <div className="w-full h-[calc(100vh-62px)] bg-black flex flex-col items-center justify-center gap-3 text-zinc-400">
        {isLoading ? (
          <>
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-rose-500 rounded-full animate-spin" />
            <p className="text-sm">불러오는 중...</p>
          </>
        ) : (
          <p className="text-sm">표시할 드라마가 없습니다.</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-62px)] bg-black flex items-center justify-center overflow-hidden">
    <div
      id="reels-player-container"
      className={`relative h-full aspect-[9/16] max-w-full bg-black overflow-hidden select-none flex flex-col justify-between text-white ${
        userProfile.isVip ? 'ring-2 ring-inset ring-amber-400/50 shadow-[inset_0_0_40px_rgba(245,158,11,0.15)]' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background: real DramaBox mp4 stream when available, otherwise a still poster */}
      <div
        className="absolute inset-0 z-0 cursor-pointer overflow-hidden"
        onClick={togglePlay}
      >
        {videoSrc ? (
          <video
            key={videoSrc}
            ref={videoRef}
            src={videoSrc}
            poster={drama.cover}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={isMuted}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={nextEpisode}
          />
        ) : (
          <img
            src={drama.cover}
            alt={drama.bookName}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isPlaying ? 'scale-110 blur-[0.2px]' : 'scale-100'
            }`}
          />
        )}

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Center Animated Play/Pause Indicator when tapped */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all">
            <div className="p-5 rounded-full bg-rose-600/80 text-white shadow-2xl animate-scaleUp">
              <Play className="w-10 h-10 fill-white translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Top Header Row */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-3">
        {/* 15+ Age Rating Badge & Info Text (hidden while playing for a clean view) */}
        <div
          className={`flex items-center gap-2 transition-all duration-300 ${
            isPlaying ? 'opacity-0 -translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/90 text-black font-black text-sm flex items-center justify-center shadow-lg border border-amber-300/40">
            {drama.ageRating || '15'}
          </div>
          <span className="text-xs font-bold text-white/90 drop-shadow-md bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {activeEpisodeIndex}화 / {drama.totalEpisodes}화
          </span>

          {/* Premium VIP Playback Badge */}
          {userProfile.isVip && (
            <span
              id="badge-player-premium"
              className="flex items-center gap-1 text-[10px] font-extrabold text-black bg-gradient-to-r from-amber-400 to-yellow-300 px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/30"
            >
              <Crown className="w-3 h-3 fill-black" />
              {userProfile.vipTier} 프리미엄
            </span>
          )}

          {/* Playback Quality Badge */}
          <span className="hidden sm:flex items-center text-[10px] font-bold text-amber-300 bg-black/40 border border-amber-400/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {userProfile.settings.videoQuality === 'auto' ? 'HD' : userProfile.settings.videoQuality.toUpperCase()}
            {videoSrc ? ' · 무제한' : ''}
          </span>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-player-sound"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            id="btn-player-search"
            onClick={(e) => {
              e.stopPropagation();
              setSearchModalOpen(true);
            }}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Floating Actions Column */}
      <div className="absolute right-3.5 bottom-24 z-20 flex flex-col items-center gap-3.5">
        {/* Next / Prev Episode Quick Toggles */}
        <div className="flex flex-col gap-1 bg-black/50 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-lg">
          <button
            id="btn-quick-prev-ep"
            onClick={(e) => {
              e.stopPropagation();
              prevEpisode();
            }}
            className="p-2 text-white/80 hover:text-white active:scale-90 transition-all"
            title="이전 화"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="h-px bg-white/20 mx-1" />
          <button
            id="btn-quick-next-ep"
            onClick={(e) => {
              e.stopPropagation();
              nextEpisode();
            }}
            className="p-2 text-white/80 hover:text-white active:scale-90 transition-all"
            title="다음 화"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Favorite (찜하기) Button */}
        <button
          id="btn-player-fav"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(drama.bookId);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 ${
              isFav
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <Heart className={`w-5 h-5 group-hover:scale-110 ${isFav ? 'fill-white' : ''}`} />
          </div>
          <span
            className={`text-[10px] font-bold text-white drop-shadow-md transition-opacity duration-300 ${
              isPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {isFav ? '찜됨' : '찜하기'}
          </span>
        </button>

        {/* Like (좋아요 / 추천 강화) Button */}
        <button
          id="btn-player-like"
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeDrama(drama.bookId);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 ${
              isLiked
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 group-hover:scale-110 ${isLiked ? 'fill-white' : ''}`} />
          </div>
          <span
            className={`text-[10px] font-bold text-white drop-shadow-md transition-opacity duration-300 ${
              isPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {isLiked ? '추천반영' : '좋아요'}
          </span>
        </button>

        {/* Dislike (싫어요 / 추천 제외) Button */}
        <button
          id="btn-player-dislike"
          onClick={(e) => {
            e.stopPropagation();
            toggleDislikeDrama(drama.bookId);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-75 ${
              isDisliked
                ? 'bg-zinc-700 text-white shadow'
                : 'bg-black/40 text-zinc-400 hover:text-white hover:bg-black/60'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </div>
        </button>

        {/* Share Button */}
        <button
          id="btn-player-share"
          onClick={(e) => {
            e.stopPropagation();
            setShareModalDrama(drama);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all active:scale-75">
            <Share2 className="w-5 h-5 group-hover:scale-110" />
          </div>
          <span
            className={`text-[10px] font-bold text-white drop-shadow-md transition-opacity duration-300 ${
              isPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          >
            공유
          </span>
        </button>

        {/* Episode Selector Sheet Button */}
        <button
          id="btn-player-episodes-sheet"
          onClick={(e) => {
            e.stopPropagation();
            openDramaDetail(drama);
          }}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-all active:scale-75">
            <ListOrdered className="w-5 h-5 group-hover:scale-110" />
          </div>
          <span
            className={`text-[10px] font-bold text-white drop-shadow-md transition-opacity duration-300 ${
              isPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          >
            회차
          </span>
        </button>
      </div>

      {/* Bottom Content Info & Controls */}
      <div className="relative z-10 p-4 pb-2 space-y-2.5">
      <div
        className={`space-y-2.5 max-w-[80%] sm:max-w-[70%] transition-all duration-300 ${
          isPlaying ? 'opacity-0 translate-y-1 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Title with Chevron */}
        <button
          id="btn-player-title-expand"
          onClick={() => openDramaDetail(drama)}
          className="flex items-center gap-1 text-left text-base sm:text-lg font-extrabold text-white hover:text-rose-300 transition-colors drop-shadow-md group"
        >
          <span className="line-clamp-1">{drama.bookName}</span>
          <ChevronRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Tag Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {drama.badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-600 text-white shadow">
              {drama.badge}
            </span>
          )}
          {drama.tagNames?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-zinc-200 backdrop-blur-sm border border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Synopsis Text with '더 보기' */}
        <div className="text-xs text-zinc-200 drop-shadow-md leading-relaxed">
          <span className="font-semibold text-rose-400">{activeEpisodeIndex}화 | </span>
          <span className={showSynopsisExpanded ? '' : 'line-clamp-2'}>
            {drama.introduction}
          </span>
          <button
            id="btn-expand-synopsis"
            onClick={(e) => {
              e.stopPropagation();
              setShowSynopsisExpanded(!showSynopsisExpanded);
            }}
            className="text-zinc-400 font-semibold hover:text-white ml-1 underline"
          >
            {showSynopsisExpanded ? '접기' : '더 보기'}
          </button>
        </div>

        {/* "전체 회차 & 줄거리 보기" Button */}
        <button
          id="btn-view-all-episodes"
          onClick={() => openDramaDetail(drama)}
          className="w-full py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 active:scale-[0.98] backdrop-blur-md text-white text-xs sm:text-sm font-bold text-center border border-white/15 transition-all shadow-lg"
        >
          전체 줄거리 및 회차 보기
        </button>
      </div>

        {/* Video Scrubber & Progress Bar */}
        <div className="pt-2">
          <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
            <span>{formatTime(elapsedSeconds)}</span>
            <span>{formatTime(durationSeconds)}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

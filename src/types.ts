export interface Episode {
  id: number;
  title: string;
  duration: string;
  isFree: boolean;
  coinsRequired: number;
  videoSrc?: string;
  previewImage?: string;
  description?: string;
  chapterId?: string;
}

export interface CastMember {
  name: string;
  role: string;
  characterName: string;
  avatar: string;
}

export interface UserReview {
  id: string;
  bookId: string;
  dramaTitle: string;
  dramaCover: string;
  rating: number;
  comment: string;
  tags?: string[];
  createdAt: string;
  userName: string;
  userAvatar: string;
  likesCount: number;
  isMine?: boolean;
}

export interface Drama {
  bookId: string;
  bookName: string;
  introduction: string;
  author?: string;
  director?: string;
  cast?: CastMember[];
  releaseDate?: string;
  ageRating?: 'ALL' | '12' | '15' | '19';
  production?: string;
  cover: string;
  bannerCover?: string;
  inLibraryCount?: number;
  sort?: number;
  protagonist?: string;
  tagNames: string[];
  hotCode: string;
  markNamesConnectKey?: string;
  inLibrary?: boolean;
  totalEpisodes: number;
  badge?: '인기' | '신작' | '더빙' | '독점' | 'HOT' | '추천';
  rating?: number;
  ratingCount?: number;
  releaseYear?: string;
  genre: string;
  themeCategory?: '데릴사위' | '바보인 척' | '복수' | '인생 역전' | '판타지' | '로맨스' | '현대' | '초자연';
  episodes?: Episode[];
  isDubbed?: boolean;
  isExclusive?: boolean;
  communityReviews?: UserReview[];
}

export interface WatchHistoryItem {
  bookId: string;
  bookName: string;
  cover: string;
  lastWatchedEpisode: number;
  totalEpisodes: number;
  progressPercent: number;
  updatedAt: string;
  genre?: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  memberGrade: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  isVip: boolean;
  vipTier: '일반' | 'VIP' | 'SVIP' | '평생회원';
  vipExpiryDate?: string;
  isLifetime?: boolean;
  coins: number;
  bonusPoints: number;
  couponsCount: number;
  checkedInToday: boolean;
  checkInStreak: number;
  preferredGenres: string[];
  likedDramas: string[]; // bookIds marked with thumbs up
  dislikedDramas: string[]; // bookIds marked with thumbs down
  userReviews: UserReview[];
  settings: {
    videoQuality: 'auto' | '1080p' | '720p' | '480p';
    audioLanguage: 'ko' | 'original';
    autoPlayNext: boolean;
    notifications: boolean;
    dataSaver: boolean;
  };
}

export interface AuthUser {
  email: string;
  nickname: string;
  memberGrade: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  isSuperAdmin?: boolean;
}

export interface AdSlot {
  id: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkLabel: string;
}

export interface RecommendationResult {
  drama: Drama;
  matchScore: number;
  matchReason: string;
  matchedTags: string[];
}

export interface CollectionGroup {
  id: string;
  title: string;
  description?: string;
  theme: 'wine' | 'purple' | 'amber' | 'emerald';
  featuredDrama: Drama;
  items: Drama[];
}

export type MainTabType = 'home' | 'reels' | 'membership' | 'storage' | 'mypage';
export type HomeCategoryType = '추천' | '신작' | '인기 순위' | '분류' | '한국' | '성인';
export type StorageSubTabType = 'history' | 'favorites' | 'downloads';
export type MyPageSubTabType = 'recommendations' | 'favorites' | 'history' | 'reviews' | 'settings';


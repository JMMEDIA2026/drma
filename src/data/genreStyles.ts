import type { ElementType } from 'react';
import {
  Heart, Swords, Laugh, Sparkles, Ghost, Crown, Briefcase, HeartHandshake, Users, Star, Tag,
} from 'lucide-react';
import { Drama } from '../types';

export interface GenreTheme {
  icon: ElementType;
  text: string;
  bg: string;
  border: string;
}

const THEMES = {
  romance: { icon: Heart, text: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  action: { icon: Swords, text: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  comedy: { icon: Laugh, text: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  fantasy: { icon: Sparkles, text: 'text-violet-300', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
  mystery: { icon: Ghost, text: 'text-slate-300', bg: 'bg-slate-500/15', border: 'border-slate-500/30' },
  historical: { icon: Crown, text: 'text-yellow-300', bg: 'bg-yellow-600/15', border: 'border-yellow-600/30' },
  business: { icon: Briefcase, text: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  family: { icon: HeartHandshake, text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  special: { icon: Users, text: 'text-fuchsia-300', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/30' },
  popularity: { icon: Star, text: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  default: { icon: Tag, text: 'text-zinc-300', bg: 'bg-zinc-500/15', border: 'border-zinc-500/30' },
} as const satisfies Record<string, GenreTheme>;

type ThemeKey = keyof typeof THEMES;

// Maps every genre/theme tag the DramaBox catalog uses (Korean, English, and
// other locales) to a visual theme, so genre chips are color/icon-coded for
// quick scanning instead of all looking the same.
const GENRE_THEME_MAP: Record<string, ThemeKey> = {
  '전부의': 'default',
  '계약 연애': 'romance',
  '운명': 'romance',
  'BL': 'special',
  '무협': 'historical',
  '復讐': 'action',
  '사내 연애': 'romance',
  '액션': 'action',
  'Urban': 'business',
  '코미디': 'comedy',
  '가족애': 'family',
  'Secret Identity': 'special',
  'SF& 판타지': 'fantasy',
  '로맨스': 'romance',
  'Second-chance Love': 'romance',
  '선결혼 후연애': 'romance',
  '복수': 'action',
  '차도남': 'business',
  'Super Power': 'fantasy',
  'SM': 'special',
  '순애': 'romance',
  '환생': 'fantasy',
  '인기': 'popularity',
  '여보스': 'business',
  '계약 결혼': 'romance',
  '찐사랑': 'romance',
  '배신': 'action',
  'Strong Female Lead': 'special',
  'Romance': 'romance',
  '미스테리': 'mystery',
  'CEO': 'business',
  '사극 로맨스': 'historical',
  '사이다': 'action',
  '공포&추리': 'mystery',
  '새드 로맨스': 'romance',
  '삼각관계': 'romance',
  '신데렐라': 'romance',
  '역사&전쟁': 'historical',
  '카리스마': 'special',
  'Fantasy': 'fantasy',
  '재벌': 'business',
  '소울메이트': 'romance',
  '반전': 'mystery',
  '시대': 'historical',
  '데릴사위': 'romance',
};

export function getGenreTheme(tag: string): GenreTheme {
  const key = GENRE_THEME_MAP[tag?.trim()] || 'default';
  return THEMES[key];
}

export const GENRE_TAG_LIST = Object.keys(GENRE_THEME_MAP);

export function getDramaYear(drama: Pick<Drama, 'releaseYear' | 'releaseDate'>): string | null {
  if (drama.releaseYear) return drama.releaseYear;
  if (drama.releaseDate) return drama.releaseDate.slice(0, 4);
  return null;
}

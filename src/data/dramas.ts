import { Episode } from '../types';

export function generateEpisodes(count: number, dramaTitle: string): Episode[] {
  const episodes: Episode[] = [];
  for (let i = 1; i <= count; i++) {
    episodes.push({
      id: i,
      title: `${i}화`,
      duration: `01:${String(Math.floor(Math.random() * 30) + 20).padStart(2, '0')}`,
      isFree: i <= 5, // First 5 episodes are free
      coinsRequired: i <= 5 ? 0 : 20,
      description: `${dramaTitle} 제 ${i}화 - 예측할 수 없는 반전과 숨막히는 전개!`,
    });
  }
  return episodes;
}

// Themed bento rows on the '추천' home tab. Each maps to a real live
// DramaBox category id (see src/data/categories.ts) — HomeView fetches
// its dramas from the live API, nothing here is static content.
export const BENTO_COLLECTIONS = [
  { id: 'son-in-law', title: '데릴사위', theme: 'purple' as const, categoryId: 444 },
  { id: 'revenge', title: '복수', theme: 'wine' as const, categoryId: 458 },
];

import { Drama } from '../types';
import { generateEpisodes } from './dramas';

// Transforms raw items from the MovieBox K-drama API into our Drama shape.
// Shared between the client (src/services/api.ts, unused now that the
// '한국' tab goes through api/korea-movies.ts) and that server endpoint,
// so the mapping only lives in one place.
export function transformMovieBoxItems(items: any[]): Drama[] {
  return items.map((item: any): Drama => {
    const genreTags = typeof item.genre === 'string' && item.genre.trim()
      ? item.genre.split(',').map((g: string) => g.trim()).filter(Boolean)
      : ['한국'];
    const viewers = typeof item.viewers === 'number' ? item.viewers : 0;
    const hotCode = viewers >= 1_000_000
      ? `${(viewers / 1_000_000).toFixed(1)}M`
      : viewers >= 1_000
      ? `${(viewers / 1_000).toFixed(1)}K`
      : String(viewers);
    const imdbRating = parseFloat(item.imdbRatingValue) || 7;
    const ageRating: Drama['ageRating'] =
      item.contentRating === 'TV-MA' ? '19' : item.contentRating === 'TV-14' ? '15' : 'ALL';

    return {
      bookId: String(item.subjectId),
      bookName: item.title || '제목 없음',
      introduction: item.description || item.postTitle || '',
      cover: item.cover?.url || '',
      tagNames: genreTags,
      hotCode,
      totalEpisodes: 1,
      rating: Math.min(5, Math.round((imdbRating / 2) * 10) / 10),
      genre: genreTags[0] || '한국',
      ageRating,
      releaseYear: item.releaseDate?.slice(0, 4),
      isExclusive: true,
      episodes: generateEpisodes(1, item.title || '영화'),
    };
  });
}

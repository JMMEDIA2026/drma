import { Drama, Episode } from '../types';
import { INITIAL_DRAMAS, generateEpisodes } from '../data/dramas';

export async function fetchLatestDramas(locale: string = 'ko'): Promise<Drama[]> {
  try {
    const response = await fetch(`/api/proxy/dramabox/home?locale=${encodeURIComponent(locale)}`);
    if (response.ok) {
      const result = await response.json();
      const rawData = result.data || result;
      
      const itemsMap = new Map<string, any>();
      
      if (rawData) {
        if (Array.isArray(rawData.featured)) {
          rawData.featured.forEach((item: any) => {
            const id = item.id || item.bookId;
            if (id) itemsMap.set(id, item);
          });
        }
        if (Array.isArray(rawData.sections)) {
          rawData.sections.forEach((sec: any) => {
            if (Array.isArray(sec.items)) {
              sec.items.forEach((item: any) => {
                const id = item.id || item.bookId;
                if (id) itemsMap.set(id, item);
              });
            }
          });
        }
        if (Array.isArray(rawData)) {
          rawData.forEach((item: any) => {
            const id = item.id || item.bookId;
            if (id) itemsMap.set(id, item);
          });
        }
      }

      const list = Array.from(itemsMap.values());
      if (list.length > 0) {
        return await mergeWithInitialDramas(list);
      }
    }
  } catch (error) {
    console.warn('Could not fetch from Puruboy Home proxy, trying fallback:', error);
  }

  try {
    const response = await fetch(`/api/dramabox/latest?lang=${encodeURIComponent(locale)}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return await mergeWithInitialDramas(result.data);
      }
    }
  } catch (error) {
    console.warn('Could not fetch from server proxy:', error);
  }

  // Fallback to rich curated list
  return INITIAL_DRAMAS;
}

export async function fetchDramaCategories(id?: string, page?: number): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (id) params.append('id', id);
    if (page) params.append('page', String(page));
    const res = await fetch(`/api/proxy/dramabox/category?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch category:', e);
  }
  return null;
}

export async function fetchDramaDetailApi(bookId: string, locale: string = 'ko'): Promise<any> {
  try {
    const res = await fetch(`/api/proxy/dramabox/detail?id=${encodeURIComponent(bookId)}&locale=${encodeURIComponent(locale)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch drama detail:', e);
  }
  return null;
}

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return '01:30';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Fetches the real DramaBox episode list (with direct mp4 video_url for
// unlocked episodes) for a given bookId and maps it onto our Episode shape.
// Returns null if the drama isn't available on the live DramaBox catalog
// (e.g. a curated/mock bookId), so callers can keep the existing fallback data.
export async function fetchRealEpisodes(bookId: string, locale: string = 'ko'): Promise<Episode[] | null> {
  const detail = await fetchDramaDetailApi(bookId, locale);
  if (!detail?.success || !Array.isArray(detail.episodes) || detail.episodes.length === 0) {
    return null;
  }

  return detail.episodes.map((ep: any, index: number): Episode => ({
    id: index + 1,
    title: ep.name || `${index + 1}화`,
    duration: formatDuration(ep.duration),
    isFree: !!ep.unlock,
    coinsRequired: ep.unlock ? 0 : 20,
    videoSrc: ep.video_url || undefined,
    previewImage: ep.cover,
    chapterId: ep.id,
  }));
}

// On-demand lookup of a single episode's stream URL via chapterId.
// Per the DramaBox stream API, only free/unlocked episodes are served.
export async function fetchEpisodeStreamUrl(bookId: string, chapterId: string): Promise<string | null> {
  const result = await fetchDramaStreamApi(bookId, chapterId);
  return result?.success ? result.video_url || null : null;
}

export async function fetchDramaStreamApi(bookId: string, episodeId: number | string): Promise<any> {
  try {
    const res = await fetch(`/api/proxy/dramabox/stream?id=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(episodeId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to fetch stream:', e);
  }
  return null;
}

export async function searchDramasApi(query: string): Promise<any> {
  try {
    const res = await fetch(`/api/proxy/dramabox/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to search dramas:', e);
  }
  return null;
}

export async function searchSoundCloudApi(query: string): Promise<any> {
  try {
    const res = await fetch(`/api/proxy/search/soundcloud?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Failed to search soundcloud:', e);
  }
  return null;
}

// Pool of real DramaBox poster URLs, harvested from the live catalog and
// reused as thumbnails for the curated/mock dramas so the whole app shows
// authentic K-drama artwork instead of generic stock photos.
let realCoverPoolPromise: Promise<string[]> | null = null;

function getRealCoverPool(): Promise<string[]> {
  if (realCoverPoolPromise) return realCoverPoolPromise;

  realCoverPoolPromise = (async () => {
    const covers: string[] = [];
    for (const page of [1, 2, 3]) {
      try {
        const res = await fetch(`/api/proxy/dramabox/category?page=${page}`);
        if (!res.ok) continue;
        const data = await res.json();
        (data.results || []).forEach((item: any) => {
          if (item.cover) covers.push(item.cover);
        });
      } catch (e) {
        console.warn('Failed to fetch real cover pool page', page, e);
      }
    }
    return covers;
  })();

  return realCoverPoolPromise;
}

async function mergeWithInitialDramas(apiList: any[]): Promise<Drama[]> {
  const transformedApiDramas: Drama[] = apiList.map((item, index) => {
    const tags = Array.isArray(item.tagNames) && item.tagNames.length > 0
      ? item.tagNames
      : ['인기', 'K-드라마', '숏폼'];

    const genre = tags[0] ? `${tags[0]} / ${tags[1] || '드라마'}` : '로맨스 / 복수';
    const totalEp = item.totalEpisodes || Math.floor(Math.random() * 30) + 60;

    return {
      bookId: item.bookId || item.id || `api_${index}`,
      bookName: item.bookName || item.title || '제목 없음',
      introduction: item.introduction || item.desc || '최신 인기 숏폼 드라마입니다. 매회 숨가쁜 반전과 스릴 넘치는 전개를 지금 바로 감상해보세요.',
      author: item.author || 'STORYMATRIX',
      cover: item.cover || item.image || INITIAL_DRAMAS[index % INITIAL_DRAMAS.length].cover,
      tagNames: tags,
      hotCode: item.hotCode || `${(Math.random() * 3 + 1).toFixed(1)}M`,
      totalEpisodes: totalEp,
      badge: index === 0 ? '신작' : (index % 2 === 0 ? '인기' : 'HOT'),
      rating: 4.8 + Math.round((Math.random() * 0.2) * 10) / 10,
      ratingCount: Math.floor(Math.random() * 20000) + 5000,
      genre: genre,
      themeCategory: (tags.find(t => ['데릴사위', '바보인 척', '복수', '인생 역전', '판타지', '로맨스', '현대', '초자연'].includes(t)) as any) || '복수',
      isDubbed: (item.bookName || item.title)?.includes('(더빙)') || false,
      isExclusive: true,
      protagonist: item.protagonist || '주인공',
      episodes: generateEpisodes(totalEp, item.bookName || item.title || 'K-드라마')
    };
  });

  const combined = [...transformedApiDramas];
  const mockOnly = INITIAL_DRAMAS.filter(
    initial => !combined.some(d => d.bookId === initial.bookId || d.bookName === initial.bookName)
  );

  const realCovers = await getRealCoverPool();
  mockOnly.forEach((initial, index) => {
    const realCover = realCovers.length > 0 ? realCovers[index % realCovers.length] : null;
    combined.push(realCover ? { ...initial, cover: realCover, bannerCover: realCover } : initial);
  });

  return combined;
}


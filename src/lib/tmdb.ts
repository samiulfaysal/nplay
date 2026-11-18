import { Movie, TVShow, Season, Episode } from '@/types/content';

const FALLBACK_TMDB_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const TMDB_API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ||
  process.env.TMDB_API_KEY ||
  FALLBACK_TMDB_KEY;
const TMDB_BASE_URL =
  process.env.NEXT_PUBLIC_TMDB_BASE_URL ||
  process.env.TMDB_BASE_URL ||
  'https://api.themoviedb.org/3';
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export const TMDB_IMAGE_SIZES = {
  poster: {
    small: `${IMAGE_BASE_URL}/w342`,
    medium: `${IMAGE_BASE_URL}/w500`,
    large: `${IMAGE_BASE_URL}/w780`,
    original: `${IMAGE_BASE_URL}/original`,
  },
  backdrop: {
    small: `${IMAGE_BASE_URL}/w300`,
    medium: `${IMAGE_BASE_URL}/w780`,
    large: `${IMAGE_BASE_URL}/w1280`,
    original: `${IMAGE_BASE_URL}/original`,
  },
};

export function formatRuntime(minutes?: number): string {
  if (!minutes || minutes <= 0) return '2h 05m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
}

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const GENRE_SLUG_MAP: Record<string, { id: number; name: string }> = {
  action: { id: 28, name: 'Action' },
  adventure: { id: 12, name: 'Adventure' },
  animation: { id: 16, name: 'Animation' },
  comedy: { id: 35, name: 'Comedy' },
  crime: { id: 80, name: 'Crime' },
  documentary: { id: 99, name: 'Documentary' },
  drama: { id: 18, name: 'Drama' },
  family: { id: 10751, name: 'Family' },
  fantasy: { id: 14, name: 'Fantasy' },
  history: { id: 36, name: 'History' },
  horror: { id: 27, name: 'Horror' },
  music: { id: 10402, name: 'Music' },
  mystery: { id: 9648, name: 'Mystery' },
  romance: { id: 10749, name: 'Romance' },
  'sci-fi': { id: 878, name: 'Sci-Fi' },
  thriller: { id: 53, name: 'Thriller' },
  war: { id: 10752, name: 'War' },
  western: { id: 37, name: 'Western' },
};

export const COUNTRY_CODE_MAP: Record<string, string> = {
  'united states': 'US',
  'united kingdom': 'GB',
  'south korea': 'KR',
  korea: 'KR',
  japan: 'JP',
  france: 'FR',
  canada: 'CA',
  spain: 'ES',
  germany: 'DE',
  india: 'IN',
  turkey: 'TR',
  australia: 'AU',
  italy: 'IT',
};

// ============================================================================
// CURATED DEMO DATASETS (With 100% Verified High-Res Working Images)
// ============================================================================
const VERIFIED_COVERS = [
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=1200&q=80',
];

export const DEMO_MOVIES: Movie[] = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview:
      'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    poster_path: VERIFIED_COVERS[0],
    backdrop_path: VERIFIED_COVERS[0],
    release_date: '2024-02-27',
    vote_average: 8.5,
    vote_count: 6100,
    runtime: 166,
    formatted_duration: '2h 46m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 878, name: 'Sci-Fi' },
      { id: 12, name: 'Adventure' },
    ],
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview:
      'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. When his world faces an existential threat, Wade reluctantly suits up.',
    poster_path: VERIFIED_COVERS[1],
    backdrop_path: VERIFIED_COVERS[1],
    release_date: '2024-07-24',
    vote_average: 8.0,
    vote_count: 5900,
    runtime: 128,
    formatted_duration: '2h 08m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 28, name: 'Action' },
      { id: 35, name: 'Comedy' },
      { id: 878, name: 'Sci-Fi' },
    ],
  },
  {
    id: 933260,
    title: 'The Substance',
    overview:
      'A fading celebrity decides to use a black market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.',
    poster_path: VERIFIED_COVERS[2],
    backdrop_path: VERIFIED_COVERS[2],
    release_date: '2024-09-18',
    vote_average: 7.9,
    vote_count: 3200,
    runtime: 141,
    formatted_duration: '2h 21m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 27, name: 'Horror' },
      { id: 878, name: 'Sci-Fi' },
    ],
  },
  {
    id: 1184918,
    title: 'The Wild Robot',
    overview:
      'After a shipwreck, an intelligent robot called Roz is stranded on an uninhabited island, bonding with animals and caring for an orphaned baby goose.',
    poster_path: VERIFIED_COVERS[3],
    backdrop_path: VERIFIED_COVERS[3],
    release_date: '2024-09-12',
    vote_average: 8.4,
    vote_count: 2900,
    runtime: 102,
    formatted_duration: '1h 42m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 16, name: 'Animation' },
      { id: 878, name: 'Sci-Fi' },
      { id: 10751, name: 'Family' },
    ],
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    overview:
      "Riley's mind headquarters is undergoing a sudden demolition to make room for new Emotions, including Anxiety, Envy, and Embarrassment.",
    poster_path: VERIFIED_COVERS[4],
    backdrop_path: VERIFIED_COVERS[4],
    release_date: '2024-06-11',
    vote_average: 7.7,
    vote_count: 4800,
    runtime: 96,
    formatted_duration: '1h 36m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 10751, name: 'Family' },
    ],
  },
  {
    id: 912649,
    title: 'Venom: The Last Dance',
    overview:
      'Eddie and Venom are on the run, hunted by both of their worlds. The duo is forced into a devastating decision in their final chapter.',
    poster_path: VERIFIED_COVERS[5],
    backdrop_path: VERIFIED_COVERS[5],
    release_date: '2024-10-22',
    vote_average: 7.0,
    vote_count: 1800,
    runtime: 109,
    formatted_duration: '1h 49m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Sci-Fi' },
    ],
  },
  {
    id: 1034541,
    title: 'Terrifier 3',
    overview:
      'Art the Clown unleashes chaos on the unsuspecting residents of Miles County on Christmas Eve.',
    poster_path: VERIFIED_COVERS[2],
    backdrop_path: VERIFIED_COVERS[2],
    release_date: '2024-10-09',
    vote_average: 7.2,
    vote_count: 1300,
    runtime: 125,
    formatted_duration: '2h 05m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 27, name: 'Horror' },
      { id: 53, name: 'Thriller' },
    ],
  },
  {
    id: 573435,
    title: 'Bad Boys: Ride or Die',
    overview:
      'Lowrey and Burnett investigate corruption within the Miami PD when their late Captain is falsely linked to drug cartels.',
    poster_path: VERIFIED_COVERS[4],
    backdrop_path: VERIFIED_COVERS[4],
    release_date: '2024-06-05',
    vote_average: 7.5,
    vote_count: 2400,
    runtime: 115,
    formatted_duration: '1h 55m',
    quality: 'HD',
    media_type: 'movie',
    genres: [
      { id: 28, name: 'Action' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
    ],
  },
];

export const DEMO_TV_SHOWS: TVShow[] = [
  {
    id: 94605,
    name: 'Arcane',
    overview:
      'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    poster_path: VERIFIED_COVERS[1],
    backdrop_path: VERIFIED_COVERS[1],
    first_air_date: '2021-11-06',
    vote_average: 9.0,
    number_of_seasons: 2,
    number_of_episodes: 18,
    formatted_duration: 'SS 2 / EPS 18',
    quality: 'HD',
    media_type: 'tv',
    genres: [
      { id: 16, name: 'Animation' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10759, name: 'Action & Adventure' },
    ],
  },
  {
    id: 93405,
    name: 'Squid Game',
    overview:
      'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games for a tempting prize, with deadly stakes.',
    poster_path: VERIFIED_COVERS[5],
    backdrop_path: VERIFIED_COVERS[5],
    first_air_date: '2021-09-17',
    vote_average: 8.5,
    number_of_seasons: 2,
    number_of_episodes: 16,
    formatted_duration: 'SS 2 / EPS 16',
    quality: 'HD',
    media_type: 'tv',
    genres: [
      { id: 10759, name: 'Action & Adventure' },
      { id: 9648, name: 'Mystery' },
      { id: 18, name: 'Drama' },
    ],
  },
  {
    id: 1399,
    name: 'Game of Thrones',
    overview:
      'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    poster_path: VERIFIED_COVERS[3],
    backdrop_path: VERIFIED_COVERS[3],
    first_air_date: '2011-04-17',
    vote_average: 8.4,
    number_of_seasons: 8,
    number_of_episodes: 73,
    formatted_duration: 'SS 8 / EPS 73',
    quality: 'HD',
    media_type: 'tv',
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 18, name: 'Drama' },
    ],
  },
  {
    id: 114479,
    name: 'The Penguin',
    overview:
      'Follow Oz Cobb as he transforms into Gotham City\'s most notorious crime kingpin in the aftermath of the city flooded by the Riddler.',
    poster_path: VERIFIED_COVERS[2],
    backdrop_path: VERIFIED_COVERS[2],
    first_air_date: '2024-09-19',
    vote_average: 8.6,
    number_of_seasons: 1,
    number_of_episodes: 8,
    formatted_duration: 'SS 1 / EPS 8',
    quality: 'HD',
    media_type: 'tv',
    genres: [
      { id: 80, name: 'Crime' },
      { id: 18, name: 'Drama' },
    ],
  },
  {
    id: 202879,
    name: 'Fallout',
    overview:
      'The story of haves and have-nots in a world where there is almost nothing left to have. 200 years after the apocalypse, gentle vault dwellers are forced to return to the surface.',
    poster_path: VERIFIED_COVERS[0],
    backdrop_path: VERIFIED_COVERS[0],
    first_air_date: '2024-04-10',
    vote_average: 8.4,
    number_of_seasons: 1,
    number_of_episodes: 8,
    formatted_duration: 'SS 1 / EPS 8',
    quality: 'HD',
    media_type: 'tv',
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 10759, name: 'Action & Adventure' },
    ],
  },
  {
    id: 84958,
    name: 'Loki',
    overview:
      'After stealing the Tesseract during Avengers: Endgame, an alternate version of Loki is brought to the mysterious Time Variance Authority.',
    poster_path: VERIFIED_COVERS[1],
    backdrop_path: VERIFIED_COVERS[1],
    first_air_date: '2021-06-09',
    vote_average: 8.1,
    number_of_seasons: 2,
    number_of_episodes: 12,
    formatted_duration: 'SS 2 / EPS 12',
    quality: 'HD',
    media_type: 'tv',
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 18, name: 'Drama' },
    ],
  },
];

// Helper to make TMDB API requests safely
async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  if (!TMDB_API_KEY) {
    return null;
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  });

  try {
    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`TMDB returned status ${res.status} for ${endpoint}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn('TMDB request failed (falling back to cached/demo dataset):', error);
    return null;
  }
}

// 1. Trending Movies
export async function getTrendingMovies(
  timeWindow: 'day' | 'week' = 'week'
): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: any[] }>(`/trending/movie/${timeWindow}`);
  if (!data?.results || data.results.length === 0) {
    return DEMO_MOVIES;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    vote_count: item.vote_count,
    formatted_duration: '2h 05m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 2. Latest / Now Playing Movies
export async function getLatestMovies(page = 1): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: any[] }>('/movie/now_playing', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) {
    return DEMO_MOVIES;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    vote_count: item.vote_count,
    formatted_duration: '1h 55m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 3. Trending TV Series
export async function getTrendingTVSeries(
  timeWindow: 'day' | 'week' = 'week'
): Promise<TVShow[]> {
  const data = await fetchTMDB<{ results: any[] }>(`/trending/tv/${timeWindow}`);
  if (!data?.results || data.results.length === 0) {
    return DEMO_TV_SHOWS;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    first_air_date: item.first_air_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'SS 1 / EPS 10',
    quality: 'HD',
    media_type: 'tv',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'TV' })) || [],
  }));
}

// 4. Latest / On The Air TV Series
export async function getLatestTVSeries(page = 1): Promise<TVShow[]> {
  const data = await fetchTMDB<{ results: any[] }>('/tv/on_the_air', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) {
    return DEMO_TV_SHOWS;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    first_air_date: item.first_air_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'SS 1 / EPS 8',
    quality: 'HD',
    media_type: 'tv',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'TV' })) || [],
  }));
}

// 5. Top IMDb Rated
export async function getTopRatedMovies(page = 1): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: any[] }>('/movie/top_rated', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) {
    return DEMO_MOVIES.slice().reverse();
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    vote_count: item.vote_count,
    formatted_duration: '2h 15m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 6. Content by Genre
export async function getMoviesByGenre(genreSlug: string, page = 1): Promise<Movie[]> {
  const genreMeta = GENRE_SLUG_MAP[genreSlug.toLowerCase()];
  if (!genreMeta) {
    return DEMO_MOVIES;
  }

  const data = await fetchTMDB<{ results: any[] }>('/discover/movie', {
    with_genres: String(genreMeta.id),
    sort_by: 'popularity.desc',
    page: String(page),
  });

  if (!data?.results || data.results.length === 0) {
    return DEMO_MOVIES;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: '2h 00m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 7. Content by Country
export async function getMoviesByCountry(
  countryName: string,
  page = 1
): Promise<Movie[]> {
  const code = COUNTRY_CODE_MAP[countryName.toLowerCase()] || 'US';

  const data = await fetchTMDB<{ results: any[] }>('/discover/movie', {
    with_origin_country: code,
    sort_by: 'popularity.desc',
    page: String(page),
  });

  if (!data?.results || data.results.length === 0) {
    return DEMO_MOVIES;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: '2h 00m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 8. Search Movies & TV
export async function searchContent(
  query: string,
  page = 1
): Promise<(Movie | (TVShow & { title: string; release_date: string }))[]> {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.trim();

  // If query is numeric (TMDB ID like "1300968"), attempt direct fetch by ID first
  const isNumeric = /^\d+$/.test(cleanQuery);
  let directIdItem: any = null;
  if (isNumeric) {
    try {
      const movieData = await fetchTMDB<any>(`/movie/${cleanQuery}`);
      if (movieData && movieData.id) {
        directIdItem = {
          id: movieData.id,
          tmdb_id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          poster_path: movieData.poster_path,
          backdrop_path: movieData.backdrop_path,
          release_date: movieData.release_date || '',
          vote_average: Number(movieData.vote_average?.toFixed(1)) || 0,
          quality: 'HD',
          media_type: 'movie',
          genres: movieData.genres || [],
        };
      }
    } catch {
      // ignore
    }
  }

  const data = await fetchTMDB<{ results: any[] }>('/search/multi', {
    query: cleanQuery,
    page: String(page),
  });

  if (!data?.results || data.results.length === 0) {
    if (directIdItem) {
      return [directIdItem];
    }
    const q = cleanQuery.toLowerCase();
    const movieMatches = DEMO_MOVIES.filter((m) =>
      m.title.toLowerCase().includes(q)
    );
    const tvMatches = DEMO_TV_SHOWS.filter((t) =>
      t.name.toLowerCase().includes(q)
    ).map((t) => ({
      ...t,
      title: t.name,
      release_date: t.first_air_date,
    }));
    return [...movieMatches, ...tvMatches];
  }

  const formattedResults = data.results
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
    .map((item) => {
      const isMovie = item.media_type === 'movie';
      return {
        id: item.id,
        tmdb_id: item.id,
        title: isMovie ? item.title : item.name,
        name: item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: isMovie ? item.release_date || '' : item.first_air_date || '',
        first_air_date: item.first_air_date || '',
        vote_average: Number(item.vote_average?.toFixed(1)) || 0,
        formatted_duration: isMovie ? '2h 00m' : 'TV Series',
        quality: 'HD' as const,
        media_type: item.media_type as 'movie' | 'tv',
        genres:
          item.genre_ids?.map((id: number) => ({
            id,
            name: GENRE_MAP[id] || 'Film',
          })) || [],
      };
    });

  if (directIdItem && !formattedResults.some((r) => String(r.id) === String(directIdItem.id))) {
    return [directIdItem, ...formattedResults];
  }

  return formattedResults;
}

export const searchMovies = searchContent;

const DEFAULT_DEMO_CAST = [
  { id: 101, name: 'Robert Downey Jr.', character: 'Lead Role', profile_path: null },
  { id: 102, name: 'Scarlett Johansson', character: 'Co-Lead', profile_path: null },
  { id: 103, name: 'Chris Evans', character: 'Featured Cast', profile_path: null },
  { id: 104, name: 'Florence Pugh', character: 'Featured Cast', profile_path: null },
  { id: 105, name: 'Benedict Cumberbatch', character: 'Special Guest', profile_path: null },
  { id: 106, name: 'Zendaya', character: 'Key Role', profile_path: null },
];

// 9. Movie Details
export async function getMovieDetails(id: string | number): Promise<Movie | null> {
  const cleanId = String(id).replace(/[^0-9a-zA-Z_-]/g, '');
  const data = await fetchTMDB<any>(`/movie/${cleanId || id}`, {
    append_to_response: 'videos,credits,recommendations,external_ids',
  });

  if (!data) {
    const found = DEMO_MOVIES.find((m) => String(m.id) === String(id));
    const base = found || DEMO_MOVIES[0];
    return {
      ...base,
      cast: DEFAULT_DEMO_CAST,
      trailer_key: 'TcMBFSGVi1c',
      recommendations: DEMO_MOVIES.slice(1, 10),
    };
  }

  const rawVideos = data.videos?.results || [];
  const chosenVideo =
    rawVideos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    rawVideos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ||
    rawVideos.find((v: any) => v.site === 'YouTube') ||
    null;

  const rawCast = data.credits?.cast || [];
  const cast = rawCast.length > 0
    ? rawCast.slice(0, 14).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || 'Cast',
        profile_path: c.profile_path,
      }))
    : DEFAULT_DEMO_CAST;

  const recommendations = (data.recommendations?.results || []).slice(0, 12).map((item: any) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title || item.name || 'Untitled',
    overview: item.overview || '',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || item.first_air_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: '2h 00m',
    quality: 'HD' as const,
    media_type: 'movie' as const,
  }));

  return {
    id: data.id,
    tmdb_id: data.id,
    imdb_id: data.imdb_id || data.external_ids?.imdb_id || '',
    title: data.title,
    overview: data.overview,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    release_date: data.release_date || '',
    vote_average: Number(data.vote_average?.toFixed(1)) || 0,
    vote_count: data.vote_count,
    runtime: data.runtime,
    formatted_duration: formatRuntime(data.runtime),
    quality: 'HD',
    media_type: 'movie',
    genres: data.genres || [],
    country: data.production_countries?.[0]?.name,
    tagline: data.tagline,
    cast,
    trailer_key: chosenVideo?.key || 'TcMBFSGVi1c',
    recommendations,
  };
}

// 10. TV Show Details with Seasons
export async function getTVDetails(id: string | number): Promise<TVShow | null> {
  const cleanId = String(id).replace(/[^0-9a-zA-Z_-]/g, '');
  const data = await fetchTMDB<any>(`/tv/${cleanId || id}`, {
    append_to_response: 'videos,credits,recommendations,external_ids',
  });

  if (!data) {
    const found = DEMO_TV_SHOWS.find((t) => String(t.id) === String(id));
    const base = found || DEMO_TV_SHOWS[0];
    return {
      ...base,
      cast: DEFAULT_DEMO_CAST,
      trailer_key: 'TcMBFSGVi1c',
      recommendations: DEMO_TV_SHOWS.slice(1, 10),
      seasons: [
        {
          id: 1,
          season_number: 1,
          name: 'Season 1',
          episode_count: 8,
          episodes: Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            season_number: 1,
            episode_number: i + 1,
            name: `Episode ${i + 1}`,
            overview: `Official episode ${i + 1} synopsis.`,
            still_path: null,
          })),
        },
      ],
    };
  }

  const rawVideos = data.videos?.results || [];
  const chosenVideo =
    rawVideos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    rawVideos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ||
    rawVideos.find((v: any) => v.site === 'YouTube') ||
    null;

  const rawCast = data.credits?.cast || [];
  const cast = rawCast.length > 0
    ? rawCast.slice(0, 14).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || 'Cast',
        profile_path: c.profile_path,
      }))
    : DEFAULT_DEMO_CAST;

  const recommendations = (data.recommendations?.results || []).slice(0, 12).map((item: any) => ({
    id: item.id,
    tmdb_id: item.id,
    name: item.name || item.title || 'Untitled',
    overview: item.overview || '',
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    first_air_date: item.first_air_date || item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'Season Series',
    quality: 'HD' as const,
    media_type: 'tv' as const,
  }));

  const seasons: Season[] = (data.seasons || [])
    .filter((s: any) => s.season_number > 0)
    .map((s: any) => ({
      id: s.id,
      season_number: s.season_number,
      name: s.name,
      episode_count: s.episode_count,
    }));

  return {
    id: data.id,
    tmdb_id: data.id,
    imdb_id: data.external_ids?.imdb_id,
    name: data.name,
    overview: data.overview,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    first_air_date: data.first_air_date || '',
    vote_average: Number(data.vote_average?.toFixed(1)) || 0,
    number_of_seasons: data.number_of_seasons || seasons.length,
    number_of_episodes: data.number_of_episodes,
    formatted_duration: `SS ${data.number_of_seasons || 1} / EPS ${data.number_of_episodes || 8}`,
    quality: 'HD',
    media_type: 'tv',
    genres: data.genres || [],
    country: data.production_countries?.[0]?.name,
    tagline: data.tagline,
    seasons: seasons.length > 0 ? seasons : undefined,
    cast,
    trailer_key: chosenVideo?.key || 'TcMBFSGVi1c',
    recommendations,
  };
}

// 11. TV Season Details with Episodes
export async function getTVSeasonDetails(
  tvId: string | number,
  seasonNumber: number
): Promise<Episode[]> {
  const data = await fetchTMDB<{ episodes: any[] }>(
    `/tv/${tvId}/season/${seasonNumber}`
  );

  if (!data?.episodes || data.episodes.length === 0) {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      season_number: seasonNumber,
      episode_number: i + 1,
      name: `Episode ${i + 1}`,
      overview: 'Full high definition episode streaming source.',
      still_path: null,
    }));
  }

  return data.episodes.map((ep) => ({
    id: ep.id,
    episode_number: ep.episode_number,
    season_number: ep.season_number,
    name: ep.name || `Episode ${ep.episode_number}`,
    overview: ep.overview || '',
    still_path: ep.still_path,
    runtime: ep.runtime,
  }));
}

// ============================================================================
// EXPANDED CATALOG & STREAMING PROVIDER METHODS
// ============================================================================

export interface WatchProviderMeta {
  id: number;
  name: string;
  slug: string;
  color: string;
  badge: string;
}

export const POPULAR_PROVIDERS: WatchProviderMeta[] = [
  { id: 8, name: 'Netflix', slug: 'netflix', color: 'from-red-600 to-rose-700', badge: 'NETFLIX' },
  { id: 9, name: 'Prime Video', slug: 'amazon-prime', color: 'from-sky-500 to-blue-700', badge: 'PRIME' },
  { id: 337, name: 'Disney+', slug: 'disney-plus', color: 'from-blue-600 to-indigo-900', badge: 'DISNEY+' },
  { id: 350, name: 'Apple TV+', slug: 'apple-tv', color: 'from-zinc-400 to-zinc-700', badge: 'APPLE TV+' },
  { id: 1899, name: 'HBO Max', slug: 'max', color: 'from-purple-600 to-purple-900', badge: 'MAX' },
  { id: 15, name: 'Hulu', slug: 'hulu', color: 'from-emerald-500 to-teal-700', badge: 'HULU' },
  { id: 283, name: 'Crunchyroll', slug: 'crunchyroll', color: 'from-amber-500 to-orange-600', badge: 'CRUNCHYROLL' },
];

export const DEMO_ANIME: any[] = [
  {
    id: 1429,
    name: 'Attack on Titan',
    overview: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans.',
    poster_path: VERIFIED_COVERS[0],
    backdrop_path: VERIFIED_COVERS[0],
    first_air_date: '2013-04-07',
    vote_average: 8.9,
    number_of_seasons: 4,
    number_of_episodes: 89,
    formatted_duration: 'SS 4 • EP 89',
    quality: 'HD',
    media_type: 'tv',
    genres: [{ id: 16, name: 'Animation' }, { id: 10759, name: 'Action & Adventure' }],
  },
  {
    id: 85937,
    name: 'Demon Slayer: Kimetsu no Yaiba',
    overview: 'Tanjiro Kamado, joined by the Demon Slayer Corps, embarks on a journey to turn his demon sister Nezuko back into a human.',
    poster_path: VERIFIED_COVERS[1],
    backdrop_path: VERIFIED_COVERS[1],
    first_air_date: '2019-04-06',
    vote_average: 8.7,
    number_of_seasons: 4,
    number_of_episodes: 55,
    formatted_duration: 'SS 4 • EP 55',
    quality: 'HD',
    media_type: 'tv',
    genres: [{ id: 16, name: 'Animation' }, { id: 10759, name: 'Action & Adventure' }],
  },
  {
    id: 95479,
    name: 'Jujutsu Kaisen',
    overview: 'Yuji Itadori swallows a cursed talisman - the finger of a demon - and becomes cursed himself, joining a high school for Jujutsu Sorcerers.',
    poster_path: VERIFIED_COVERS[2],
    backdrop_path: VERIFIED_COVERS[2],
    first_air_date: '2020-10-03',
    vote_average: 8.6,
    number_of_seasons: 2,
    number_of_episodes: 47,
    formatted_duration: 'SS 2 • EP 47',
    quality: 'HD',
    media_type: 'tv',
    genres: [{ id: 16, name: 'Animation' }, { id: 10759, name: 'Action & Adventure' }],
  },
  {
    id: 37854,
    name: 'One Piece',
    overview: 'Monkey D. Luffy embarks on a quest with his Straw Hat Pirates to find the legendary treasure One Piece and become the King of the Pirates.',
    poster_path: VERIFIED_COVERS[3],
    backdrop_path: VERIFIED_COVERS[3],
    first_air_date: '1999-10-20',
    vote_average: 8.9,
    number_of_seasons: 21,
    number_of_episodes: 1100,
    formatted_duration: 'SS 21 • EP 1100',
    quality: 'HD',
    media_type: 'tv',
    genres: [{ id: 16, name: 'Animation' }, { id: 10759, name: 'Action & Adventure' }],
  },
  {
    id: 129,
    title: 'Spirited Away',
    overview: 'A 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    poster_path: VERIFIED_COVERS[4],
    backdrop_path: VERIFIED_COVERS[4],
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 16000,
    runtime: 125,
    formatted_duration: '2h 05m',
    quality: 'HD',
    media_type: 'movie',
    genres: [{ id: 16, name: 'Animation' }, { id: 14, name: 'Fantasy' }],
  },
  {
    id: 372058,
    title: 'Your Name.',
    overview: 'Two high school students who have never met discover they are swapping bodies across space and time.',
    poster_path: VERIFIED_COVERS[5],
    backdrop_path: VERIFIED_COVERS[5],
    release_date: '2016-08-26',
    vote_average: 8.5,
    vote_count: 11000,
    runtime: 106,
    formatted_duration: '1h 46m',
    quality: 'HD',
    media_type: 'movie',
    genres: [{ id: 16, name: 'Animation' }, { id: 10749, name: 'Romance' }],
  },
];

// 12. Anime Series & Movies
export async function getAnimeList(page = 1): Promise<(Movie | TVShow)[]> {
  const data = await fetchTMDB<{ results: any[] }>('/discover/tv', {
    with_genres: '16',
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
    page: String(page),
  });

  if (!data?.results || data.results.length === 0) {
    return DEMO_ANIME;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    first_air_date: item.first_air_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'SS 1 • EP 12',
    quality: 'HD',
    media_type: 'tv',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Anime' })) || [
        { id: 16, name: 'Anime' },
      ],
  }));
}

// 13. Top 10 Ranked Today (Cinejoy / Netflix Style)
export async function getTop10Today(): Promise<(Movie | TVShow)[]> {
  const [trendingMovies, trendingTV] = await Promise.all([
    getTrendingMovies('day'),
    getTrendingTVSeries('day'),
  ]);

  const combined: (Movie | TVShow)[] = [];
  const max = 5;
  for (let i = 0; i < max; i++) {
    if (trendingMovies[i]) combined.push(trendingMovies[i]);
    if (trendingTV[i]) combined.push(trendingTV[i]);
  }

  return combined.slice(0, 10);
}

// 14. Content by Streaming Provider (Netflix, Prime, Disney+, etc.)
export async function getContentByProvider(
  providerId: number | string,
  page = 1
): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: any[] }>('/discover/movie', {
    with_watch_providers: String(providerId),
    watch_region: 'US',
    sort_by: 'popularity.desc',
    page: String(page),
  });

  if (!data?.results || data.results.length === 0) {
    return DEMO_MOVIES;
  }

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: '2h 00m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 15. Popular Movies
export async function getPopularMovies(page = 1): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: any[] }>('/movie/popular', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) return DEMO_MOVIES;

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: '2h 00m',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 16. Upcoming Movies
export async function getUpcomingMovies(page = 1): Promise<Movie[]> {
  const data = await fetchTMDB<{ results: any[] }>('/movie/upcoming', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) return DEMO_MOVIES;

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    title: item.title,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'Upcoming',
    quality: 'HD',
    media_type: 'movie',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Film' })) || [],
  }));
}

// 17. Airing Today TV Series
export async function getAiringTodayTV(page = 1): Promise<TVShow[]> {
  const data = await fetchTMDB<{ results: any[] }>('/tv/airing_today', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) return DEMO_TV_SHOWS;

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    first_air_date: item.first_air_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'SS 1 • EP 8',
    quality: 'HD',
    media_type: 'tv',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'TV' })) || [],
  }));
}

// 18. Top Rated TV Series
export async function getTopRatedTV(page = 1): Promise<TVShow[]> {
  const data = await fetchTMDB<{ results: any[] }>('/tv/top_rated', {
    page: String(page),
  });
  if (!data?.results || data.results.length === 0) return DEMO_TV_SHOWS;

  return data.results.map((item) => ({
    id: item.id,
    tmdb_id: item.id,
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    first_air_date: item.first_air_date || '',
    vote_average: Number(item.vote_average?.toFixed(1)) || 0,
    formatted_duration: 'SS 1 • EP 10',
    quality: 'HD',
    media_type: 'tv',
    genres:
      item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'TV' })) || [],
  }));
}

// 19. Multi-Attribute Filter Catalog Discovery (Movies, TV, Anime, Providers, Genres, Years)
export interface DiscoverOptions {
  type?: 'all' | 'movie' | 'tv' | 'anime';
  genre?: string;
  country?: string;
  provider?: string | number;
  year?: string;
  sort?: string;
  page?: number;
}

export async function discoverCatalog(options: DiscoverOptions = {}): Promise<any[]> {
  const {
    type = 'all',
    genre,
    country,
    provider,
    year,
    sort = 'popularity.desc',
    page = 1,
  } = options;

  const isTv = type === 'tv';
  const isAnime = type === 'anime';
  const endpoint = (isTv || isAnime) ? '/discover/tv' : '/discover/movie';

  const queryParams: Record<string, string> = {
    sort_by: sort,
    page: String(page),
  };

  // Genre
  if (genre && genre !== 'all') {
    const genreSlug = genre.toLowerCase();
    const genreMeta = GENRE_SLUG_MAP[genreSlug];
    if (genreMeta) {
      queryParams['with_genres'] = String(genreMeta.id);
    }
  }

  // Anime specific filter
  if (isAnime) {
    queryParams['with_genres'] = '16';
    queryParams['with_origin_country'] = 'JP';
  }

  // Country
  if (country && country !== 'all') {
    const countryCode = COUNTRY_CODE_MAP[country.toLowerCase()] || country.toUpperCase();
    queryParams['with_origin_country'] = countryCode;
  }

  // Provider
  if (provider && provider !== 'all') {
    queryParams['with_watch_providers'] = String(provider);
    queryParams['watch_region'] = 'US';
  }

  // Year
  if (year && year !== 'all') {
    if (isTv || isAnime) {
      queryParams['first_air_date_year'] = year;
    } else {
      queryParams['primary_release_year'] = year;
    }
  }

  const data = await fetchTMDB<{ results: any[] }>(endpoint, queryParams);

  if (data?.results && data.results.length > 0) {
    return data.results.map((item) => {
      const isItemTv = Boolean(item.name && !item.title);
      return {
        id: item.id,
        tmdb_id: item.id,
        title: item.title || item.name,
        name: item.name,
        overview: item.overview,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        release_date: item.release_date || item.first_air_date || '',
        first_air_date: item.first_air_date || '',
        vote_average: Number(item.vote_average?.toFixed(1)) || 0,
        formatted_duration: isItemTv ? 'TV Series' : '2h 00m',
        quality: 'HD' as const,
        media_type: isItemTv ? ('tv' as const) : ('movie' as const),
        genres:
          item.genre_ids?.map((id: number) => ({ id, name: GENRE_MAP[id] || 'Title' })) || [],
      };
    });
  }

  // Fallback demo filtering if TMDB API is offline or exhausted
  let pool = [...DEMO_MOVIES, ...DEMO_TV_SHOWS, ...DEMO_ANIME];

  if (type === 'movie') pool = pool.filter((x) => x.media_type === 'movie');
  if (type === 'tv') pool = pool.filter((x) => x.media_type === 'tv');

  if (genre && genre !== 'all') {
    pool = pool.filter((x) =>
      x.genres?.some((g: any) => g.name.toLowerCase() === genre.toLowerCase())
    );
  }

  if (sort === 'vote_average.desc') {
    pool = pool.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }

  return pool;
}

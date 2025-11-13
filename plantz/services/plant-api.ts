// Plant API service: search plants from RapidAPI house-plants2
// The API key must be provided via an env var: EXPO_PUBLIC_RAPIDAPI_KEY
// Never hard-code secrets in source control.
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://house-plants2.p.rapidapi.com';

export interface PlantSearchResult {
  id?: string; // some APIs may not return id
  common_name?: string;
  scientific_name?: string;
  other_name?: string[];
  watering?: string; // e.g., 'Frequent', 'Average'
  sunlight?: string[]; // e.g., ['Full sun', 'Partial shade']
  care_level?: string;
  description?: string;
  toxicity?: string;
  growth_rate?: string;
  cycle?: string; // e.g., 'Perennial'
  humidity?: string; // often present for some entries
  default_image?: {
    original_url?: string;
    small_url?: string;
    medium_url?: string;
    regular_url?: string;
  };
  [key: string]: any; // allow extra fields
}

export class PlantApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function getHeaders(): HeadersInit {
  const key = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!key) {
    // Provide a descriptive error to help local devs configure env
    console.warn('[Plant API] Missing EXPO_PUBLIC_RAPIDAPI_KEY. Set it in your shell or .env before starting Expo.');
  }
  return {
    'x-rapidapi-host': 'house-plants2.p.rapidapi.com',
    'x-rapidapi-key': String(key ?? ''),
  };
}

export async function searchPlants(query: string): Promise<PlantSearchResult[]> {
  if (!query.trim()) return [];
  const url = `${BASE_URL}/search?query=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    const text = await res.text();
    throw new PlantApiError(`Search failed (${res.status}): ${text}`, res.status);
  }
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data as PlantSearchResult[];
}

// Basic heuristic to map watering guidance to an interval (days)
export function inferWateringIntervalDays(watering?: string): number | undefined {
  if (!watering) return undefined;
  const w = watering.toLowerCase();
  if (w.includes('frequent')) return 2; // every 2 days
  if (w.includes('average') || w.includes('moderate')) return 5;
  if (w.includes('minimal') || w.includes('low')) return 10;
  if (w.includes('weekly')) return 7;
  return undefined;
}

// Fallback image provider using Wikipedia page images (no key required)
export async function fetchFallbackImageFromWikipedia(query: string): Promise<string | undefined> {
  if (!query) return undefined;
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=512&origin=*&titles=${encodeURIComponent(
    query
  )}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return undefined;
    const first = pages[Object.keys(pages)[0]];
    return first?.thumbnail?.source as string | undefined;
  } catch {
    return undefined;
  }
}

const WIKI_CACHE_PREFIX = 'cache:wiki-thumb:';

// Cached version to avoid re-fetching the same fallback thumbnails repeatedly
export async function fetchFallbackImageFromWikipediaCached(query: string): Promise<string | undefined> {
  if (!query) return undefined;
  const key = WIKI_CACHE_PREFIX + query.trim().toLowerCase();
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return cached;
  } catch {}
  const fresh = await fetchFallbackImageFromWikipedia(query);
  if (fresh) {
    try { await AsyncStorage.setItem(key, fresh); } catch {}
  }
  return fresh;
}

// Plant API service: search plants from RapidAPI house-plants2
// The API key must be provided via an env var: EXPO_PUBLIC_RAPIDAPI_KEY
// Never hard-code secrets in source control.

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
  default_image?: { original_url?: string; small_url?: string };
  [key: string]: any; // allow extra fields
}

export class PlantApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function getHeaders(): HeadersInit {
  // NOTE: Key inlined at user request for testing. Remove before committing publicly.
  const key = 'd7ce459cfemshf5f63fb82b614b2p1dcb16jsn675ce7ce534d';
  return {
    'x-rapidapi-host': 'house-plants2.p.rapidapi.com',
    'x-rapidapi-key': key,
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

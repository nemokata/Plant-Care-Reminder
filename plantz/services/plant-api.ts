// Plant API service using Perenual Plant Open API
// See: https://perenual.com/docs/plant-open-api
// Provide your API key via the EXPO_PUBLIC_PERENUAL_KEY environment variable.

const BASE_URL = 'https://perenual.com/api';

export interface PlantSearchResult {
  id?: string;
  common_name?: string;
  scientific_name?: string;
  other_name?: string[];
  watering?: string; // textual watering guidance when available
  sunlight?: string[];
  care_level?: string;
  description?: string;
  toxicity?: string;
  growth_rate?: string;
  cycle?: string;
  humidity?: string;
  default_image?: {
    original_url?: string;
    small_url?: string;
    medium_url?: string;
    regular_url?: string;
    image_url?: string;
  };
  [key: string]: any;
}

export class PlantApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

function getApiKey(): string | undefined {
  // Expo exposes env vars that start with EXPO_PUBLIC_
  // Set EXPO_PUBLIC_PERENUAL_KEY in your environment (do NOT commit keys).
  return (process.env as any).EXPO_PUBLIC_PERENUAL_KEY || (global as any).__PERENUAL_KEY;
}

function buildUrl(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${BASE_URL}/${path}`);
  const key = getApiKey();
  if (key) url.searchParams.set('key', key);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export async function searchPlants(query: string): Promise<PlantSearchResult[]> {
  if (!query || !query.trim()) return [];
  // Perenual docs: species-list endpoint supports q (query) and page/per_page
  const url = buildUrl('species-list', { q: query.trim(), page: 1, per_page: 24 });
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new PlantApiError(`Search failed (${res.status}): ${text}`, res.status);
  }
  const data = await res.json();

  // Perenual returns an object with data array under 'data' or 'species'
  const items: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data?.species) ? data.species : (Array.isArray(data) ? data : []);

  // Map to PlantSearchResult shape expected by the app
  return items.map((it) => {
    const common = it.common_name || (Array.isArray(it.common_names) ? it.common_names[0] : it.common_names) || it.name || it.display_name || undefined;
    const sci = it.scientific_name || undefined;
    console.log('🌿 Perenual search result:', { id: it.id, common_name: it.common_name, common_names: it.common_names, scientific_name: it.scientific_name, mapped_common: common, keys: Object.keys(it).slice(0, 20) });
    const imageUrl = it.default_image?.original_url || it.default_image?.image_url || it.image_url || (it.default_image && (it.default_image.medium_url || it.default_image.small_url));
    const watering = it.watering || it.watering_requirements || it.care?.watering || it.care?.watering_requirements;
    const sunlight = it.sunlight || it.light || it.care?.sunlight || (it.care && it.care.sunlight) || it.sunlight_requirements;
    const family = it.family || it.taxonomy?.family || it.family_common;
    const origin = it.origin || it.distribution || it.native_region;
    const uses = it.use || it.uses || it.human_uses;
    const soil = it.soil || it.soil_type;
    const propagation = it.propagation || it.propagation_methods;

    return {
      id: String(it.id || it.species_id || it.slug || common || sci).slice(0, 50),
      common_name: common,
      scientific_name: sci,
      other_name: it.other_name || it.common_names,
      watering,
      sunlight: Array.isArray(sunlight) ? sunlight : (sunlight ? [String(sunlight)] : undefined),
      care_level: it.care_level || it.care?.difficulty,
      description: it.description || it.summary || it.wikipedia_extracts?.text,
      toxicity: it.toxicity || it.toxicity_level,
      growth_rate: it.growth_rate || it.growth,
      cycle: it.cycle,
      humidity: it.humidity,
      default_image: imageUrl ? { original_url: imageUrl } : undefined,
      family,
      origin,
      uses,
      soil,
      propagation,
      raw: it,
    } as PlantSearchResult;
  });
}

// Fetch detailed species info by id (returns a richer PlantSearchResult)
export async function getPlantById(id: string): Promise<PlantSearchResult | null> {
  if (!id) return null;
  // Try a species endpoint - Perenual exposes species details via query param or path depending on API version
  const tryUrls = [buildUrl('species', { id }), buildUrl('species-info', { id }), buildUrl(`species/${id}`)];
  let lastErr: any = null;
  for (const url of tryUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) { lastErr = new PlantApiError(`Details failed (${res.status})`, res.status); continue; }
      const data = await res.json();
      // data may be wrapped; extract the core object
      const it = Array.isArray(data?.data) ? data.data[0] : (data?.data || data?.species || data?.result || data);
      if (!it) return null;

      const common = it.common_name || it.common_names || (Array.isArray(it.common_names) ? it.common_names[0] : undefined);
      const sci = it.scientific_name || it.scientific_name;
      const imageUrl = it.default_image?.original_url || it.default_image?.image_url || it.image_url || (it.default_image && (it.default_image.medium_url || it.default_image.small_url));
      const watering = it.watering || it.watering_requirements || it.care?.watering || it.care?.watering_requirements;
      const sunlight = it.sunlight || it.light || it.care?.sunlight || it.sunlight_requirements;
      const family = it.family || it.taxonomy?.family || it.family_common;
      const origin = it.origin || it.distribution || it.native_region;
      const uses = it.use || it.uses || it.human_uses;
      const soil = it.soil || it.soil_type;
      const propagation = it.propagation || it.propagation_methods;

      return {
        id: String(it.id || it.species_id || id).slice(0, 50),
        common_name: common,
        scientific_name: sci,
        other_name: it.other_name || it.common_names,
        watering,
        sunlight: Array.isArray(sunlight) ? sunlight : (sunlight ? [String(sunlight)] : undefined),
        care_level: it.care_level || it.care?.difficulty,
        description: it.description || it.summary || it.wikipedia_extracts?.text,
        toxicity: it.toxicity || it.toxicity_level,
        growth_rate: it.growth_rate || it.growth,
        cycle: it.cycle,
        humidity: it.humidity,
        default_image: imageUrl ? { original_url: imageUrl } : undefined,
        family,
        origin,
        uses,
        soil,
        propagation,
        raw: it,
      } as PlantSearchResult;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new PlantApiError('Could not fetch plant details');
}

// try to infer watering interval from textual guidance
export function inferWateringIntervalDays(watering?: string): number | undefined {
  if (!watering) return undefined;
  const w = watering.toLowerCase();
  if (w.includes('daily') || w.includes('frequent')) return 1;
  if (w.includes('every 2') || w.includes('very often')) return 2;
  if (w.includes('weekly') || w.includes('once a week')) return 7;
  if (w.includes('every 2 weeks') || w.includes('fortnight')) return 14;
  if (w.includes('monthly') || w.includes('once a month')) return 30;
  if (w.includes('rare') || w.includes('minimal') || w.includes('low')) return 10;
  // fallback: look for numeric days
  const m = watering.match(/(\d+)\s*(day|days|d)/i);
  if (m) return Number(m[1]);
  return undefined;
}

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


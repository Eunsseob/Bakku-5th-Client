export type PlaceResult = {
  id: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const response = await fetch(`/api/places?query=${encodeURIComponent(query.trim())}`, { signal });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || '장소 검색에 실패했어요.');
  return body.places;
}

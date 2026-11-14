type NaverPlace = {
  title: string;
  address: string;
  roadAddress: string;
  category: string;
  mapx: string;
  mapy: string;
};

function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

export function normalizeNaverPlaces(items: NaverPlace[]) {
  return items.flatMap((item) => {
    const longitude = Number(item.mapx) / 10_000_000;
    const latitude = Number(item.mapy) / 10_000_000;
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < 33 ||
      latitude > 39 ||
      longitude < 124 ||
      longitude > 132
    )
      return [];
    return [
      {
        id: `${item.mapx}-${item.mapy}-${plainText(item.title)}`,
        name: plainText(item.title),
        address: plainText(item.roadAddress || item.address),
        category: plainText(item.category).split('>').filter(Boolean).join(' · '),
        latitude,
        longitude,
      },
    ];
  });
}

export async function findNaverPlaces(query: string) {
  query = query.trim().replace(/\s+/g, ' ');
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return Response.json({ message: '장소 검색 서버 설정이 필요해요.' }, { status: 503 });
  try {
    // Local Search supports only five results and start=1. Expand queries instead of paging.
    const signal = AbortSignal.timeout(10_000);
    const fetchPlaces = async (searchQuery: string) => {
      const params = new URLSearchParams({ query: searchQuery, display: '5', sort: 'random' });
      const response = await fetch(`https://naverapihub.apigw.ntruss.com/search/v1/local?${params}`, {
        headers: { 'X-NCP-APIGW-API-KEY-ID': clientId, 'X-NCP-APIGW-API-KEY': clientSecret },
        signal,
      });
      if (response.status === 401 || response.status === 403)
        throw new Error('네이버 검색 API 인증에 실패했어요. API HUB의 지역 검색 권한과 서버 인증키를 확인해 주세요.');
      if (!response.ok) throw new Error('네이버 장소 검색을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.');
      const body = await response.json();
      return normalizeNaverPlaces(body.items ?? []);
    };
    const places = await fetchPlaces(query);
    const uniquePlaces = new Map(places.map((place) => [place.id, place]));
    const suffixes = ['출구', '지하철역', '버스정류장', '공공기관', '공원', '카페', '편의점', '음식점', '시설'];
    const expandedQueries = [...new Set(suffixes.map((suffix) => `${query} ${suffix}`))];
    // Limit concurrency and stop expanding once enough distinct places have been collected.
    for (let index = 0; index < expandedQueries.length && uniquePlaces.size < 15; index += 3) {
      const batches = await Promise.allSettled(
        expandedQueries.slice(index, index + 3).map(fetchPlaces),
      );
      for (const batch of batches) {
        if (batch.status !== 'fulfilled') continue;
        for (const place of batch.value) {
          if (!uniquePlaces.has(place.id)) uniquePlaces.set(place.id, place);
        }
      }
    }
    const normalize = (text: string) => text.replace(/\s/g, '').toLowerCase();
    const searchText = normalize(query);
    const relevance = (place: (typeof places)[number]) => {
      const name = normalize(place.name);
      if (name === searchText) return 0;
      if (name.startsWith(searchText)) return 1;
      if (name.includes(searchText)) return 2;
      if (normalize(place.address).includes(searchText)) return 3;
      return 4;
    };
    return Response.json({
      places: [...uniquePlaces.values()]
        .sort((a, b) => relevance(a) - relevance(b))
        .slice(0, 30),
    });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error && error.name === 'Error'
        ? error.message
        : '검색 응답이 지연되고 있어요. 다시 시도해 주세요.' },
      { status: 502 },
    );
  }
}

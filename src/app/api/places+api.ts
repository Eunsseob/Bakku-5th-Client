import { findNaverPlaces } from '@/features/home/api/naverPlaces.server';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('query')?.trim();
  if (!query || query.length > 100)
    return Response.json({ message: '검색어를 1~100자로 입력해 주세요.' }, { status: 400 });
  return findNaverPlaces(query);
}

import { apiData } from '@/shared/api/client';

export const homePostsKey = ['home-posts'] as const;

type Category = 'CHARACTER' | 'IDOL' | 'SPORTS' | 'ETC';

export type HomePost = {
  id: number;
  thumbnailUrl: string | null;
  title: string;
  regionName: string;
  nowExchange: boolean;
  nowExchangeEndsAt: string | null;
  wantedItem: string | null;
  createdAt: string;
  isMine?: boolean;
};

export type HomePostsPage = { content: HomePost[]; nextCursor: string | null; hasNext: boolean };

export async function getHomePosts(
  filters: { category?: Category; nowExchange?: boolean; keyword?: string },
  cursor: string | undefined,
  signal: AbortSignal,
) {
  const { keyword, category, nowExchange } = filters;
  const data = await apiData<HomePostsPage>({
    method: 'GET',
    url: keyword ? '/v1/posts/search' : '/v1/posts',
    params: {
      category,
      keyword,
      nowExchange: keyword ? undefined : nowExchange,
      sort: keyword ? 'RELEVANCE' : 'LATEST',
      cursor,
      size: 20,
    },
    signal,
  });
  if (!Array.isArray(data?.content)) throw new Error('교환 글 목록을 확인할 수 없어요.');
  return data;
}

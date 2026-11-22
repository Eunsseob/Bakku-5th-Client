import { initialPosts } from '@/constants/posts';
import { create } from 'zustand';
export type ExchangePost = {
  id: number;
  title: string;
  wanted: string;
  wantedDetail?: string;
  category: string;
  location: string;
  locationDetail?: string;
  locationPoint?: { latitude: number; longitude: number };
  minutes: number;
  distance: number;
  remaining: number;
  photos?: string[];
  tags?: string[];
  condition?: string[];
  quantity?: string;
  description?: string;
  onsite?: boolean;
  author?: { nickname: string; mannerScore: number; completedExchanges: number };
  requestCount?: number;
  viewCount?: number;
  isMine?: boolean;
};

export const useExchangeStore = create<{
  posts: ExchangePost[];
  publishedPostId: number | null;
  dismissPublishedToast: () => void;
  setPosts: (posts: ExchangePost[]) => void;
  addPost: (post: ExchangePost) => void;
  removeOwnPost: (id: number) => void;
}>((set) => ({
  posts: initialPosts,
  publishedPostId: null,
  dismissPublishedToast: () => set({ publishedPostId: null }),
  setPosts: (posts) => set({ posts }),
  removeOwnPost: (id) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== id || !post.isMine),
      publishedPostId: state.publishedPostId === id ? null : state.publishedPostId,
    })),
  addPost: (post) =>
    set((state) => ({
      posts: [post, ...state.posts.filter(({ id }) => id !== post.id)],
      publishedPostId: post.id,
    })),
}));

export { initialPosts } from '@/constants/posts';

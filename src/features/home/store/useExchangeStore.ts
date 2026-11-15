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
  addPost: (post: Omit<ExchangePost, 'id'>) => number;
}>((set) => ({
  posts: initialPosts,
  publishedPostId: null,
  dismissPublishedToast: () => set({ publishedPostId: null }),
  setPosts: (posts) => set({ posts }),
  addPost: (post) => {
    const id = Date.now();
    set((state) => ({ posts: [{ ...post, id }, ...state.posts], publishedPostId: id }));
    return id;
  },
}));

export { initialPosts } from '@/constants/posts';

import { create } from 'zustand';

export const useWriteTagsStore = create<{
  tags: string[];
  setTags: (tags: string[]) => void;
}>((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
}));

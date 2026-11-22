import { create } from 'zustand';

export const useWriteTagsStore = create<{
  tags: string[];
  setTags: (tags: string[]) => void;
  editTags: string[];
  setEditTags: (tags: string[]) => void;
}>((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
  editTags: [],
  setEditTags: (editTags) => set({ editTags }),
}));

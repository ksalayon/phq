import { VMBookmark } from './bookmarks-table.models';

export const sampleBookmarks: VMBookmark[] = Array.from({ length: 100 }, (_, index) => ({
  id: crypto.randomUUID(), // Assigning unique IDs starting from 1
  name: `Sample Bookmark ${index + 1}`,
  url: `https://example.com/bookmark-${index + 1}`,
  createdAt: new Date(
    new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 10) + 1)
  ).toLocaleString(),
  modifiedAt: new Date(
    new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 10) + 11)
  ).toLocaleString(),
  bookmarkGroupId: 'default',
}));

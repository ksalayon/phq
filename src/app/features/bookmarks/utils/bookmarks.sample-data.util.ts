import { Bookmark } from '../models/bookmark';

function getRandomPastDate(daysBack: number): Date {
  const randomDays = Math.floor(Math.random() * daysBack) + 1;
  const randomTimestamp = Date.now() - randomDays * 24 * 60 * 60 * 1000; // Subtract from current date
  return new Date(randomTimestamp); // Convert to Date object
}

export const sampleBookmarks: Bookmark[] = Array.from({ length: 100 }, (_, index) => {
  const createdAt = getRandomPastDate(3); // Random past date
  let modifiedAt = new Date(
    new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 10) + 11)
  );

  // Ensure modifiedAt is not in the future
  if (modifiedAt > new Date()) {
    modifiedAt = new Date(); // Set to the current time if it's in the future
  }

  return {
    id: crypto.randomUUID(),
    name: `Sample Bookmark ${index + 1}`,
    url: `https://example.com/bookmark-${index + 1}`,
    createdAt,
    modifiedAt,
    bookmarkGroupId: 'default',
  };
});

import { Bookmark } from '../models/bookmark';

const defaultNumbers = Object.freeze({
  sampleLength: 100,
  daysBack: 3,
  maxDaysBack: 10,
  minDaysBack: 1,
  hoursInDay: 24,
  minutesInHour: 60,
  secondsInMinute: 60,
  millisecondsInSecond: 1000,
});

function getRandomPastDate(daysBack: number): Date {
  const randomDays = Math.floor(Math.random() * daysBack) + defaultNumbers.minDaysBack;
  const randomTimestamp =
    Date.now() -
    randomDays *
      defaultNumbers.hoursInDay *
      defaultNumbers.minutesInHour *
      defaultNumbers.secondsInMinute *
      defaultNumbers.millisecondsInSecond; // Subtract from current date
  return new Date(randomTimestamp); // Convert to Date object
}

export const sampleBookmarks: Bookmark[] = Array.from(
  { length: defaultNumbers.sampleLength },
  (_, index) => {
    const createdAt = getRandomPastDate(defaultNumbers.daysBack); // Random past date
    // Generate modifiedAt such that it is between createdAt and the current date
    const modifiedAt = new Date(
      createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime())
    );

    return {
      id: crypto.randomUUID(),
      name: `Sample Bookmark ${index + 1}`,
      url: `https://example.com/bookmark-${index + 1}`,
      createdAt,
      modifiedAt,
      bookmarkGroupId: 'default',
    };
  }
);

import { IDBPDatabase } from 'idb';
import { TestBed } from '@angular/core/testing';
import { IndexedDbService } from './indexed-db.service';
import { Bookmark } from '../../models/bookmark';
import { expect } from '@jest/globals';

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mocked-uuid-1234'),
  },
  writable: true,
});

jest.mock('../../utils/bookmarks.sample-data.util', () => {
  return {
    sampleBookmarks: [],
  };
});

// Simplified type for mocked database
type MockIDBPDatabase = {
  transaction: jest.Mock<{
    objectStore: jest.Mock<{
      get: jest.Mock;
      put?: jest.Mock; // Adding put here if it's used at this level
      count: jest.Mock;
      index: jest.Mock<{
        get: jest.Mock;
        openCursor: jest.Mock;
      }>;
    }>;
  }>;
  put: jest.Mock; // The top-level put method
  get: jest.Mock; // The top-level put method
  close?: jest.Mock;
  createObjectStore?: jest.Mock;
  deleteObjectStore?: jest.Mock;
  objectStoreNames?: string[];
};

jest.mock('idb', () => {
  const mockDb: MockIDBPDatabase = {
    put: jest.fn(),
    get: jest.fn(),
    transaction: jest.fn((storeName: string, mode: string = 'readonly') => {
      if (storeName !== 'bookmarks') {
        throw new Error('Invalid store name.');
      }
      return {
        objectStore: jest.fn((name: string) => {
          if (name !== 'bookmarks') {
            throw new Error('Invalid object store name.');
          }
          // Mock for 'get' on the object store
          return {
            get: jest.fn((key: string) => {
              // Simulate a valid bookmark for id === '1', else undefined
              if (key === '1') {
                return Promise.resolve({
                  id: '1',
                  url: 'https://example.com',
                  name: 'Example Bookmark',
                  bookmarkGroupId: 'default',
                  createdAt: new Date(),
                  modifiedAt: new Date(),
                });
              }
              return Promise.resolve(undefined); // Return undefined for unknown IDs
            }),
            count: jest.fn(),
            index: jest.fn(),
          };
        }),
      };
    }),
  };

  return {
    openDB: jest.fn(() => Promise.resolve(mockDb)), // Simulate database opening
  };
});

describe('IndexedDbService', () => {
  let service: IndexedDbService;
  let mockDb: MockIDBPDatabase;

  const sampleBookmark: Bookmark = {
    id: '1',
    url: 'https://example.com',
    name: 'Example Bookmark',
    bookmarkGroupId: 'default',
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndexedDbService],
    });

    service = TestBed.inject(IndexedDbService);

    // Manually assign the mocked database
    mockDb = {
      put: jest.fn().mockResolvedValue(undefined), // Mock the `put` function
      get: jest.fn((key: string) => {
        return new Promise((resolve) => {
          if (key === '1') {
            resolve({
              id: '1',
              url: 'https://example.com',
              name: 'Example Bookmark',
              bookmarkGroupId: 'default',
              createdAt: new Date(),
              modifiedAt: new Date(),
            });
          } else {
            resolve(undefined);
          }
        });
      }),
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          get: jest.fn((key: string) => {
            return new Promise((resolve) => {
              if (key === '1') {
                resolve({
                  id: '1',
                  url: 'https://example.com',
                  name: 'Example Bookmark',
                  bookmarkGroupId: 'default',
                  createdAt: new Date(),
                  modifiedAt: new Date(),
                });
              } else {
                resolve(undefined);
              }
            });
          }),
          count: jest.fn(),
          index: jest.fn().mockReturnValue({
            get: jest.fn(),
            openCursor: jest.fn(),
          }),
        }),
      }),
    };

    service['dbPromise'] = Promise.resolve(mockDb as unknown as IDBPDatabase<unknown>); // Use the mocked db instance with type assertion

    expect(jest.isMockFunction(mockDb.put)).toBeTruthy(); // Verify `put` is mocked
  });

  afterEach(() => {
    // Restore the original implementation of the populateWithSampleData method
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveBookmark', () => {
    it('should save a bookmark if there is no duplicate URL', async () => {
      jest.spyOn(service, 'getBookmarkByUrl').mockResolvedValue(undefined); // Ensure no duplicate exists

      // Debug: Verify `service.dbPromise` resolves correctly
      const dbInstance = await service['dbPromise'];
      // console.log('dbInstance.put is:', dbInstance.put);

      // Call the method
      await service.saveBookmark(sampleBookmark);

      // Validate that `mockDb.put` is called with the correct arguments
      expect(mockDb.put).toHaveBeenCalledWith(
        'bookmarks',
        expect.objectContaining({
          id: '1',
          url: 'https://example.com',
          name: 'Example Bookmark',
          createdAt: expect.any(Date),
          modifiedAt: expect.any(Date),
        })
      );
    });

    it('should throw an error if a bookmark with the same URL exists', async () => {
      jest.spyOn(service, 'getBookmarkByUrl').mockResolvedValue({
        ...sampleBookmark,
        id: '2', // Simulate a different existing bookmark ID
      });

      await expect(service.saveBookmark(sampleBookmark)).rejects.toThrow(
        'A bookmark with the same URL already exists.'
      );

      expect(mockDb.put).not.toHaveBeenCalled();
    });
  });

  describe('getBookmarksCount', () => {
    it('should return the total count of bookmarks', async () => {
      const countMockValue = 5;
      const countMock = jest.fn().mockResolvedValue(countMockValue);
      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          count: countMock,
        }),
      } as any); // Simplified mock return

      const count = await service.getBookmarksCount();

      expect(countMock).toHaveBeenCalled();
      expect(count).toBe(countMockValue);
    });
  });

  describe('getBookmarks', () => {
    it('should return bookmarks in descending order of `createdAt`', async () => {
      const openCursorMock = jest.fn().mockResolvedValueOnce({
        value: sampleBookmark, // Return the sample bookmark
        continue: jest.fn().mockReturnValue(null), // End cursor after the first item
      });

      // Mock the `objectStore` behaviors
      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          indexNames: {
            contains: jest.fn((indexName: string) => indexName === 'createdAt'),
            length: 1,
            [Symbol.iterator]: function* () {
              yield 'createdAt'; // Emulate iterable behavior
            },
          },
          index: jest.fn().mockReturnValue({
            // Mock openCursor to simulate reading bookmarks
            openCursor: openCursorMock,
          }),
        }),
      } as any);

      // Call `getBookmarks` with pagination arguments
      const startIndex = 0; // Start from the first index
      const limit = 10; // Fetch at most 10 bookmarks

      const bookmarks = await service.getBookmarks(startIndex, limit);

      // Assertions
      expect(bookmarks).toEqual([sampleBookmark]);
      expect(openCursorMock).toHaveBeenCalled(); // Check that openCursor was invoked
    });

    it('should throw an error if the `createdAt` index is missing', async () => {
      mockDb.transaction.mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          indexNames: { contains: jest.fn().mockReturnValue(false) }, // Simulate missing index
        }),
      } as any);
      const limit = 10;
      await expect(service.getBookmarks(0, limit)).rejects.toThrow(
        'The `createdAt` index is missing'
      );
    });
  });
});

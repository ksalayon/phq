import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { Bookmark } from '../../models/bookmark';
import { sampleBookmarks } from '../../utils/bookmarks.sample-data.util';
import { DEFAULT_PAGE_SIZE, FIRST_PAGE_INDEX } from '../../models/bookmarks-table.models';

const DB_NAME = 'BookmarksDB';
const DB_VERSION = 7;
const POPULATE_SAMPLE_DATA = true;

/**
 * Service responsible for interacting with an IndexedDB instance for managing bookmarks.
 * It provides functionalities such as saving, retrieving, updating, and deleting bookmarks,
 * with support for features like pagination and indexing.
 */
@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  /**
   * A Promise that resolves to an instance of an IndexedDB database.
   * It provides a structured way to interact with the database using
   * the IDB Database API
   *
   * @type {Promise<IDBPDatabase>}
   */
  private dbPromise: Promise<IDBPDatabase>;
  private latestPageIndex = FIRST_PAGE_INDEX;
  private latestPageSize = DEFAULT_PAGE_SIZE;

  constructor() {
    this.dbPromise = this.initializeDatabase();
    if (POPULATE_SAMPLE_DATA) {
      this.populateWithSampleData().then();
    }
  }

  // Save bookmark
  async saveBookmark(bookmark: Bookmark): Promise<Bookmark> {
    try {
      const db = await this.dbPromise;
      const existingBookmark = await this.getBookmarkByUrl(bookmark.url);
      if (existingBookmark && existingBookmark.id !== bookmark.id) {
        throw Error('A bookmark with the same URL already exists.');
      }
      if (!bookmark.createdAt) {
        bookmark.createdAt = new Date();
      }
      bookmark.modifiedAt = new Date();

      // Only include existingBookmark properties if it is defined
      await db.put('bookmarks', { ...(existingBookmark ?? {}), ...bookmark });
      return bookmark;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save bookmark.');
    }
  }

  // Get all bookmarks
  async getBookmarksCount(): Promise<number> {
    const db = await this.dbPromise;
    const transaction = db.transaction('bookmarks', 'readonly');
    const store = transaction.objectStore('bookmarks');
    // Get total count of all records
    return await store.count();
  }

  // Get bookmarks count by search term
  // Need to have a separate call for this so it can be called after the actual
  // search results more efficiently and so it wouldn't block
  // the response from the actual search
  async getBookmarksSearchCount(urlQuery: string): Promise<number> {
    const db = await this.dbPromise;
    const transaction = db.transaction('bookmarks', 'readonly');
    const store = transaction.objectStore('bookmarks');
    const index = store.index('url');
    // Create an empty array to store matching results

    // Iterate over all entries in the store
    // let cursor = await store.openCursor();
    let cursor = await index.openCursor(null, 'prev');
    let currentIndex = 0;
    let totalCount = 0;
    while (cursor) {
      const bookmark = cursor.value as Bookmark;
      if (bookmark.url.toLowerCase().includes(urlQuery.toLowerCase())) {
        totalCount++;
      }
      cursor = await cursor.continue(); // move to the next record
      currentIndex++;
    }
    console.log('search total count', totalCount);
    return totalCount;
  }

  /**
   * Retrieves a list of bookmarks from the database, ordered by the `createdAt` index in descending order.
   * This method supports pagination by specifying the `startIndex` and `limit` parameters.
   *
   * @param {number} startIndex - The starting index of the bookmarks to retrieve.
   *                              Items before this index will be skipped.
   * @param {number} limit - The maximum number of bookmarks to retrieve.
   * @return {Promise<Bookmark[]>} A promise that resolves to an array of bookmarks.
   *                                The array will contain at most `limit` bookmarks.
   *                                The bookmarks are returned in descending order of `createdAt`.
   */
  async getBookmarks(startIndex: number, limit: number): Promise<Bookmark[]> {
    this.latestPageIndex = startIndex;
    this.latestPageSize = limit;
    const db = await this.dbPromise;
    const transaction = db.transaction('bookmarks', 'readonly');
    const store = transaction.objectStore('bookmarks');
    // Ensure the `createdAt` index exists and is referenced
    if (!store.indexNames.contains('createdAt')) {
      throw Error('The `createdAt` index is missing');
    }
    // Use the createdAt index to ensure that we are fetching bookmarks in the correct order
    // and so that the indexes are in sync with NgRx especially when we are adding new items
    const index = store.index('createdAt');

    const bookmarks: Bookmark[] = [];
    let cursor = await index.openCursor(null, 'prev'); // 'prev' ensures descending order

    // Skip the initial items to handle pagination
    let currentIndex = 0;

    while (cursor && bookmarks.length < limit) {
      if (currentIndex >= startIndex) {
        bookmarks.push(cursor.value as Bookmark);
      }
      cursor = await cursor.continue();
      currentIndex++;
    }
    return bookmarks;
  }

  // Get bookmark by ID
  async getBookmarkById(id: string): Promise<Bookmark | undefined> {
    try {
      const db = await this.dbPromise;
      return await db.get('bookmarks', id);
    } catch {
      throw Error('Failed to get bookmark.');
    }
  }

  // get bookmark by URL
  async getBookmarkByUrl(url: string): Promise<Bookmark | undefined> {
    try {
      const db = await this.dbPromise;
      return await db.getFromIndex('bookmarks', 'url', url); // `getFromIndex` allows querying by an index
    } catch (error) {
      throw Error('Failed to get bookmark by URL.');
    }
  }

  // Delete bookmark
  async deleteBookmark(id: Bookmark['id']): Promise<Bookmark['id']> {
    try {
      const db = await this.dbPromise;
      await db.delete('bookmarks', id);
      return id;
    } catch {
      throw Error('Failed to delete bookmark.');
    }
  }

  async searchBookmarksByUrl(
    urlQuery: string,
    startIndex: number,
    limit: number
  ): Promise<Bookmark[]> {
    console.log('searchBookmarksByUrl', urlQuery);
    console.log('searchBookmarksByUrl startIndex', startIndex);
    console.log('searchBookmarksByUrl limit', limit);
    const db = await this.dbPromise;
    const transaction = db.transaction('bookmarks', 'readonly');
    const store = transaction.objectStore('bookmarks');
    const index = store.index('url');
    // Create an empty array to store matching results
    // Iterate over all entries in the store
    // let cursor = await store.openCursor();
    // let cursor = await index.openCursor(null, 'prev');
    // let currentIndex = 0;
    // while (cursor && results.length < limit) {
    //   const bookmark = cursor.value as Bookmark;
    //   if (
    //     bookmark.url.toLowerCase().includes(urlQuery.toLowerCase()) &&
    //     currentIndex >= startIndex
    //   ) {
    //     results.push(bookmark);
    //   }
    //   cursor = await cursor.continue(); // move to the next record
    //   currentIndex++;
    // }

    const results: Bookmark[] = [];
    let cursor = await index.openCursor(null, 'prev'); // 'prev' ensures descending order

    // Skip the initial items to handle pagination
    let currentIndex = 0;

    while (cursor && results.length < limit) {
      if (currentIndex >= startIndex) {
        const bookmarkAtCursor = cursor.value as Bookmark;
        if (bookmarkAtCursor.url.toLowerCase().includes(urlQuery.toLowerCase())) {
          results.push(cursor.value as Bookmark);
        }
      }
      cursor = await cursor.continue();
      currentIndex++;
    }
    console.log('searchBookmarksByUrl', results);
    return results;
  }

  // Initialize the IndexedDB database
  private async initializeDatabase(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
      // Increment version
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          // Create the bookmarks object store
          const store = db.createObjectStore('bookmarks', { keyPath: 'id' });

          // Add the `url` index with uniqueness
          store.createIndex('url', 'url', { unique: true });

          // Add the `createdAt` index
          store.createIndex('createdAt', 'createdAt');
        }
        // For upgrading older versions, ensure any missing index is added
        if (oldVersion < DB_VERSION) {
          const store = transaction.objectStore('bookmarks');

          // Add the `url` index if it doesn't already exist
          if (!store.indexNames.contains('url')) {
            store.createIndex('url', 'url', { unique: true });
          }

          // Add the `createdAt` index if it doesn't already exist
          if (!store.indexNames.contains('createdAt')) {
            store.createIndex('createdAt', 'createdAt');
          }
        }
      },
    });
  }

  // Populate the database with sample data if empty
  private async populateWithSampleData(): Promise<void> {
    const db = await this.dbPromise;

    // Check if the database is empty
    const existingBookmarks = await db.getAll('bookmarks');
    // only populate 'IndexedDB if it does not already contain bookmarks.'
    if (existingBookmarks.length === 0) {
      const transaction = db.transaction('bookmarks', 'readwrite');
      const store = transaction.objectStore('bookmarks');

      // Add all sample bookmarks to the database
      for (const bookmark of sampleBookmarks) {
        await store.put(bookmark);
      }

      await transaction.done;
    }
  }
}

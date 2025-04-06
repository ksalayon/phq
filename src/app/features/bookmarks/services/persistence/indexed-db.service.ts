import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { Bookmark } from '../../models/bookmark';
import { sampleBookmarks } from '../../utils/bookmarks.sample-data.util';

const DB_NAME = 'BookmarksDB';
const DB_VERSION = 3;

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

  constructor() {
    this.dbPromise = this.initializeDatabase();
    this.populateWithSampleData().then();
  }

  // Save bookmark
  async saveBookmark(bookmark: Bookmark): Promise<Bookmark> {
    try {
      const db = await this.dbPromise;
      const existingBookmark = await this.getBookmarkByUrl(bookmark.url);
      if (existingBookmark && existingBookmark.id !== bookmark.id) {
        throw Error('A bookmark with the same URL already exists.');
      }
      await db.put('bookmarks', { ...existingBookmark, ...bookmark });
      return bookmark;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save bookmark.');
    }
  }

  // Get all bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const db = await this.dbPromise;
      return await db.getAll('bookmarks');
    } catch {
      throw Error('Failed to get bookmarks.');
    }
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

  // Initialize the IndexedDB database
  private async initializeDatabase(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
      // Increment version
      upgrade(db) {
        if (!db.objectStoreNames.contains('bookmarks')) {
          const store = db.createObjectStore('bookmarks', { keyPath: 'id' });
          store.createIndex('url', 'url', { unique: true }); // Create `url` index
        } else {
          const store = db.transaction('bookmarks', 'versionchange').objectStore('bookmarks');
          if (!store.indexNames.contains('url')) {
            store.createIndex('url', 'url', { unique: true });
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

import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { Bookmark } from '../../models/bookmark';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initializeDatabase();
  }

  // Initialize the IndexedDB database
  private async initializeDatabase(): Promise<IDBPDatabase> {
    return openDB('BookmarksDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('bookmarks')) {
          db.createObjectStore('bookmarks', { keyPath: 'id' });
        }
      },
    });
  }

  // Save bookmark
  async saveBookmark(bookmark: Bookmark) {
    try {
      const db = await this.dbPromise;
      await db.put('bookmarks', bookmark);
      return bookmark;
    } catch {
      throw Error('Failed to save bookmark.');
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
}

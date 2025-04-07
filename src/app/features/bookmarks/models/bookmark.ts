// Type alias for model id's for better readability
type BookmarkId = string;
type BookmarkUrl = string;
type BookmarkGroupId = string;
type BookmarkGroupName = string;
type BookmarkName = string;

export interface BookmarkGroup {
  id: BookmarkGroupId; // unique id for the group
  name: BookmarkGroupName; // name of the group
}

export const defaultBookmarkGroup = {
  id: 'default' as BookmarkGroupId,
  name: 'Default' as BookmarkGroupName,
};

/**
 * Represents a bookmark entry.
 *
 * This interface defines the structure for a bookmark, including its unique identifier,
 * name, URL, associated group, and timestamps for creation and modification.
 */
export interface Bookmark {
  id: BookmarkId; // unique bookmark id
  name: BookmarkName;
  url: BookmarkUrl; // the bookmark url
  bookmarkGroupId: BookmarkGroupId;
  createdAt: Date; // creation timestamp
  modifiedAt?: Date; // modification timestamp
}

/**
 * Represents the payload required to update a bookmark.
 */
export type UpdateBookmarkPayload = Pick<Bookmark, 'url' | 'id' | 'name'>;
/**
 * Represents the payload required to create a bookmark.
 * This type extracts specific properties from the `Bookmark` type,
 * specifically the `url` and `name` fields
 */
export type CreateBookmarkPayload = Pick<Bookmark, 'url' | 'name'>;

export interface CurrentPageState {
  pageIndex: number;
  pageSize: number;
}

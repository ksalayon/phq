// Type alias for model id's for better readability
type BookmarkId = string;
type BookmarkUrl = string;
type BookmarkGroupId = string;
type BookmarkGroupName = string;

export interface BookmarkGroup {
  id: BookmarkGroupId; // unique id for the group
  name: BookmarkGroupName; // name of the group
}

export const defaultBookmarkGroup = {
  id: 'default' as BookmarkGroupId,
  name: 'Default' as BookmarkGroupName,
};

export interface Bookmark {
  id: BookmarkId; // unique bookmark id
  url: BookmarkUrl; // the bookmark url
  bookmarkGroupId: BookmarkGroupId;
  createdAt: Date; // creation timestamp
  modifiedAt: Date; // modification timestamp
}

export type UpdateBookmarkPayload = Pick<Bookmark, 'url' | 'id'>;
export type CreateBookmarkPayload = Pick<Bookmark, 'url'>;

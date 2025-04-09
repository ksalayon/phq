# 📙 Bookmark App

A modern, feature-rich web application for managing bookmarks. Built with **Angular**, **NgRx**, and **IndexedDB**, this app provides offline capabilities, a responsive UI, and robust state management.

---

## 🚀 Overview

The **Bookmark App** is a scalable and modular web application designed to manage bookmarks with features like pagination, search, and offline support. It leverages:

- **Angular** for the front-end framework  
- **NgRx** for reactive state management  
- **Angular Material** for modern UI components  
- **IndexedDB** as a local data store

---

## 🧹 Key Components

### 🔧 Frontend

- **Framework:** Angular (v19.2.0)  
- **UI Components:** Angular Material  
- **State Management:** NgRx (Entity Adapter + Store)

### 💄 Backend (Placeholder)

- **Data Store:** IndexedDB  
- No backend integration currently; IndexedDB simulates persistent storage.

### 🧪 Tooling

- **Testing:** Jest, Angular Testing Utilities  
- **Linting & Formatting:** ESLint, Prettier (Google Style Guide)  
- **Utilities:**  
  - `rxjs` for reactive streams  
  - `uuid` for generating unique IDs  
  - `idb` package for IndexedDB interactions

---

## 🏗️ Application Architecture

### 📦 State Management

- **NgRx Store** handles application state via actions, reducers, and selectors.
- **BookmarkDataService** abstracts CRUD and query logic, powered by `IndexedDbService`.
- **BookmarkStateService** encapsulates the NgRx store logic for managing state related to bookmark operations and UI feedback.
- **IndexedDbService** interfaces with IndexedDB using the `idb` package.

---

## 💽 UI Components

### 📄 `BookmarksTableComponent`

- Displays paginated, sortable bookmarks with `MatTable` and `MatPaginator`
- Supports edit, delete, view, and pagination events
- Uses observables (`bookmarks$`, `totalCount`) for data binding

### 📂 `BookmarksPageComponent`

- Acts as the main container
- Composes:
  - `SearchFormComponent`
  - `BookmarksTableComponent`
  - `BookmarkFormComponent`
- Emits actions for CRUD, pagination, and search via NgRx

### 🔍 `SearchFormComponent` (Beta)

- Handles text-based search input with validations (min length: 3)
- Emits search and clear events

---

## 🌟 Key Features

### 📄 Scalable Pagination

- **Chunked Data Loading**  
  Uses `limit` and `startIndex` to fetch data in chunks via `getBookmarksPaginated`.

- **IndexedDB Indexing**  
  - Bookmarks indexed by `id` and searchable fields like `url`  
  - Fast lookup using `searchBookmarksByUrl` and `getBookmarkSearchResultCount`

- **Paginator Integration**  
  - Uses `MatPaginator` for UI  
  - Centralized pagination state via NgRx

### 🔍 Search & Filtering

- Debounced search using RxJS (`searchTerm$`, `debounceTime`)
- Updates central state and resets `pageIndex` for fresh results

### 🧰 Custom Directives

- `OverflowTooltipDirective`: Adds tooltips only when content is clipped in table cells

### 💾 State Persistence

- NgRx actions like `saveCurrentPageState` preserve pagination settings across navigation

### 🔗 Deep Linking

Supports query parameters like:

```
?pageIndex=2&pageSize=5
```

Example:  
`http://angular-bookmarks-app-2025.s3-website-ap-southeast-2.amazonaws.com/?pageIndex=2&pageSize=5`

---

## ⚠️ Challenges & Limitations

### Paginator Sync Issue

When the search input is cleared, the paginator may retain an old state, leading to mismatched data. This is handled by:

- Explicitly resetting `pageIndex` to `FIRST_PAGE_INDEX` during a new search or clear event

---

## ✅ Conclusion

This project demonstrates a clean, scalable, and offline-capable Angular architecture using modern web tools. It serves as a solid foundation for future enhancements and backend integrations.

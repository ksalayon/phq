import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main/main-layout/main-layout.component';
import { BookmarkService } from './features/bookmarks/services/bookmark.service';
import { provideState } from '@ngrx/store';
import {
  bookmarksFeatureKey,
  bookmarksReducer,
} from './features/bookmarks/state/bookmarks.reducer';
import { provideEffects } from '@ngrx/effects';
import { BookmarksEffects } from './features/bookmarks/state/bookmarks.effects';
import { BookmarksResolver } from './features/bookmarks/bookmarks.resolver';
import { BookmarkStateService } from './features/bookmarks/services/bookmark-state.service';
import { IndexedDbService } from './features/bookmarks/services/persistence/indexed-db.service';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // <- Shell Component
    // Declaring shared providers at the closest common ancestor route since the /bookmarks and bookmarks/details/:id
    // are siblings  (based on design spec) and will need to share the providers below
    // to avoid duplicated instances
    providers: [
      IndexedDbService,
      BookmarkService,
      BookmarkStateService,
      provideState({ name: bookmarksFeatureKey, reducer: bookmarksReducer }),
      provideEffects([BookmarksEffects]),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'bookmarks', // Route to the overview page
        loadComponent: () =>
          import('./features/bookmarks/pages/bookmarks-page/bookmarks-page.component').then(
            (m) => m.BookmarksPageComponent
          ),
        resolve: {
          bookmarksInitialized: BookmarksResolver, // Makes sure that the bookmarks store is ready before loading the route
        },
      },
      {
        path: 'bookmarks/details/:id', // route to the bookmark details page
        loadComponent: () =>
          import('./features/bookmarks/pages/bookmark-details/bookmark-details.component').then(
            (m) => m.BookmarkDetailsComponent
          ),
        resolve: {
          bookmarksInitialized: BookmarksResolver, // Makes sure that the bookmarks store is ready before loading the route
        },
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

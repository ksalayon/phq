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

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, // <- your shell
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'bookmarks',
        loadComponent: () =>
          import('./features/bookmarks/pages/bookmarks-page/bookmarks-page.component').then(
            (m) => m.BookmarksPageComponent
          ),
        providers: [
          BookmarkService,
          provideState({ name: bookmarksFeatureKey, reducer: bookmarksReducer }),
          provideEffects([BookmarksEffects]),
        ],
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

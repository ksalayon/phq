import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main/main-layout/main-layout.component';
import { BookmarkService } from './features/bookmarks/services/bookmark.service';
import { provideState } from '@ngrx/store';
import { bookmarksFeature } from './features/bookmarks/state/bookmarks.reducer';
import { BookmarksEffects } from './features/bookmarks/state/bookmarks.effects';
import { provideEffects } from '@ngrx/effects';

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
          provideState(bookmarksFeature),
          provideEffects(BookmarksEffects),
          BookmarkService,
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

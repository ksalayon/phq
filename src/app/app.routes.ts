import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main/main-layout/main-layout.component';

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
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

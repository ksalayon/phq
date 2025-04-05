import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderNavItem } from '../../header/models/HeaderComponentModels';

@Component({
  selector: 'phq-main-layout',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  navLinks: HeaderNavItem[] = [
    { path: '', label: 'Home' },
    { path: '/bookmarks', label: 'Bookmarks' },
  ];
}

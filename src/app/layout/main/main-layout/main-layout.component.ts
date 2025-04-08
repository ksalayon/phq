import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderNavItem } from '../../header/models/HeaderComponentModels';

/**
 * MainLayoutComponent serves as the primary layout component for the application.
 * It provides a consistent structure by organizing and displaying the header,
 * footer, and router outlet for dynamic content rendering.
 *
 * It includes the following imported components:
 * - HeaderComponent: Displays the application's navigation and branding.
 * - RouterOutlet: Acts as a placeholder for routing and dynamically renders
 *   components based on the current route.
 * - FooterComponent: Displays the application's footer content.
 */
@Component({
  selector: 'phq-main-layout',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  // defines the navigation links used for primary navigation in the header.
  navLinks: HeaderNavItem[] = [{ path: '', label: 'Overview' }];
}

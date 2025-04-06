import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Represents a reusable footer component for the application.
 * This component is responsible for displaying footer content,
 * acting as a container for footer-specific information or controls.
 *
 */
@Component({
  selector: 'phq-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}

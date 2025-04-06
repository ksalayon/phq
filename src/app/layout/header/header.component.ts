import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { NgForOf } from '@angular/common';
import { HeaderNavItem } from './models/HeaderComponentModels';
import { MatDivider } from '@angular/material/divider';

/**
 * HeaderComponent is a reusable Angular component that represents a header section
 * of the application, containing navigation links and other UI elements.
 */
@Component({
  selector: 'phq-header',
  imports: [MatToolbar, RouterLink, NgForOf, MatDivider],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  // An array of navigation link items of type `HeaderNavItem`,
  // representing links to be displayed in the header.
  @Input() navLinks: HeaderNavItem[] = [];
}

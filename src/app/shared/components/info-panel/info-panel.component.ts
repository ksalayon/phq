import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'phq-info-panel',
  imports: [],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPanelComponent {}

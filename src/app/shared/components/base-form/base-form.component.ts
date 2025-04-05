import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'phq-base-form',
  imports: [],
  templateUrl: './base-form.component.html',
  styleUrl: './base-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseFormComponent {}

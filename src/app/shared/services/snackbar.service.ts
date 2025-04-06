// src/app/core/services/snackbar.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DEFAULT_DURATION = 3000;

@Injectable()
export class SnackbarService {
  private defaultDuration = DEFAULT_DURATION;

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = this.defaultDuration): void {
    this.openSnackBar(message, 'success-snackbar', duration);
  }

  error(message: string, duration: number = this.defaultDuration): void {
    this.openSnackBar(message, 'error-snackbar', duration);
  }

  info(message: string, duration: number = this.defaultDuration): void {
    this.openSnackBar(message, 'info-snackbar', duration);
  }

  private openSnackBar(message: string, panelClass: string, duration: number): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}

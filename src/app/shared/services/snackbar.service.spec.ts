import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  let matSnackBarSpy: jest.Mocked<MatSnackBar>;

  beforeEach(() => {
    matSnackBarSpy = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [SnackbarService, { provide: MatSnackBar, useValue: matSnackBarSpy }],
    });

    service = TestBed.inject(SnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should call openSnackBar with correct arguments for success', () => {
      const message = 'Success message';
      const duration = 5000;

      service.success(message, duration);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, 'Close', {
        duration,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });
    });

    it('should use default duration if no duration is provided for success', () => {
      const message = 'Default duration message';

      service.success(message);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, 'Close', {
        duration: 3000, // Default duration
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });
    });
  });

  describe('error', () => {
    it('should call openSnackBar with correct arguments for error', () => {
      const message = 'Error message';
      const duration = 4000;

      service.error(message, duration);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, 'Close', {
        duration,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    });

    it('should use default duration if no duration is provided for error', () => {
      const message = 'Default error message';

      service.error(message);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, 'Close', {
        duration: 3000, // Default duration
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    });
  });

  describe('info', () => {
    it('should call openSnackBar with correct arguments for info', () => {
      const message = 'Info message';
      const duration = 2000;

      service.info(message, duration);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, 'Close', {
        duration,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['info-snackbar'],
      });
    });

    it('should use default duration if no duration is provided for info', () => {
      const message = 'Default info message';

      service.info(message);

      expect(matSnackBarSpy.open).toHaveBeenCalledWith(message, 'Close', {
        duration: 3000, // Default duration
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['info-snackbar'],
      });
    });
  });
});

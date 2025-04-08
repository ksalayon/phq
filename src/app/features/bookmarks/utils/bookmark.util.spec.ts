import { AbstractControl } from '@angular/forms';
import { BookmarksUtils } from './bookmark.util';
import { Bookmark } from '../models/bookmark';

describe('BookmarksUtils', () => {
  describe('generateDefaultDescription', () => {
    it('should generate a description for a valid URL', () => {
      const url = 'https://www.example.com/path-to-page?param=value';
      const result = BookmarksUtils.generateDefaultDescription(url);
      expect(result).toBe('example com - path to page with additional parameters');
    });

    it('should handle a URL without parameters', () => {
      const url = 'https://www.example.com/homepage';
      const result = BookmarksUtils.generateDefaultDescription(url);
      expect(result).toBe('example com - homepage');
    });

    it('should handle a URL with only a domain', () => {
      const url = 'https://www.example.com/';
      const result = BookmarksUtils.generateDefaultDescription(url);
      expect(result).toBe('example com - Home page');
    });

    it('should return the default description if URL is invalid', () => {
      const url = 'invalid-url';
      const result = BookmarksUtils.generateDefaultDescription(url);
      expect(result).toBe('Default description');
    });
  });

  describe('urlValidator', () => {
    it('should return null for an empty control value (optional URL)', () => {
      const control = { value: '' } as AbstractControl;
      const validator = BookmarksUtils.urlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for a valid URL', () => {
      const control = { value: 'https://www.example.com' } as AbstractControl;
      const validator = BookmarksUtils.urlValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return an error for an invalid URL', () => {
      const control = { value: 'invalid-url' } as AbstractControl;
      const validator = BookmarksUtils.urlValidator();
      const result = validator(control);
      expect(result).toEqual({ invalidUrl: true });
    });
  });

  describe('urlRequiredValidator', () => {
    it('should return an error if the control value is empty', () => {
      const control = { value: '' } as AbstractControl;
      const validator = BookmarksUtils.urlRequiredValidator();
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should return an error if the control value is only whitespace', () => {
      const control = { value: '   ' } as AbstractControl;
      const validator = BookmarksUtils.urlRequiredValidator();
      const result = validator(control);
      expect(result).toEqual({ required: true });
    });

    it('should return null if the control value is not empty', () => {
      const control = { value: 'https://example.com' } as AbstractControl;
      const validator = BookmarksUtils.urlRequiredValidator();
      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('maxLengthValidator', () => {
    it('should return null if the control value is within the maximum length', () => {
      const control = { value: 'short string' } as AbstractControl;
      const validator = BookmarksUtils.maxLengthValidator(20);
      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return an error if the control value exceeds the maximum length', () => {
      const control = { value: 'this is a very long string' } as AbstractControl;
      const validator = BookmarksUtils.maxLengthValidator(10);
      const result = validator(control);
      expect(result).toEqual({
        maxLength: { requiredLength: 10, actualLength: 26 },
      });
    });
  });

  describe('transformBookmarksToVM', () => {
    it('should transform Bookmark array to VMBookmark array', () => {
      const bookmarks: Bookmark[] = [
        {
          id: '1',
          name: 'Bookmark 1',
          createdAt: new Date('2023-01-01'),
          url: 'http://localhost:8080',
          bookmarkGroupId: 'default',
        },
        {
          id: '2',
          name: 'Bookmark 2',
          createdAt: new Date('2023-02-01'),
          url: 'http://localhost:8000',
          bookmarkGroupId: 'default',
        },
      ];
      const result = BookmarksUtils.transformBookmarksToVM(bookmarks);
      expect(result).toEqual([
        {
          id: '1',
          name: 'Bookmark 1',
          createdAt: '1/1/2023, 1:00:00 PM', // Ensure date formatting is correct.
          url: 'http://localhost:8080',
          bookmarkGroupId: 'default',
          modifiedAt: '',
        },
        {
          id: '2',
          name: 'Bookmark 2',
          createdAt: '2/1/2023, 1:00:00 PM', // Ensure date formatting is correct.
          url: 'http://localhost:8000',
          bookmarkGroupId: 'default',
          modifiedAt: '',
        },
      ]);
    });
  });
});

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Bookmark } from '../models/bookmark';
import { VMBookmark } from '../components/bookmarks-table/bookmarks-table.models';

export class BookmarksUtils {
  public static generateDefaultDescription(url: string): string {
    try {
      // Parse the URL
      const parsedUrl = new URL(url);

      // Extract meaningful components
      const domain = parsedUrl.hostname.replace('www.', ''); // Remove "www."
      const path =
        parsedUrl.pathname === '/' ? 'Home page' : parsedUrl.pathname.slice(1).replace(/-/g, ' '); // Format path
      const params = parsedUrl.searchParams.toString() ? ' with additional parameters' : '';

      // Construct a user-friendly description
      let description = `${domain}`.split('.').join(' ');
      if (path) {
        description += ` - ${path}`;
      }
      description += params;

      return description;
    } catch (e) {
      // Return a default fallback if URL is invalid
      return 'Default description';
    }
  }

  /**
   * Used for form definitions and provides custom form input validation for fields accepting URL's
   * e.g.
   * this.form = this.fb.group({
   *      url: ['', [Validators.required, urlValidator()]], // Add the custom validator
   *    });
   */
  public static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Passes validation if the field is empty
      if (!value) {
        return null;
      }

      // Validate URL format otherwise
      const urlPattern = /https?:\/\/.+/;
      return urlPattern.test(value) ? null : { invalidUrl: true };
    };
  }

  public static transformBookmarksToVM(bookmarks: Bookmark[]): VMBookmark[] {
    return bookmarks.map((bm) => ({
      ...bm, // Spread all other properties from Bookmark
      createdAt: bm.createdAt.toLocaleString(), // Convert createdAt to a formatted string
      modifiedAt: bm?.modifiedAt?.toLocaleString() || '', // Handle optional modifiedAt field
    }));
  }
}

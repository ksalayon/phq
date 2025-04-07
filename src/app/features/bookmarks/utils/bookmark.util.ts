import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Bookmark } from '../models/bookmark';
import { VMBookmark } from '../models/bookmarks-table.models';

export class BookmarksUtils {
  /**
   * Generates a default user-friendly description based on the given URL.
   *
   * @param {string} url - The URL string to generate a description for.
   * @return {string} A generated description based on the URL, or a default message if the URL is invalid.
   */
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

  /**
   * Transforms an array of Bookmark objects into an array of VMBookmark objects,
   * converting date fields to formatted string representations.
   *
   * @param {Bookmark[]} bookmarks - The list of bookmarks to be transformed.
   * @return {VMBookmark[]} - The transformed list of VMBookmark objects.
   */
  public static transformBookmarksToVM(bookmarks: Bookmark[]): VMBookmark[] {
    return bookmarks.map((bm) => ({
      ...bm, // Spread all other properties from Bookmark
      createdAt: bm.createdAt.toLocaleString(), // Convert createdAt to a formatted string
      modifiedAt: bm?.modifiedAt?.toLocaleString() || '', // Handle optional modifiedAt field
    }));
  }

  /**
   * Transforms one or more VMBookmark objects into their corresponding Bookmark representations.
   *
   * @param {VMBookmark | VMBookmark[]} vmBookmarks - A single VMBookmark object or an array of VMBookmark objects to be transformed.
   * @return {Bookmark | Bookmark[]} The transformed Bookmark object or an array of Bookmark objects.
   */
  public static transformVMToBookmarks(
    vmBookmarks: VMBookmark | VMBookmark[]
  ): Bookmark | Bookmark[] {
    if (Array.isArray(vmBookmarks)) {
      // Handle array of VMBookmark objects
      return vmBookmarks.map((vm) => BookmarksUtils.transformSingleVMToBookmark(vm));
    }

    // Handle single VMBookmark object
    return BookmarksUtils.transformSingleVMToBookmark(vmBookmarks);
  }

  /**
   * Handles the transformation of a single VMBookmark to Bookmark.
   * @param vm - The VMBookmark object to convert.
   * @returns A single Bookmark object.
   */
  public static transformSingleVMToBookmark(vm: VMBookmark): Bookmark {
    return {
      ...vm, // Spread all other properties from VMBookmark
      createdAt: new Date(vm.createdAt), // Convert createdAt back to a Date object
      modifiedAt: vm.modifiedAt ? new Date(vm.modifiedAt) : undefined, // Handle undefined for modifiedAt
    };
  }

  /**
   * Compare two objects with `createdAt` and `modifiedAt` fields to sort them
   * in descending order of `createdAt`. If `createdAt` is the same, sort by
   * `modifiedAt` in descending order.
   *
   * @param a - The first object to compare.
   * @param b - The second object to compare.
   * @returns A negative number if `b` should come before `a`, a positive number if `a` should come before `b`, or 0 if they are equal.
   */
  public static compareByDates<T extends { createdAt: Date; modifiedAt?: Date }>(
    a: T,
    b: T
  ): number {
    // Compare `createdAt` in descending order
    const createdAtComparison = b.createdAt.getTime() - a.createdAt.getTime();

    // If `createdAt` is the same, compare `modifiedAt` in descending order
    if (createdAtComparison === 0) {
      const modifiedAtB = b.modifiedAt ? b.modifiedAt.getTime() : 0; // Default to 0 if undefined
      const modifiedAtA = a.modifiedAt ? a.modifiedAt.getTime() : 0; // Default to 0 if undefined
      return modifiedAtB - modifiedAtA;
    }

    // Otherwise, use the `createdAt` comparison
    return createdAtComparison;
  }
}

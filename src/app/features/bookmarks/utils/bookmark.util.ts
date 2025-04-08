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

      if (!value) {
        return null; // Optional field
      }

      // Adjusted strict URL pattern:
      const strictUrlPattern =
        /^(https?:\/\/)([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*|localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/.*)?(\?.*)?(#.*)?$/;

      if (!strictUrlPattern.test(value)) {
        return { invalidUrl: true };
      }

      try {
        const url = new URL(value);

        // Validate allowed protocols
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return null;
        }

        return { invalidUrl: true };
      } catch {
        return { invalidUrl: true }; // Invalid if URL parsing fails
      }
    };
  }

  /**
   * Validator function to ensure a URL is provided and is not empty or only whitespace.
   *
   * @return {Function} A validation function that checks the provided control's value.
   * If the value is empty or contains only whitespace, it returns a validation error object with a required error. Otherwise, it returns null.
   */
  public static urlRequiredValidator(): Function {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value; // Get the control's current value
      if (!value || value.trim().length === 0) {
        return { required: true }; // Set the 'required' error if empty or only whitespace
      }
      return null; // No error
    };
  }

  /**
   * Validator that checks if the control's value exceeds the specified maximum length.
   *
   * @param {number} maxLength - The maximum allowable length for the control's value.
   * @return {(control: AbstractControl) => ValidationErrors | null} A validation function that returns a validation error
   * object if the value exceeds the maximum length, or null if the value is valid.
   */
  public static maxLengthValidator(
    maxLength: number
  ): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim(); // Get the control's current value
      if (value && value.length > maxLength) {
        return { maxLength: { requiredLength: maxLength, actualLength: value.length } };
      }
      return null; // No error
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

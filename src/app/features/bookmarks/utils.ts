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
}

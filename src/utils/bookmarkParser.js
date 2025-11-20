/**
 * Parse browser bookmark export files
 * Supports Chrome, Firefox, Safari HTML bookmark exports
 */

/**
 * Parse HTML bookmark file (Chrome/Firefox/Safari format)
 * @param {string} htmlContent - The HTML content from bookmark export file
 * @returns {Array} Array of bookmark objects
 */
export function parseHTMLBookmarks(htmlContent) {
  const bookmarks = [];

  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Find all <A> tags (bookmark links)
  const links = doc.querySelectorAll('a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    const title = link.textContent.trim();
    const addDate = link.getAttribute('add_date');
    const icon = link.getAttribute('icon');

    // Skip invalid bookmarks
    // eslint-disable-next-line no-script-url
    if (!href || !title || href.startsWith('javascript:')) {
      return;
    }

    bookmarks.push({
      title,
      url: href,
      description: '',
      rating: '',
      toggledRadioButton: false,
      checked: false,
      addDate: addDate ? new Date(parseInt(addDate) * 1000).toISOString() : new Date().toISOString(),
      icon
    });
  });

  return bookmarks;
}

/**
 * Parse JSON bookmark file (Firefox JSON format)
 * @param {string} jsonContent - The JSON content from Firefox bookmark export
 * @returns {Array} Array of bookmark objects
 */
export function parseJSONBookmarks(jsonContent) {
  const bookmarks = [];

  try {
    const data = JSON.parse(jsonContent);

    // Recursive function to traverse bookmark tree
    function traverseBookmarks(node) {
      if (node.type === 'text/x-moz-place' && node.uri) {
        bookmarks.push({
          title: node.title || 'Untitled',
          url: node.uri,
          description: '',
          rating: '',
          toggledRadioButton: false,
          checked: false,
          addDate: node.dateAdded ? new Date(node.dateAdded / 1000).toISOString() : new Date().toISOString()
        });
      }

      if (node.children) {
        node.children.forEach(child => traverseBookmarks(child));
      }
    }

    traverseBookmarks(data);
  } catch (error) {
    console.error('Error parsing JSON bookmarks:', error);
  }

  return bookmarks;
}

/**
 * Auto-detect bookmark file format and parse
 * @param {string} content - The file content
 * @returns {Array} Array of bookmark objects
 */
export function parseBookmarkFile(content) {
  // Try to detect format
  const trimmed = content.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    // JSON format (Firefox)
    return parseJSONBookmarks(content);
  } else if (trimmed.toLowerCase().includes('<!doctype') || trimmed.toLowerCase().includes('<html')) {
    // HTML format (Chrome/Firefox/Safari)
    return parseHTMLBookmarks(content);
  }

  // Default to HTML parsing
  return parseHTMLBookmarks(content);
}

/**
 * Detect duplicate bookmarks by URL
 * @param {Array} newBookmarks - New bookmarks to import
 * @param {Array} existingBookmarks - Existing bookmarks in database
 * @returns {Object} Object with unique and duplicate bookmarks
 */
export function detectDuplicates(newBookmarks, existingBookmarks) {
  const existingUrls = new Set(existingBookmarks.map(b => b.url.toLowerCase()));

  const unique = [];
  const duplicates = [];

  newBookmarks.forEach(bookmark => {
    if (existingUrls.has(bookmark.url.toLowerCase())) {
      duplicates.push(bookmark);
    } else {
      unique.push(bookmark);
      existingUrls.add(bookmark.url.toLowerCase());
    }
  });

  return { unique, duplicates };
}

/**
 * Validate bookmark object
 * @param {Object} bookmark - Bookmark to validate
 * @returns {boolean} True if valid
 */
export function validateBookmark(bookmark) {
  if (!bookmark.url || typeof bookmark.url !== 'string') {
    return false;
  }

  if (!bookmark.title || typeof bookmark.title !== 'string') {
    return false;
  }

  // Validate URL format
  try {
    new URL(bookmark.url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean and normalize imported bookmarks
 * @param {Array} bookmarks - Bookmarks to clean
 * @returns {Array} Cleaned bookmarks
 */
export function cleanBookmarks(bookmarks) {
  return bookmarks
    .filter(validateBookmark)
    .map(bookmark => ({
      title: bookmark.title.slice(0, 255), // Limit title length
      url: bookmark.url,
      description: (bookmark.description || '').slice(0, 500), // Limit description
      rating: bookmark.rating || '',
      toggledRadioButton: bookmark.toggledRadioButton || false,
      checked: bookmark.checked || false
    }));
}

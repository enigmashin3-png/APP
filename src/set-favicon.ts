/**
 * Sets the favicon for the application
 */
export function setFavicon(href: string) {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  existingLinks.forEach(link => link.remove());

  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = href;
  link.type = 'image/svg+xml';
  
  // Add to document head
  document.head.appendChild(link);
}

/**
 * Sets the default favicon
 */
export function setDefaultFavicon() {
  setFavicon('/favicon.svg');
}

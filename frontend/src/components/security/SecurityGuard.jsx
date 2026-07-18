/**
 * Security Guard Component
 *
 * Provides basic deterrent against casual inspection in production builds.
 *
 * IMPORTANT: This does NOT fully disable DevTools or Inspect Element.
 * - Any determined user can still access source code through network tab
 * - API calls and data payloads remain visible
 * - This only makes casual inspection slightly harder
 *
 * For real protection, rely on:
 * - Backend authorization checks
 * - Rate limiting
 * - Server-side validation
 */

import { useEffect } from 'react';

export default function SecurityGuard() {
  useEffect(() => {
    // Only run in production
    if (!import.meta.env.PROD) {
      return;
    }

    // Block right-click context menu
    const blockContextMenu = (event) => {
      event.preventDefault();
      return false;
    };

    // Block common DevTools shortcuts
    const blockShortcuts = (event) => {
      // Allow shortcuts when typing in inputs/textareas
      const isInput =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        event.target.isContentEditable;

      // Allow Ctrl+C, Ctrl+V, Ctrl+A, etc. in inputs
      if (isInput && (event.ctrlKey || event.metaKey)) {
        return;
      }

      // Block DevTools shortcuts (not in inputs)
      if (!isInput) {
        const key = event.key.toLowerCase();

        // F12
        if (event.key === 'F12') {
          event.preventDefault();
          return false;
        }

        // Ctrl+Shift+I (Developer Tools)
        // Ctrl+Shift+J (Console)
        // Ctrl+Shift+C (Element Picker)
        if (event.ctrlKey && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) {
          event.preventDefault();
          return false;
        }

        // Ctrl+U (View Source)
        if (event.ctrlKey && key === 'u') {
          event.preventDefault();
          return false;
        }

        // Cmd+Option+I (Mac DevTools)
        // Cmd+Option+J (Mac Console)
        // Cmd+Option+C (Mac Element Picker)
        if (event.metaKey && event.altKey && ['i', 'j', 'c'].includes(key)) {
          event.preventDefault();
          return false;
        }
      }

      return true;
    };

    // Add listeners
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockShortcuts);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockShortcuts);
    };
  }, []);

  // This component renders nothing
  return null;
}

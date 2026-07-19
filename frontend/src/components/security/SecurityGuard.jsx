/**
 * SecurityGuard - Enhanced Frontend Inspect Deterrent
 *
 * LAYERED SECURITY APPROACH:
 *
 * Layer 1: Keyboard Shortcut Blocking
 * - Blocks F12, Ctrl+Shift+I/J/C, Ctrl+U
 * - Allows copy/paste in inputs
 *
 * Layer 2: Context Menu Blocking
 * - Blocks right-click menu
 *
 * Layer 3: DevTools Detection
 * - Detects when DevTools is opened via window size difference
 * - Triggers security response when detected
 *
 * Layer 4: Console Deterrence
 * - Shows warning when console is opened
 *
 * Layer 5: Content Protection
 * - Prevents image drag/save
 * - CSS-based text selection blocking
 *
 * IMPORTANT:
 * - This is DETERRENT only, not foolproof
 * - Real security is BACKEND authorization + validation
 * - Never expose sensitive data to frontend
 */

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function SecurityGuard() {
  const [securityLevel, setSecurityLevel] = useState('normal'); // normal | detected | blocked
  const [attempts, setAttempts] = useState(0);

  const handleSecurityEvent = useCallback(() => {
    setAttempts(prev => {
      const newCount = prev + 1;

      // After 3 attempts, escalate to blocked mode
      if (newCount >= 3) {
        setSecurityLevel('blocked');
      }

      return newCount;
    });
  }, []);

  useEffect(() => {
    // Only run in production
    if (!import.meta.env.PROD) {
      return;
    }

    let devToolsOpen = false;
    let checkInterval = null;

    // ===== LAYER 1: Keyboard Shortcut Blocking =====
    const handleKeyDown = (e) => {
      const isInput = (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.target.isContentEditable
      );

      // Allow copy/paste shortcuts in inputs
      if (isInput && (e.ctrlKey || e.metaKey)) {
        if (['c', 'v', 'a', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
          return;
        }
      }

      // Block DevTools shortcuts
      const blocked = (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') ||
        (e.metaKey && e.altKey && e.key.toLowerCase() === 'i') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j') ||
        (e.metaKey && e.altKey && e.key.toLowerCase() === 'j') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') ||
        (e.metaKey && e.altKey && e.key.toLowerCase() === 'c') ||
        (e.ctrlKey && e.key.toLowerCase() === 'u')
      );

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        handleSecurityEvent();
        return false;
      }
    };

    // ===== LAYER 2: Context Menu Blocking =====
    const handleContextMenu = (e) => {
      // Allow context menu in text inputs for accessibility
      const isInput = (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      );

      if (!isInput) {
        e.preventDefault();
        handleSecurityEvent();
        return false;
      }
    };

    // ===== LAYER 3: DevTools Detection =====
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          handleSecurityEvent();
        }
      } else {
        devToolsOpen = false;
      }
    };

    // Start DevTools detection loop
    checkInterval = setInterval(detectDevTools, 1000);

    // ===== LAYER 4: Console Deterrence =====
    const originalConsole = { ...console };

    // Override console to show deterrent message
    Object.keys(console).forEach(key => {
      if (typeof console[key] === 'function') {
        console[key] = (...args) => {
          // Only block in production, allow in dev
          if (import.meta.env.PROD) {
            handleSecurityEvent();
          }
          return originalConsole[key].apply(console, args);
        };
      }
    });

    // Override Function.prototype.toString to prevent source inspection
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function(...args) {
      handleSecurityEvent();
      return originalToString.apply(this, args);
    };

    // ===== LAYER 5: Image Protection =====
    const handleDragStart = (e) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault();
        return false;
      }
    };

    const handleSelectStart = (e) => {
      // Allow text selection in inputs only
      if (
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleCopy = (e) => {
      // Allow copy in inputs, block elsewhere
      if (
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          e.preventDefault();
          return false;
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu, { passive: false });
    document.addEventListener('dragstart', handleDragStart, { passive: false });
    document.addEventListener('selectstart', handleSelectStart, { passive: false });
    document.addEventListener('copy', handleCopy, { passive: false });

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);

      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [handleSecurityEvent]);

  // ===== BLOCKED STATE UI =====
  if (securityLevel === 'blocked') {
    return createPortal(
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#00ff00',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: '2rem',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          ⚠️ AKSES DITOLAK
        </div>
        <div style={{
          fontSize: '1rem',
          textAlign: 'center',
          maxWidth: '600px',
          lineHeight: '1.6',
          marginBottom: '20px',
        }}>
          Aktivitas mencurigakan terdeteksi.<br/>
          Inspeksi developer tidak diizinkan.<br/>
          Data website dilindungi.
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: '#666',
          textAlign: 'center',
        }}>
          Security Event Logged: {attempts} attempts<br/>
          Timestamp: {new Date().toISOString()}<br/>
          Session ID: {sessionStorage.getItem('securityToken') || 'NONE'}
        </div>
        <button
          onClick={() => {
            // Clear session and redirect
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/auth/login';
          }}
          style={{
            marginTop: '30px',
            padding: '12px 24px',
            backgroundColor: '#1a1a1a',
            color: '#00ff00',
            border: '1px solid #00ff00',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          RESET SESSION
        </button>
      </div>,
      document.body
    );
  }

  return null;
}

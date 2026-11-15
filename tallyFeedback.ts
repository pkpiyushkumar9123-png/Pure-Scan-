export const TALLY_FORM_ID = 'Gx2KVL';
export const TALLY_FORM_URL = 'https://tally.so/r/Gx2KVL';

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: Record<string, unknown>) => void;
      closePopup: (formId: string) => void;
      loadEmbeds: () => void;
    };
  }
}

/**
 * Opens the Tally feedback modal popup for PureScan AI.
 * Falls back to an in-app modal or iframe handler if script is blocked or unavailable.
 */
export function openTallyFeedback(onFallback?: () => void): boolean {
  if (typeof window !== 'undefined') {
    if (window.Tally && typeof window.Tally.openPopup === 'function') {
      try {
        window.Tally.openPopup(TALLY_FORM_ID, {
          layout: 'modal',
          width: 600,
          autoClose: 3000,
          hideTitle: false,
          overlay: true,
        });
        return true;
      } catch (err) {
        console.warn('Tally openPopup error, invoking fallback:', err);
      }
    }

    // If script hasn't fully initialized, check or inject script
    let script = document.querySelector('script[src="https://tally.so/widgets/embed.js"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://tally.so/widgets/embed.js';
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => {
        if (window.Tally && typeof window.Tally.openPopup === 'function') {
          window.Tally.openPopup(TALLY_FORM_ID, { layout: 'modal', width: 600 });
        } else if (onFallback) {
          onFallback();
        }
      };
      script.onerror = () => {
        if (onFallback) onFallback();
      };
      return false;
    }
  }

  if (onFallback) {
    onFallback();
  }
  return false;
}

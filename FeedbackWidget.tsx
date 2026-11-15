import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { openTallyFeedback, TALLY_FORM_URL } from '../utils/tallyFeedback';

interface FeedbackWidgetProps {
  /** If true, temporarily hides the floating bubble (e.g. during full-screen modal or camera capture) */
  hideBubble?: boolean;
  /** Optional custom trigger to open feedback programmatically */
  externalTriggerOpen?: boolean;
  onResetExternalTrigger?: () => void;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  hideBubble = false,
  externalTriggerOpen = false,
  onResetExternalTrigger,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('purescan_feedback_bubble_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [showFallbackModal, setShowFallbackModal] = useState<boolean>(false);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [dismissToast, setDismissToast] = useState<string | null>(null);

  // Trigger from external prop (e.g. when opened from Settings)
  useEffect(() => {
    if (externalTriggerOpen) {
      handleOpenFeedback();
      if (onResetExternalTrigger) {
        onResetExternalTrigger();
      }
    }
  }, [externalTriggerOpen]);

  const handleOpenFeedback = () => {
    const openedWithScript = openTallyFeedback(() => {
      // Fallback if Tally embed script is blocked or offline
      setShowFallbackModal(true);
      setIsIframeLoading(true);
    });

    if (!openedWithScript) {
      // Brief check if script launched popup; if not within 200ms, open fallback
      setTimeout(() => {
        const tallyOverlay = document.querySelector('.tally-overlay, [data-tally-modal="true"]');
        if (!tallyOverlay) {
          setShowFallbackModal(true);
          setIsIframeLoading(true);
        }
      }, 250);
    }
  };

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      localStorage.setItem('purescan_feedback_bubble_dismissed', 'true');
    } catch (err) {
      console.warn(err);
    }
    setDismissToast('Feedback button dismissed. Access feedback anytime in Settings 👋');
    setTimeout(() => setDismissToast(null), 3500);
  };

  return (
    <>
      {/* Floating Small Circle with Waving Hand Emoji & Cut Option */}
      <AnimatePresence>
        {!isDismissed && !hideBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="fixed bottom-22 right-4 sm:right-6 z-30 select-none group"
            id="purescan-floating-feedback-badge"
          >
            {/* Small cut/dismiss button */}
            <button
              type="button"
              onClick={handleDismissBubble}
              aria-label="Dismiss feedback shortcut"
              title="Hide feedback button (accessible in Settings)"
              className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-110 active:scale-95 z-10"
            >
              <X className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>

            {/* Waving Hand Button */}
            <button
              type="button"
              onClick={handleOpenFeedback}
              aria-label="Share Feedback & Suggestions"
              title="Help improve PureScan AI • Share Feedback 👋"
              data-tally-open="Gx2KVL"
              data-tally-layout="modal"
              data-tally-width="600"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/35 hover:border-emerald-500 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
            >
              <span className="text-xl sm:text-2xl leading-none transition-transform group-hover:scale-115 inline-block group-hover:rotate-12 duration-200">
                👋
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismissal Toast Notice */}
      <AnimatePresence>
        {dismissToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-4 sm:right-6 z-40 max-w-xs bg-slate-900/95 text-white dark:bg-white/95 dark:text-slate-900 px-3.5 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="leading-snug">{dismissToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tally Fallback Modal (In case script popup overlay is blocked by ad-blocker) */}
      <AnimatePresence>
        {showFallbackModal && (
          <motion.div
            key="feedback-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/55 transform-gpu"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-xl h-[85vh] max-h-[700px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800 transform-gpu"
            >
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👋</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      PureScan Feedback
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Share observations & help improve food truth
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={TALLY_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    title="Open form in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowFallbackModal(false)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Close feedback modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Iframe Body */}
              <div className="relative flex-1 w-full h-full bg-white dark:bg-slate-900">
                {isIframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 dark:bg-slate-900/80 z-10">
                    <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
                    <span className="text-xs font-mono text-gray-500">Loading feedback form...</span>
                  </div>
                )}
                <iframe
                  src={`${TALLY_FORM_URL}?transparentBackground=1`}
                  title="PureScan AI Tally Feedback"
                  className="w-full h-full border-0"
                  onLoad={() => setIsIframeLoading(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

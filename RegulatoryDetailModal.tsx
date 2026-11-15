import React, { useEffect, useState } from 'react';
import {
  X,
  Scale,
  ShieldAlert,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AdditiveRegulatoryInfo,
  REGULATORY_DISCRIMINATION_DISCLAIMER
} from '../utils/regulatoryTracker';

interface RegulatoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: AdditiveRegulatoryInfo | null;
  productName?: string;
  selectedJurisdiction?: 'FSSAI (India)' | 'EU EFSA' | 'US FDA' | null;
}

export const RegulatoryDetailModal: React.FC<RegulatoryDetailModalProps> = ({
  isOpen,
  onClose,
  info,
  productName,
  selectedJurisdiction
}) => {
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopySummary = () => {
    if (!info) return;
    const textToCopy = `[PureScan AI - Global Regulatory Audit]
Chemical / Additive: ${info.matchedRuleName} (${info.code || 'Unspecified INS'})
Why Flagged: ${info.shortReason}
Primary Law: ${info.primaryLaw}
Official Rulings:
${info.rulings.map(r => `• ${r.flag} ${r.agency}: [${r.badge}] ${r.shortReason} (Statute: ${r.law})`).join('\n')}

${REGULATORY_DISCRIMINATION_DISCLAIMER}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasAnyBanned = info?.rulings.some(r => r.level === 'banned') ?? false;
  const hasAnyWarning = info?.rulings.some(r => r.level === 'warning') ?? false;

  return (
    <AnimatePresence>
      {isOpen && info && (
        <motion.div
          key="regulatory-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'opacity' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto transform-gpu"
        >
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/65"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden z-10 my-auto flex flex-col max-h-[92vh] transform-gpu"
          >
          {/* Top Decorative Color Accent Bar */}
          <div
            className={`h-2 w-full ${
              hasAnyBanned
                ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500'
                : hasAnyWarning
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
            }`}
          />

          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`p-2.5 rounded-2xl shrink-0 ${
                  hasAnyBanned
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30'
                    : hasAnyWarning
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
                    : 'bg-slate-500/15 text-slate-600 dark:text-slate-300 ring-1 ring-slate-500/30'
                }`}
              >
                <Scale className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    GLOBAL STATUTORY AUDIT
                  </span>
                  {info.code && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono">
                      {info.code}
                    </span>
                  )}
                  {hasAnyBanned && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono animate-pulse">
                      JURISDICTION BAN
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-snug truncate">
                  {info.matchedRuleName}
                </h3>
                {productName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    Detected in: <span className="font-semibold text-gray-700 dark:text-gray-200">{productName}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">
            {/* 1. WHY IT IS FLAGGED (IN SHORT) */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                hasAnyBanned
                  ? 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/50'
                  : 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert
                  className={`w-4 h-4 shrink-0 ${
                    hasAnyBanned ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                />
                <h4
                  className={`text-xs font-black uppercase tracking-wider ${
                    hasAnyBanned ? 'text-rose-900 dark:text-rose-300' : 'text-amber-900 dark:text-amber-300'
                  }`}
                >
                  Why It Is Flagged (In Short)
                </h4>
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                {info.shortReason}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">
                {info.regulatorySummary}
              </p>
            </div>

            {/* 2. STATUTORY LAWS & JURISDICTION RULINGS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Statutory Laws & Agency Rulings
                  </h4>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">
                  3 Jurisdictions Audited
                </span>
              </div>

              <div className="space-y-3">
                {info.rulings.map((ruling) => {
                  const isBanned = ruling.level === 'banned';
                  const isWarn = ruling.level === 'warning';
                  const isFocused = selectedJurisdiction && selectedJurisdiction === ruling.agency;

                  return (
                    <div
                      key={ruling.agency}
                      className={`p-4 rounded-2xl border transition-all ${
                        isFocused
                          ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-sm'
                          : ''
                      } ${
                        isBanned
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/90 dark:border-rose-900/40'
                          : isWarn
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{ruling.flag}</span>
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                            {ruling.agency}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase font-mono ${
                            isBanned
                              ? 'bg-rose-600 text-white border-rose-600'
                              : isWarn
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {ruling.badge}
                        </span>
                      </div>

                      {/* Why flagged under this agency */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                          <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] mr-1">
                            Grounds:
                          </span>
                          {ruling.shortReason || ruling.detail}
                        </div>

                        {/* Statutory Law Reference */}
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-gray-200/70 dark:border-slate-700/70 flex items-start gap-2">
                          <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 block font-mono">
                              Statutory Law / Directive:
                            </span>
                            <span className="text-xs font-mono font-semibold text-gray-900 dark:text-slate-100 break-words leading-tight">
                              {ruling.law}
                            </span>
                          </div>
                        </div>

                        {/* Official Directive Detail */}
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                          {ruling.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 shrink-0 space-y-3">
            {/* 1-Line Legal & Non-Discrimination Notice */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-start sm:items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
              <p className="text-[11px] sm:text-xs font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {REGULATORY_DISCRIMINATION_DISCLAIMER}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors border border-gray-300 dark:border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Law Summary</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy Law Details</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black uppercase tracking-wider transition-all shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

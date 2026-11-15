import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Languages, 
  Leaf, 
  Users, 
  Sliders, 
  Cpu, 
  Database, 
  FileText,
  ChevronRight
} from 'lucide-react';

export interface SettingsSegment {
  id: string;
  targetId: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SETTINGS_SEGMENTS: SettingsSegment[] = [
  { 
    id: 'rules', 
    targetId: 'clinical-ai-transparency-card', 
    label: 'Clinical Rules',
    description: '100-Point Formula & Penalties',
    icon: ShieldCheck
  },
  { 
    id: 'language', 
    targetId: 'section-language', 
    label: 'Dual Language',
    description: 'Native Report & UI Languages',
    icon: Languages
  },
  { 
    id: 'dietary', 
    targetId: 'allergen-dietary-preferences-section', 
    label: 'Dietary & Allergens',
    description: 'Custom Sensitivities & Filters',
    icon: Leaf
  },
  { 
    id: 'family', 
    targetId: 'family-multi-profile-guard-section', 
    label: 'Family Guard',
    description: 'Multi-Profile Nutrition Checks',
    icon: Users
  },
  { 
    id: 'scanner', 
    targetId: 'section-scanner', 
    label: 'Scanner & Display',
    description: 'Camera, HUD & Dark Mode',
    icon: Sliders
  },
  { 
    id: 'ai-engine', 
    targetId: 'section-ai-engine', 
    label: 'AI Engine & Telemetry',
    description: 'Gemini, Groq & Quota Metrics',
    icon: Cpu
  },
  { 
    id: 'data', 
    targetId: 'section-data', 
    label: 'Data & Privacy',
    description: 'CSV Import/Export & Data Wipe',
    icon: Database
  },
  { 
    id: 'legal', 
    targetId: 'section-legal', 
    label: 'Legal & Support',
    description: 'Feedback, Disclaimer & Terms',
    icon: FileText
  }
];

export const SettingsSubNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string>('rules');
  const menuRef = useRef<HTMLDivElement>(null);

  // Real-time scroll spy: tracks which settings section is currently visible in <main>
  useEffect(() => {
    const handleScrollSpy = () => {
      const mainContainer = document.querySelector('main');
      if (!mainContainer) return;

      const containerRect = mainContainer.getBoundingClientRect();
      const currentScrollTop = mainContainer.scrollTop;

      let currentActive = SETTINGS_SEGMENTS[0].id;
      for (const seg of SETTINGS_SEGMENTS) {
        const el = document.getElementById(seg.targetId);
        if (el) {
          const elRect = el.getBoundingClientRect();
          const offsetTop = elRect.top - containerRect.top + currentScrollTop - 120;
          if (currentScrollTop >= offsetTop) {
            currentActive = seg.id;
          }
        }
      }
      setActiveSegmentId(currentActive);
    };

    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', handleScrollSpy, { passive: true });
    }
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => {
      if (mainContainer) {
        mainContainer.removeEventListener('scroll', handleScrollSpy);
      }
      window.removeEventListener('scroll', handleScrollSpy);
    };
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Navigate to target section and close automatically
  const handleSelectSection = useCallback((targetId: string) => {
    const mainContainer = document.querySelector('main');
    const targetEl = document.getElementById(targetId);

    if (mainContainer && targetEl) {
      const containerRect = mainContainer.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const offset = targetRect.top - containerRect.top + mainContainer.scrollTop - 75;

      mainContainer.scrollTo({
        top: Math.max(0, offset),
        behavior: 'smooth'
      });
    }

    // Close menu automatically after user click
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Semi-transparent backdrop when dialog is open - optimized without heavy full-screen blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/60 pointer-events-auto transform-gpu will-change-opacity"
          />
        )}
      </AnimatePresence>

      {/* Floating Hamburger Container anchored to top right */}
      <div 
        ref={menuRef}
        className="fixed top-18 sm:top-20 left-0 right-0 z-40 max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 sm:px-6 pointer-events-none select-none"
      >
        <div className="relative w-full flex justify-end">
          {/* Circular Floating Hamburger Menu Button */}
          <motion.button
            type="button"
            id="btn-settings-floating-menu"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', damping: 20, stiffness: 400 }}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label="Settings section menu"
            className={`pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full border shadow-xl flex items-center justify-center transition-colors duration-150 cursor-pointer relative transform-gpu ${
              isOpen
                ? 'bg-healthy-green text-white border-healthy-green shadow-healthy-green/30'
                : 'bg-white/95 dark:bg-slate-900/95 text-gray-700 dark:text-gray-200 border-gray-200/90 dark:border-slate-700/90 hover:text-healthy-green dark:hover:text-healthy-green hover:border-healthy-green/40 shadow-black/10 dark:shadow-black/40'
            }`}
          >
            {/* Animated Icon: Hamburger vs Close */}
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0, scale: isOpen ? 1.05 : 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 350 }}
              className="flex items-center justify-center transform-gpu will-change-transform"
            >
              {isOpen ? (
                <X className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              ) : (
                <Menu className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              )}
            </motion.div>

            {/* Glowing active indicator dot */}
            {!isOpen && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-healthy-green opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-healthy-green border-2 border-white dark:border-slate-900" />
              </span>
            )}
          </motion.button>

          {/* Dialog Box Popover - silky smooth 60/120fps hardware-accelerated spring */}
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                key="settings-popover"
                initial={{ opacity: 0, scale: 0.88, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.92, 
                  y: -6,
                  transition: { duration: 0.14, ease: [0.32, 0, 0.67, 0] }
                }}
                transition={{ 
                  type: 'spring', 
                  damping: 26, 
                  stiffness: 380, 
                  mass: 0.5 
                }}
                style={{ transformOrigin: 'top right', willChange: 'transform, opacity' }}
                role="dialog"
                aria-label="Settings navigation dialog"
                className="pointer-events-auto absolute top-14 right-0 w-72 sm:w-80 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/90 dark:border-slate-700/90 p-3 z-50 overflow-hidden text-left transform-gpu"
              >
                {/* Dialog Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-dark-border mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-healthy-green animate-pulse" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 dark:text-white">
                      Jump to Section
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-healthy-green/10 text-healthy-green">
                    {SETTINGS_SEGMENTS.length} SECTIONS
                  </span>
                </div>

                {/* Section List */}
                <div className="max-h-[65vh] overflow-y-auto space-y-1 py-1 pr-0.5 no-scrollbar">
                  {SETTINGS_SEGMENTS.map((segment) => {
                    const IconComponent = segment.icon;
                    const isActive = activeSegmentId === segment.id;

                    return (
                      <button
                        key={segment.id}
                        type="button"
                        onClick={() => handleSelectSection(segment.targetId)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                          isActive
                            ? 'bg-healthy-green/10 dark:bg-healthy-green/20 text-healthy-green dark:text-emerald-400 font-bold border border-healthy-green/30'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-healthy-green text-white shadow-sm shadow-healthy-green/30'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 group-hover:text-healthy-green group-hover:bg-healthy-green/10'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-semibold block truncate">
                              {segment.label}
                            </span>
                            <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 block truncate">
                              {segment.description}
                            </span>
                          </div>
                        </div>

                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive
                              ? 'text-healthy-green translate-x-0.5'
                              : 'text-gray-400 group-hover:text-healthy-green group-hover:translate-x-0.5'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Dialog Footer */}
                <div className="pt-2 mt-1 border-t border-gray-100 dark:border-dark-border text-center">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Tap any section to navigate & auto-close
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

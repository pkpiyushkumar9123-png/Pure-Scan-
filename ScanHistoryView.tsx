import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Scan, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCompareModal } from './ProductCompareModal';

export interface Ingredient {
  name: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  implications: string;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  productName: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  confidenceScore?: number;
  riskyIngredients: Ingredient[];
  alternative: {
    name: string;
    reason: string;
  };
}

interface ScanHistoryViewProps {
  history: ScanResult[];
  onSelectScan: (item: ScanResult) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onStartScan: () => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  history,
  onSelectScan,
  onClearHistory,
  onDeleteItem,
  onStartScan
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lockedCompareItem, setLockedCompareItem] = useState<ScanResult | null>(null);
  const [compareItem, setCompareItem] = useState<ScanResult | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareToast, setCompareToast] = useState<string | null>(null);

  const handleLightningCompareClick = (item: ScanResult) => {
    if (lockedCompareItem?.id === item.id) {
      // Already locked -> unlock!
      setLockedCompareItem(null);
      return;
    }

    if (lockedCompareItem) {
      // Another item is already locked -> compare both directly (zero AI)!
      setCompareItem(item);
      setIsCompareModalOpen(true);
      return;
    }

    // No item locked yet -> lock this product
    setLockedCompareItem(item);

    if (history.length < 2) {
      setCompareToast("Locked! Scan at least one more product to compare side-by-side.");
      setTimeout(() => setCompareToast(null), 4000);
    } else {
      setCompareToast(`Locked "${item.productName}". Now click ⚡ on another product to compare.`);
      setTimeout(() => setCompareToast(null), 3500);
    }
  };

  // Health Metrics
  const metrics = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : [];
    if (safeHistory.length === 0) {
      return { total: 0, cleanRatio: 0, avgScore: 0, totalRisks: 0 };
    }
    const total = safeHistory.length;
    const cleanCount = safeHistory.filter(item => item && (item.grade === 'A' || item.grade === 'B')).length;
    const cleanRatio = Math.round((cleanCount / total) * 100);
    const avgScore = Math.round(safeHistory.reduce((acc, item) => acc + (item?.score || 0), 0) / total);
    const totalRisks = safeHistory.reduce((acc, item) => acc + (Array.isArray(item?.riskyIngredients) ? item.riskyIngredients.length : 0), 0);

    return { total, cleanRatio, avgScore, totalRisks };
  }, [history]);

  // Scans ordered chronologically (newest first)
  const sortedHistory = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : [];
    return [...safeHistory].sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0));
  }, [history]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const safeHistory = Array.isArray(history) ? history : [];
    if (safeHistory.length === 0) return;

    const headers = ['Date', 'Time', 'Product Name', 'Grade', 'Score (100)', 'Risk Count', 'Flagged Additives', 'Healthier Alternative'];
    const rows = safeHistory.map(item => {
      const dateObj = new Date(item?.timestamp || Date.now());
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const riskyList = Array.isArray(item?.riskyIngredients) ? item.riskyIngredients : [];
      const risks = riskyList.map(r => `${r?.name || 'Additive'} (${r?.risk || 'medium'})`).join('; ');
      const alt = item?.alternative?.name ? `${item.alternative.name}: ${item.alternative.reason || ''}` : 'None';
      const productName = String(item?.productName || 'Scanned Food Item');

      return [
        `"${date}"`,
        `"${time}"`,
        `"${productName.replace(/"/g, '""')}"`,
        `"${item?.grade || 'C'}"`,
        item?.score ?? 50,
        riskyList.length,
        `"${risks.replace(/"/g, '""')}"`,
        `"${alt.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `purescan_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;
    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • ${timeStr}`;
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case 'A':
        return {
          bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-500/30',
          solid: 'bg-emerald-500',
          label: 'Clean & Pure'
        };
      case 'B':
        return {
          bg: 'bg-lime-500/15 dark:bg-lime-500/25',
          text: 'text-lime-700 dark:text-lime-300',
          border: 'border-lime-500/30',
          solid: 'bg-lime-500',
          label: 'Low Risk'
        };
      case 'C':
        return {
          bg: 'bg-amber-500/15 dark:bg-amber-500/25',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-500/30',
          solid: 'bg-amber-500',
          label: 'Moderate Risk'
        };
      case 'D':
        return {
          bg: 'bg-orange-500/15 dark:bg-orange-500/25',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-500/30',
          solid: 'bg-orange-500',
          label: 'High Hazards'
        };
      default:
        return {
          bg: 'bg-rose-500/15 dark:bg-rose-500/25',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-500/30',
          solid: 'bg-rose-500',
          label: 'Critical Hazards'
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 dark:bg-dark-bg min-h-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Scan History
            </h2>
            {history.length > 0 && (
              <span className="text-xs font-mono font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full border border-gray-200 dark:border-dark-border">
                {history.length} {history.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Detailed log of all scanned food labels • Click ⚡ on any card to lock and compare products (No AI)
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 transition-colors shadow-sm cursor-pointer"
              title="Export as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              title="Clear all scans"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Compare Helper Toast */}
      <AnimatePresence>
        {compareToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0 fill-current" />
              <span>{compareToast}</span>
            </div>
            <button
              onClick={() => setCompareToast(null)}
              className="p-1 text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            key="clear-history-confirm"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.5 }}
            style={{ willChange: 'transform, opacity' }}
            className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transform-gpu"
          >
            <div className="flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Are you sure you want to permanently delete all {history.length} scans from history?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-dark-border text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-lg cursor-pointer"
              >
                Yes, Delete All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 ? (
        <>
          {/* Health Metrics Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Total Scanned */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Scans</span>
                <Scan className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white font-mono">
                {metrics.total}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Audited products
              </div>
            </div>

            {/* Card 2: Clean Choices Ratio */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Clean Ratio</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {metrics.cleanRatio}%
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Rated Grade A or B
              </div>
            </div>

            {/* Card 3: Average Score */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Score</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white font-mono">
                {metrics.avgScore}
                <span className="text-xs font-normal text-gray-400">/100</span>
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Overall health grade
              </div>
            </div>

            {/* Card 4: Flagged Additives Caught */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Risks Caught</span>
                <ShieldAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                {metrics.totalRisks}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                Chemicals detected
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {sortedHistory.map((item) => {
                  const style = getGradeStyle(item.grade);
                  const isPendingDelete = deleteConfirmId === item.id;
                  const isLocked = lockedCompareItem?.id === item.id;
                  const isOtherLocked = !!lockedCompareItem && !isLocked;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`group relative bg-white dark:bg-dark-card rounded-3xl border transition-all overflow-hidden ${
                        isLocked
                          ? 'border-amber-400 dark:border-amber-500 shadow-xl ring-2 ring-amber-400/40 bg-amber-500/[0.03]'
                          : isOtherLocked
                          ? 'border-gray-200 dark:border-dark-border shadow-sm hover:border-amber-400/50 hover:shadow-md'
                          : 'border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/40'
                      }`}
                    >
                      {/* Top Header Row of Product Box */}
                      <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-gray-100 dark:border-dark-border/60 bg-gray-50/60 dark:bg-slate-900/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${style.bg} ${style.border} ${style.text}`}>
                            {style.label}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>

                        {/* Top-Right Action Controls: ⚡ Compare + Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLightningCompareClick(item);
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              isLocked
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300 dark:ring-amber-400 scale-105'
                                : isOtherLocked
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white ring-1 ring-amber-400/50'
                                : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-slate-700 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white'
                            }`}
                            title={
                              isLocked
                                ? "Locked for comparison (Click to unlock)"
                                : isOtherLocked
                                ? `Click to compare with ${lockedCompareItem?.productName || 'locked item'}`
                                : "Lock & compare with another product (⚡ Zero AI)"
                            }
                          >
                            <Zap className={`w-3.5 h-3.5 ${isLocked ? 'fill-current text-white animate-pulse' : isOtherLocked ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500 fill-amber-500'}`} />
                            <span className="text-[10px] tracking-wide uppercase">
                              {isLocked ? 'Locked' : isOtherLocked ? 'Compare' : 'Compare'}
                            </span>
                          </button>

                          {/* Delete Trigger / Confirm */}
                          {isPendingDelete ? (
                            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-0.5 px-1 rounded-xl border border-rose-200 dark:border-rose-900/50">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteItem(item.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-extrabold hover:bg-rose-700 cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(item.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Product Card Body: Clickable to view analysis */}
                      <button
                        type="button"
                        onClick={() => onSelectScan(item)}
                        className="w-full p-4 sm:p-5 flex items-start gap-4 text-left cursor-pointer group-hover:bg-gray-50/40 dark:group-hover:bg-slate-900/20 transition-colors"
                      >
                        {/* Box 1: Grade Score Avatar Box */}
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105 ${style.bg} ${style.border}`}>
                          <span className={`text-xl sm:text-2xl font-black ${style.text}`}>
                            {item.grade}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                            {item.score}/100
                          </span>
                        </div>

                        {/* Box 2: Product Information, Additives & Swaps */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.productName || 'Unlabeled Product'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-emerald-500 shrink-0 transition-colors">
                              <span className="hidden sm:inline text-[11px]">View Report</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>

                          {/* Risky Additives Box */}
                          {(() => {
                            const riskyList = Array.isArray(item?.riskyIngredients) ? item.riskyIngredients : [];
                            return (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {riskyList.length === 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-500/25">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                    Zero Flagged Additives • 100% Clean
                                  </span>
                                ) : (
                                  <>
                                    <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-0.5">
                                      {riskyList.length} {riskyList.length === 1 ? 'Additive' : 'Additives'}:
                                    </span>
                                    {riskyList.slice(0, 3).map((r, rIdx) => (
                                      <span
                                        key={rIdx}
                                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                                          r?.risk === 'high'
                                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                        }`}
                                      >
                                        {r?.name || 'Additive Concern'}
                                      </span>
                                    ))}
                                    {riskyList.length > 3 && (
                                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                        +{riskyList.length - 3} more
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })()}

                          {/* Box 3: Healthier Alternative Teaser Box */}
                          {item?.alternative?.name && (
                            <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                                Better Swap:
                              </span>
                              <span className="truncate font-medium">{item.alternative.name}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center space-y-6 bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border p-6 sm:p-10 shadow-sm">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <Scan className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              No History Recorded Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Every ingredient list or nutrition label you scan will be logged here with clinical scores, flagged chemical hazards, and healthier swaps.
            </p>
          </div>

          <button
            onClick={onStartScan}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>START YOUR FIRST SCAN</span>
          </button>

          <div className="pt-4 border-t border-gray-100 dark:border-dark-border w-full max-w-xs space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Popular Items To Audit
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {['Energy Drinks', 'Protein Bars', 'Salad Dressings', 'Cereal', 'Baby Food'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-xl"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating Locked Product Bar */}
      <AnimatePresence>
        {lockedCompareItem && !isCompareModalOpen && (
          <motion.div
            key="locked-compare-bar"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96, transition: { duration: 0.14, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
            style={{ willChange: 'transform, opacity' }}
            className="fixed bottom-24 sm:bottom-20 left-4 right-4 max-w-lg mx-auto z-40 bg-slate-900/98 dark:bg-slate-950/98 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-amber-400/40 flex items-center justify-between gap-3 transform-gpu"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 animate-pulse">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate flex items-center gap-1.5">
                  <span className="text-amber-400 uppercase tracking-wider text-[10px]">Locked:</span>
                  <span className="truncate">{lockedCompareItem.productName}</span>
                </p>
                <p className="text-[11px] text-gray-300 truncate">
                  Click <span className="text-amber-400 font-bold">⚡ Compare</span> on another product to view results
                </p>
              </div>
            </div>
            <button
              onClick={() => setLockedCompareItem(null)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-extrabold shrink-0 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Head-to-Head Comparison Modal (Zero AI, Direct Data) */}
      <AnimatePresence>
        {isCompareModalOpen && lockedCompareItem && compareItem && (
          <ProductCompareModal
            productA={lockedCompareItem}
            productB={compareItem}
            allHistory={sortedHistory}
            onClose={() => {
              setIsCompareModalOpen(false);
            }}
            onSwap={() => {
              const temp = lockedCompareItem;
              setLockedCompareItem(compareItem);
              setCompareItem(temp);
            }}
            onSelectProductA={(item) => setLockedCompareItem(item)}
            onSelectProductB={(item) => setCompareItem(item)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

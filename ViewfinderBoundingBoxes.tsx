import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  FileText, 
  AlertCircle, 
  Layers, 
  Check, 
  Crosshair, 
  Target,
  Sparkles,
  Barcode
} from 'lucide-react';
import { DetectedBoundingBox } from '../utils/realtimeDetector';

interface ViewfinderBoundingBoxesProps {
  boxes: DetectedBoundingBox[];
  selectedBoxId: string | 'all';
  onSelectBox: (boxId: string | 'all') => void;
  onAnalyzeMultiBoxes?: () => void;
  multiBoxMode: boolean;
  onToggleMultiBoxMode?: () => void;
  confidence?: number;
  overallConfidence?: number;
  onToggleSelect?: (boxId: string) => void;
  onScanBox?: (box: DetectedBoundingBox) => void;
}

export const ViewfinderBoundingBoxes: React.FC<ViewfinderBoundingBoxesProps> = ({
  boxes,
  selectedBoxId,
  onSelectBox,
  onAnalyzeMultiBoxes,
  multiBoxMode,
  onToggleMultiBoxMode,
  confidence = 95,
  overallConfidence,
  onToggleSelect,
  onScanBox,
}) => {
  const displayConfidence = overallConfidence ?? confidence;
  if (!boxes || boxes.length === 0) return null;

  const isAllSelected = selectedBoxId === 'all';

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* Dynamic Bounding Boxes */}
      {boxes.map((box, index) => {
        const isBoxSelected = isAllSelected || selectedBoxId === box.id;
        const isSingleFocused = selectedBoxId === box.id;

        // Color coding based on type
        const typeConfig = {
          nutrition: {
            border: isBoxSelected ? 'border-amber-400' : 'border-amber-400/40',
            bg: isBoxSelected ? 'bg-amber-400/10' : 'bg-transparent',
            badgeBg: 'bg-amber-500/90 text-black',
            bracket: 'border-amber-400',
            icon: Activity,
            glow: 'shadow-[0_0_15px_rgba(251,191,36,0.35)]',
            accent: '#fbbf24',
          },
          ingredients: {
            border: isBoxSelected ? 'border-emerald-400' : 'border-emerald-400/40',
            bg: isBoxSelected ? 'bg-emerald-400/10' : 'bg-transparent',
            badgeBg: 'bg-emerald-500/90 text-black',
            bracket: 'border-emerald-400',
            icon: FileText,
            glow: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
            accent: '#34d399',
          },
          allergens: {
            border: isBoxSelected ? 'border-rose-400' : 'border-rose-400/40',
            bg: isBoxSelected ? 'bg-rose-400/10' : 'bg-transparent',
            badgeBg: 'bg-rose-500/90 text-white',
            bracket: 'border-rose-400',
            icon: AlertCircle,
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
            accent: '#f43f5e',
          },
          barcode: {
            border: isBoxSelected ? 'border-cyan-400' : 'border-cyan-400/40',
            bg: isBoxSelected ? 'bg-cyan-400/10' : 'bg-transparent',
            badgeBg: 'bg-cyan-500/90 text-black',
            bracket: 'border-cyan-400',
            icon: Barcode,
            glow: 'shadow-[0_0_15px_rgba(34,211,238,0.35)]',
            accent: '#22d3ee',
          },
          general: {
            border: isBoxSelected ? 'border-emerald-400' : 'border-emerald-400/40',
            bg: isBoxSelected ? 'bg-emerald-400/10' : 'bg-transparent',
            badgeBg: 'bg-emerald-500/90 text-black',
            bracket: 'border-emerald-400',
            icon: Target,
            glow: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
            accent: '#34d399',
          },
        }[box.type] || {
          border: 'border-emerald-400',
          bg: 'bg-emerald-400/10',
          badgeBg: 'bg-emerald-500 text-black',
          bracket: 'border-emerald-400',
          icon: Target,
          glow: 'shadow-[0_0_15px_rgba(52,211,153,0.35)]',
          accent: '#34d399',
        };

        const IconComponent = typeConfig.icon;

        // Convert normalized coordinates (0..1000) to percentage
        const leftPercent = `${(box.x / 1000) * 100}%`;
        const topPercent = `${(box.y / 1000) * 100}%`;
        const widthPercent = `${(box.width / 1000) * 100}%`;
        const heightPercent = `${(box.height / 1000) * 100}%`;

        return (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: leftPercent,
              top: topPercent,
              width: widthPercent,
              height: heightPercent
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectBox(box.id === selectedBoxId ? 'all' : box.id);
            }}
            className={`absolute pointer-events-auto cursor-pointer rounded-2xl transition-colors duration-200 border ${
              typeConfig.border
            } ${typeConfig.bg} ${isBoxSelected ? typeConfig.glow : ''}`}
            style={{
              boxShadow: isSingleFocused
                ? `0 0 0 2px ${typeConfig.accent}, 0 0 24px ${typeConfig.accent}50`
                : undefined,
            }}
          >
            {/* 4 Sleek Corner Target Brackets */}
            <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 ${typeConfig.bracket} rounded-tl-lg`} />
            <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 ${typeConfig.bracket} rounded-tr-lg`} />
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 ${typeConfig.bracket} rounded-bl-lg`} />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 ${typeConfig.bracket} rounded-br-lg`} />

            {/* Top Classification Pill Tag */}
            <div className="absolute -top-3.5 left-2 sm:left-3 flex items-center gap-1.5 shadow-lg">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-black tracking-wider uppercase backdrop-blur-md ${typeConfig.badgeBg}`}>
                <IconComponent className="w-2.5 h-2.5 shrink-0" />
                <span>
                  [{index + 1}] {box.label}
                </span>
                <span className="opacity-75 font-semibold">• {box.confidence}%</span>
              </span>

              {isSingleFocused && (
                <span className="hidden sm:inline-flex items-center gap-0.5 bg-black/80 text-emerald-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                  <Crosshair className="w-2 h-2 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                  LOCKED
                </span>
              )}
            </div>

            {/* Center Reticle for focused box */}
            {isSingleFocused && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-6 h-6 border border-dashed border-white rounded-full animate-ping" />
                <div className="absolute w-3 h-3 border border-white rounded-full" />
              </div>
            )}

            {/* Bottom-right Dimensions & Tap Hint */}
            <div className="absolute -bottom-3 right-2 flex items-center gap-1">
              <span className="bg-black/80 backdrop-blur-md text-white/70 text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/10">
                {box.width}×{box.height}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Sweeping Laser Scanner Beam (Active across bounding frame) */}
      <motion.div
        initial={{ top: '12%' }}
        animate={{ top: '88%' }}
        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2.4, ease: 'easeInOut' }}
        className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.9)] pointer-events-none"
      />

      {/* Bottom Floating Multi-Box Radar Controller Pill */}
      <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-col items-center gap-1.5 pointer-events-auto">
        {/* Active Multi-Box Target Selector Chips */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/85 backdrop-blur-xl rounded-2xl border border-white/15 shadow-2xl max-w-full overflow-x-auto no-scrollbar">
          {/* Option: All Multi-Boxes */}
          <button
            type="button"
            onClick={() => onSelectBox('all')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              isAllSelected
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                : 'text-white/70 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3 h-3 shrink-0" />
            <span>ALL BOXES ({boxes.length})</span>
            {isAllSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </button>

          {/* Individual Box Chips */}
          {boxes.map((box, idx) => {
            const isSelected = selectedBoxId === box.id;
            return (
              <button
                key={box.id}
                type="button"
                onClick={() => onSelectBox(box.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                <span>
                  [{idx + 1}] {box.type === 'nutrition' ? 'Nutrition' : box.type === 'ingredients' ? 'Ingredients' : box.type === 'allergens' ? 'Allergens' : 'Zone'}
                </span>
                {isSelected && <Crosshair className="w-2.5 h-2.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Informative Radar Status Bar */}
        <div className="flex items-center justify-between w-full px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-[9px] font-mono text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">
              {isAllSelected 
                ? `MULTI-BOX RADAR: ${boxes.length} ZONES ACTIVE` 
                : `FOCUSED: ZONE [${boxes.findIndex(b => b.id === selectedBoxId) + 1}] LOCKED`}
            </span>
          </div>
          <span className="text-white/60">
            CONFIDENCE: <strong className="text-white">{displayConfidence}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

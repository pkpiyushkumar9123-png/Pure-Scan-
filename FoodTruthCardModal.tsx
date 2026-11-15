import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FamilyCompatibilityResult, IngredientItem } from '../utils/familyAndVoiceUtils';

interface FoodTruthCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  riskyIngredients: IngredientItem[];
  alternative?: {
    name: string;
    reason: string;
  };
  familyResults?: FamilyCompatibilityResult[];
  targetAudience?: string;
  novaGroup?: number;
}

function getGradeHex(grade: string, score: number) {
  if (grade === 'A' || score >= 80) return { main: '#10B981', light: '#ECFDF5', text: '#065F46', label: 'CLEAN & PURE' };
  if (grade === 'B' || score >= 65) return { main: '#84CC16', light: '#F7FEE7', text: '#3F6212', label: 'FAVORABLE PROFILE' };
  if (grade === 'C' || score >= 45) return { main: '#F59E0B', light: '#FFFBEB', text: '#92400E', label: 'MODERATE CAUTION' };
  if (grade === 'D' || score >= 25) return { main: '#F97316', light: '#FFF7ED', text: '#9A3412', label: 'HIGH ADDITIVE LOAD' };
  return { main: '#EF4444', light: '#FEF2F2', text: '#991B1B', label: 'CRITICAL HAZARD' };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 2
): string[] {
  const words = (text || '').split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) {
        lines[lines.length - 1] = lines[lines.length - 1].slice(0, -3) + '...';
        return lines;
      }
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

export const FoodTruthCardModal: React.FC<FoodTruthCardModalProps> = ({
  isOpen,
  onClose,
  productName,
  grade,
  score,
  riskyIngredients,
  alternative,
  familyResults = [],
  targetAudience,
  novaGroup
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cardDataUrl, setCardDataUrl] = useState<string>('');
  const [copiedText, setCopiedText] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1380;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = getGradeHex(grade, score);

    // 1. Background Gradient (Sleek Dark Slate Card with Emerald/Grade Accent)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1380);
    bgGrad.addColorStop(0, '#0B1120');
    bgGrad.addColorStop(0.5, '#0F172A');
    bgGrad.addColorStop(1, '#090E1A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1380);

    // Subtle top ambient glow
    const glowGrad = ctx.createRadialGradient(540, 290, 30, 540, 290, 460);
    glowGrad.addColorStop(0, `${palette.main}33`);
    glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, 1080, 750);

    // Outer Card Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 36, 36, 1008, 1308, 44);
    ctx.stroke();

    // 2. Top Header Bar
    drawRoundedRect(ctx, 72, 72, 56, 56, 16);
    ctx.fillStyle = '#10B981';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 30px Inter, system-ui, sans-serif';
    ctx.fillText('P', 90, 111);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 30px Inter, system-ui, sans-serif';
    ctx.fillText('PURESCAN AI', 146, 102);

    ctx.fillStyle = '#10B981';
    ctx.font = '700 17px Inter, system-ui, sans-serif';
    ctx.fillText('FOOD TRUTH CARD • BIOCHEMICAL AUDIT', 146, 126);

    // Date Badge on Right
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    ctx.font = '700 20px Inter, system-ui, sans-serif';
    const dateW = ctx.measureText(dateStr).width + 44;
    drawRoundedRect(ctx, 1008 - dateW, 78, dateW, 46, 23);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fill();
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(dateStr, 1008 - dateW + 22, 108);

    // 3. Product Name Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 46px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    const titleLines = wrapCanvasText(ctx, productName || 'Scanned Food Product', 900, 2);
    let currentY = 205;
    titleLines.forEach(line => {
      ctx.fillText(line, 540, currentY);
      currentY += 54;
    });

    // 4. Center Health Score Ring & Grade
    const ringCenterY = currentY + 115;
    const radius = 112;

    // Background track circle
    ctx.beginPath();
    ctx.arc(540, ringCenterY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 22;
    ctx.stroke();

    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.max(4, score) / 100) * (Math.PI * 2);
    ctx.beginPath();
    ctx.arc(540, ringCenterY, radius, startAngle, endAngle);
    ctx.strokeStyle = palette.main;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Grade Letter
    ctx.fillStyle = palette.main;
    ctx.font = '900 104px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(grade, 540, ringCenterY + 26);

    // Score Sub-label
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '800 22px Inter, system-ui, sans-serif';
    ctx.fillText(`SCORE ${score}/100`, 540, ringCenterY + 66);

    // Status Pill under Ring
    currentY = ringCenterY + 142;
    ctx.font = '800 20px Inter, system-ui, sans-serif';
    const statusText = `${palette.label} • ${riskyIngredients.length} CONCERN${riskyIngredients.length === 1 ? '' : 'S'}`;
    const pillW = ctx.measureText(statusText).width + 64;
    drawRoundedRect(ctx, 540 - pillW / 2, currentY, pillW, 46, 23);
    ctx.fillStyle = `${palette.main}24`;
    ctx.fill();
    ctx.strokeStyle = `${palette.main}88`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = palette.main;
    ctx.fillText(statusText, 540, currentY + 30);

    // Target Demographic & NOVA Pill (Groq AI Intelligence)
    if (targetAudience) {
      currentY += 56;
      ctx.font = '800 17px Inter, system-ui, sans-serif';
      const targetText = `🎯 TARGET: ${targetAudience} • NOVA ${novaGroup || (score < 50 ? 4 : 2)} ${novaGroup === 4 || score < 50 ? 'UPF' : 'FOOD'}`;
      const tPillW = Math.min(936, ctx.measureText(targetText).width + 48);
      drawRoundedRect(ctx, 540 - tPillW / 2, currentY, tPillW, 38, 19);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#FBBF24';
      ctx.fillText(targetText, 540, currentY + 25);
      currentY += 48;
    } else {
      currentY += 64;
    }

    // 5. Family Guard Compatibility Strip (if familyResults passed)
    ctx.textAlign = 'left';
    if (familyResults.length > 0) {
      drawRoundedRect(ctx, 72, currentY, 936, 92, 24);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '800 16px Inter, system-ui, sans-serif';
      ctx.fillText('FAMILY HOUSEHOLD GUARD:', 98, currentY + 30);

      let badgeX = 98;
      familyResults.slice(0, 4).forEach(fr => {
        const badgeColor =
          fr.status === 'safe' ? '#10B981' : fr.status === 'caution' ? '#F59E0B' : '#EF4444';
        const statusIcon = fr.status === 'safe' ? 'SAFE' : fr.status === 'caution' ? 'CAUTION' : 'UNSAFE';
        const label = `${fr.member.avatarEmoji} ${fr.member.name}: ${statusIcon}`;
        ctx.font = '800 18px Inter, system-ui, sans-serif';
        const w = ctx.measureText(label).width + 32;
        if (badgeX + w < 985) {
          drawRoundedRect(ctx, badgeX, currentY + 42, w, 36, 12);
          ctx.fillStyle = `${badgeColor}22`;
          ctx.fill();
          ctx.strokeStyle = `${badgeColor}66`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = badgeColor;
          ctx.fillText(label, badgeX + 16, currentY + 66);
          badgeX += w + 14;
        }
      });

      currentY += 112;
    }

    // 6. Top Red-Flag Ingredients Box
    ctx.fillStyle = '#94A3B8';
    ctx.font = '800 19px Inter, system-ui, sans-serif';
    ctx.fillText('KEY INGREDIENT FINDINGS (TOP RED FLAGS)', 72, currentY);
    currentY += 18;

    const topRisks = riskyIngredients.slice(0, 3);
    if (topRisks.length === 0) {
      drawRoundedRect(ctx, 72, currentY, 936, 110, 24);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.font = '800 26px Inter, system-ui, sans-serif';
      ctx.fillText('✓ Zero Harmful Additives or Synthetic Chemicals Detected', 104, currentY + 52);
      ctx.fillStyle = '#A7F3D0';
      ctx.font = '600 20px Inter, system-ui, sans-serif';
      ctx.fillText('Verified clean whole-food ingredient label.', 104, currentY + 84);
      currentY += 135;
    } else {
      topRisks.forEach(item => {
        const isHigh = item.risk === 'high';
        const rColor = isHigh ? '#EF4444' : '#F59E0B';
        drawRoundedRect(ctx, 72, currentY, 936, 98, 22);
        ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
        ctx.fill();
        ctx.strokeStyle = `${rColor}55`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Risk dot
        ctx.beginPath();
        ctx.arc(106, currentY + 36, 9, 0, Math.PI * 2);
        ctx.fillStyle = rColor;
        ctx.fill();

        // Additive Name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 25px Inter, system-ui, sans-serif';
        const cleanName = item.name.length > 42 ? item.name.slice(0, 40) + '...' : item.name;
        ctx.fillText(cleanName, 128, currentY + 44);

        // Risk Badge on Right
        const rTag = `${item.risk.toUpperCase()} RISK`;
        ctx.font = '800 16px Inter, system-ui, sans-serif';
        const rTagW = ctx.measureText(rTag).width + 28;
        drawRoundedRect(ctx, 980 - rTagW, currentY + 20, rTagW, 32, 10);
        ctx.fillStyle = `${rColor}28`;
        ctx.fill();
        ctx.fillStyle = rColor;
        ctx.fillText(rTag, 980 - rTagW + 14, currentY + 42);

        // 1-line impact description
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '500 19px Inter, system-ui, sans-serif';
        const impactLine = wrapCanvasText(
          ctx,
          item.implications || item.description || 'Biochemical additive concern.',
          850,
          1
        )[0];
        ctx.fillText(impactLine || '', 128, currentY + 76);

        currentY += 112;
      });
    }

    // 7. Recommended Clean Swap Box at Bottom
    const swapY = Math.max(currentY + 6, 1085);
    drawRoundedRect(ctx, 72, swapY, 936, 156, 28);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#10B981';
    ctx.font = '900 18px Inter, system-ui, sans-serif';
    ctx.fillText('★ RECOMMENDED CLEAN SWAP (HEALTHIER ALTERNATIVE)', 104, swapY + 38);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px Inter, system-ui, sans-serif';
    const swapTitle = wrapCanvasText(
      ctx,
      alternative?.name || 'Whole-Food Organic Alternative',
      870,
      1
    )[0];
    ctx.fillText(swapTitle, 104, swapY + 78);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '500 20px Inter, system-ui, sans-serif';
    const swapReasonLines = wrapCanvasText(
      ctx,
      alternative?.reason || 'Opt for minimally processed foods with clean whole-food ingredients.',
      870,
      2
    );
    swapReasonLines.forEach((l, idx) => {
      ctx.fillText(l, 104, swapY + 112 + idx * 26);
    });

    // 8. Footer Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = '700 18px Inter, system-ui, sans-serif';
    ctx.fillText(
      'SCAN THE LABEL. KNOW THE TRUTH. • GENERATED BY PURESCAN CLINICAL AI',
      540,
      1312
    );

    canvasRef.current = canvas;
    setCardDataUrl(canvas.toDataURL('image/png'));
  }, [isOpen, productName, grade, score, riskyIngredients, alternative, familyResults]);

  const buildShareCaption = () => {
    const emojiGrade =
      grade === 'A' || grade === 'B' ? '🟢' : grade === 'C' ? '🟡' : '🔴';
    const topFlags =
      riskyIngredients.length > 0
        ? riskyIngredients
            .slice(0, 3)
            .map(r => `• ${r.name} (${r.risk.toUpperCase()})`)
            .join('\n')
        : '• Zero harmful additives detected ✅';

    const familyLine =
      familyResults.length > 0
        ? `\n👨‍👩‍👧 *Family Guard:* ${familyResults
            .map(
              f =>
                `${f.member.name}: ${
                  f.status === 'safe' ? '✅ Safe' : f.status === 'caution' ? '⚠️ Caution' : '❌ Unsafe'
                }`
            )
            .join(' | ')}\n`
        : '\n';

    return `${emojiGrade} *PureScan AI Food Truth Card*\n📦 *Product:* ${productName}\n🏆 *Health Grade:* ${grade} (Score: ${score}/100)${familyLine}\n⚠️ *Key Findings:*\n${topFlags}\n\n🌱 *Healthier Swap:* ${
      alternative?.name || 'Clean Whole-Food Option'
    } — ${alternative?.reason || ''}\n\n_Scanned with PureScan Clinical AI_`;
  };

  const handleDownloadImage = () => {
    if (!cardDataUrl) return;
    const link = document.createElement('a');
    const safeName = (productName || 'Food_Item').replace(/[^a-z0-9]/gi, '_').slice(0, 25);
    link.href = cardDataUrl;
    link.download = `PureScan_TruthCard_${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildShareCaption());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleNativeOrWhatsAppShare = async () => {
    const caption = buildShareCaption();
    try {
      if (canvasRef.current && navigator.share) {
        const blob: Blob | null = await new Promise(res =>
          canvasRef.current?.toBlob(b => res(b), 'image/png')
        );
        if (blob) {
          const safeName = (productName || 'Food_Item').replace(/[^a-z0-9]/gi, '_').slice(0, 25);
          const file = new File([blob], `PureScan_TruthCard_${safeName}.png`, {
            type: 'image/png'
          });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `PureScan Truth Card: ${productName}`,
              text: caption,
              files: [file]
            });
            return;
          }
        }
        await navigator.share({
          title: `PureScan Truth Card: ${productName}`,
          text: caption
        });
        return;
      }
    } catch {
      // If user cancels or share fails in iframe, copy & download fallback
    }
    await handleCopySummary();
    handleDownloadImage();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="truth-card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          style={{ willChange: 'opacity' }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto transform-gpu"
        >
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/65"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-[32px] border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] transform-gpu"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between bg-gradient-to-r from-healthy-green/10 via-emerald-500/5 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-healthy-green text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                    Shareable Food Truth Card
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    1-Image Social & WhatsApp Family Group Card
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Generated Image Preview */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 bg-gray-50/70 dark:bg-slate-900/50">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200/80 dark:border-slate-800 bg-[#0B1120]">
                {cardDataUrl ? (
                  <img
                    src={cardDataUrl}
                    alt={`Food Truth Card for ${productName}`}
                    className="w-full h-auto block"
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center text-xs text-gray-400">
                    Rendering High-DPI Truth Card...
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  id="btn-share-truth-card"
                  onClick={handleNativeOrWhatsAppShare}
                  className="py-3 px-4 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-healthy-green/20 active:scale-98 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Truth Card</span>
                </button>

                <button
                  type="button"
                  id="btn-download-truth-card-png"
                  onClick={handleDownloadImage}
                  className="py-3 px-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4 text-healthy-green" />
                      <span>Saved PNG!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Image</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                id="btn-copy-whatsapp-truth-summary"
                onClick={handleCopySummary}
                className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied WhatsApp Summary to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy WhatsApp Text Summary</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

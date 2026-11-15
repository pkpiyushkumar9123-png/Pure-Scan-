import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Zap, 
  ArrowRightLeft, 
  Trophy, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  Copy, 
  Check, 
  Scale,
  Sparkles,
  Award,
  Minus,
  Download,
  Loader2,
  FileText,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { speakTextWithWebSpeech, stopVoiceSummary } from '../utils/familyAndVoiceUtils';
import { getAdditiveRegulatoryStatus, createFallbackRegulatoryInfo, AdditiveRegulatoryInfo } from '../utils/regulatoryTracker';
import { RegulatoryDetailModal } from './RegulatoryDetailModal';

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

interface ProductCompareModalProps {
  productA: ScanResult;
  productB: ScanResult;
  allHistory: ScanResult[];
  onClose: () => void;
  onSwap: () => void;
  onSelectProductA: (item: ScanResult) => void;
  onSelectProductB: (item: ScanResult) => void;
}

const getGradeTheme = (grade: string) => {
  switch (grade) {
    case 'A':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500 text-white',
        bar: 'bg-emerald-500',
        label: 'Clean & Pure'
      };
    case 'B':
      return {
        bg: 'bg-lime-500/10 dark:bg-lime-500/20',
        text: 'text-lime-700 dark:text-lime-300',
        border: 'border-lime-500/30',
        badge: 'bg-lime-500 text-white',
        bar: 'bg-lime-500',
        label: 'Low Risk'
      };
    case 'C':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500 text-white',
        bar: 'bg-amber-500',
        label: 'Moderate Risk'
      };
    case 'D':
      return {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-500/30',
        badge: 'bg-orange-500 text-white',
        bar: 'bg-orange-500',
        label: 'High Hazards'
      };
    default:
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500 text-white',
        bar: 'bg-rose-500',
        label: 'Critical Hazards'
      };
  }
};

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  productA,
  productB,
  allHistory,
  onClose,
  onSwap,
  onSelectProductA,
  onSelectProductB,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewTab, setViewTab] = useState<'side-by-side' | 'additives' | 'swaps'>('side-by-side');
  const [isSpeakingCompare, setIsSpeakingCompare] = useState(false);
  const [selectedRegModalInfo, setSelectedRegModalInfo] = useState<AdditiveRegulatoryInfo | null>(null);
  const [selectedJurisdictionFocus, setSelectedJurisdictionFocus] = useState<'FSSAI (India)' | 'EU EFSA' | 'US FDA' | null>(null);

  // Close on Escape key press & stop any active voice readout on unmount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRegModalInfo) {
          setSelectedRegModalInfo(null);
          return;
        }
        stopVoiceSummary();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      stopVoiceSummary();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const themeA = getGradeTheme(productA.grade);
  const themeB = getGradeTheme(productB.grade);

  // Normalize additive names for comparison
  const normalize = (name: string) => (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const comparisonStats = useMemo(() => {
    const listA = Array.isArray(productA.riskyIngredients) ? productA.riskyIngredients : [];
    const listB = Array.isArray(productB.riskyIngredients) ? productB.riskyIngredients : [];

    const highA = listA.filter(i => i?.risk === 'high').length;
    const medA = listA.filter(i => i?.risk === 'medium').length;
    const lowA = listA.filter(i => i?.risk === 'low').length;

    const highB = listB.filter(i => i?.risk === 'high').length;
    const medB = listB.filter(i => i?.risk === 'medium').length;
    const lowB = listB.filter(i => i?.risk === 'low').length;

    const namesA = new Map(listA.map(i => [normalize(i.name || ''), i]));
    const namesB = new Map(listB.map(i => [normalize(i.name || ''), i]));

    // Shared additives
    const shared: { nameA: string; nameB: string; riskA: string; riskB: string; description: string; implications: string }[] = [];
    listA.forEach(itemA => {
      const norm = normalize(itemA.name || '');
      if (norm && namesB.has(norm)) {
        const itemB = namesB.get(norm)!;
        shared.push({
          nameA: itemA.name,
          nameB: itemB.name,
          riskA: itemA.risk,
          riskB: itemB.risk,
          description: itemA.description || itemB.description,
          implications: itemA.implications || itemB.implications
        });
      }
    });

    // Unique to A
    const uniqueA = listA.filter(itemA => {
      const norm = normalize(itemA.name || '');
      return !norm || !namesB.has(norm);
    });

    // Unique to B
    const uniqueB = listB.filter(itemB => {
      const norm = normalize(itemB.name || '');
      return !norm || !namesA.has(norm);
    });

    // Score comparison
    const scoreDiff = (productA.score || 0) - (productB.score || 0);
    const scoreWinner = scoreDiff > 0 ? 'A' : scoreDiff < 0 ? 'B' : 'tie';

    // Total hazard comparison
    const hazardDiff = listA.length - listB.length;
    const hazardWinner = hazardDiff < 0 ? 'A' : hazardDiff > 0 ? 'B' : 'tie';

    // High risk comparison
    const highDiff = highA - highB;
    const highWinner = highDiff < 0 ? 'A' : highDiff > 0 ? 'B' : 'tie';

    return {
      listA,
      listB,
      highA,
      medA,
      lowA,
      highB,
      medB,
      lowB,
      shared,
      uniqueA,
      uniqueB,
      scoreDiff,
      scoreWinner,
      hazardDiff,
      hazardWinner,
      highDiff,
      highWinner,
    };
  }, [productA, productB]);

  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      const margin = 14;
      const contentWidth = pageWidth - margin * 2; // 182mm
      let currentY = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - 16) {
          doc.addPage();
          currentY = margin + 10;
          return true;
        }
        return false;
      };

      // Header Banner: Crisp High-Visibility Medical Header (No Black Bar)
      doc.setFillColor(248, 250, 252); // Light Medical Slate #F8FAFC
      doc.setDrawColor(203, 213, 225); // Border Slate #CBD5E1
      doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'FD');

      // Top decorative glowing accent in Healthy Green
      doc.setFillColor(52, 199, 89); // Healthy Green #34C759
      doc.rect(margin + 3, currentY, contentWidth - 6, 1.5, 'F');

      // Brand Title
      doc.setTextColor(15, 23, 42); // Crisp Charcoal Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('PURESCAN™ CLINICAL AUDIT', margin + 6, currentY + 9);

      // Subtitle
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('OFFICIAL SIDE-BY-SIDE BIOCHEMICAL PURITY & ADDITIVE REPORT', margin + 6, currentY + 15);

      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105); // Emerald / Healthy Green
      doc.text('DETERMINISTIC EVALUATION MATRIX • ZERO AI INFERENCE', margin + 6, currentY + 20);

      // Right-side reference & date box
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`DATE: ${dateStr}`, pageWidth - margin - 6, currentY + 10, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`DOC ID: PS-CMP-${Date.now().toString().slice(-6)}`, pageWidth - margin - 6, currentY + 16, { align: 'right' });
      doc.text('REGULATORY GRADE: FDA/EFSA/WHO', pageWidth - margin - 6, currentY + 21, { align: 'right' });

      currentY += 31;

      // SECTION 1: EXECUTIVE VERDICT (WINNER SPOTLIGHT)
      const isWinnerA = comparisonStats.scoreWinner === 'A';
      const isWinnerB = comparisonStats.scoreWinner === 'B';
      const isTie = comparisonStats.scoreWinner === 'tie';
      const winnerName = isWinnerA ? productA.productName : isWinnerB ? productB.productName : 'TIE / IDENTICAL RATING';

      // Verdict Box
      if (!isTie) {
        doc.setFillColor(240, 253, 244); // Light emerald
        doc.setDrawColor(52, 211, 153); // Emerald border
        doc.roundedRect(margin, currentY, contentWidth, 20, 2.5, 2.5, 'FD');

        doc.setTextColor(6, 95, 70); // Dark emerald
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(`EXECUTIVE VERDICT: ${winnerName.toUpperCase()} IS THE HEALTHIER CHOICE`, margin + 5, currentY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(21, 128, 61);
        doc.text(
          `Advantage: +${Math.abs(comparisonStats.scoreDiff)} purity delta points • ${Math.abs(comparisonStats.hazardDiff)} fewer total additive risks • ${Math.abs(comparisonStats.highDiff)} fewer high-hazard chemicals.`,
          margin + 5,
          currentY + 14
        );
      } else {
        doc.setFillColor(254, 243, 199); // Amber
        doc.setDrawColor(251, 191, 36);
        doc.roundedRect(margin, currentY, contentWidth, 18, 2.5, 2.5, 'FD');

        doc.setTextColor(146, 64, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('EXECUTIVE VERDICT: EQUAL BIOCHEMICAL SAFETY RATING', margin + 5, currentY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text('Both products exhibit identical composite purity scores and comparable additive risk profiles.', margin + 5, currentY + 13);
      }

      currentY += 24;

      // SECTION 2: SIDE-BY-SIDE PRODUCT SUMMARY CARDS
      const cardWidth = (contentWidth - 6) / 2; // 88mm each

      // Helper function to draw a product card
      const drawProductCard = (x: number, item: ScanResult, label: string, isWinner: boolean, theme: ReturnType<typeof getGradeTheme>, stats: { high: number; med: number; low: number; total: number }) => {
        // Background card
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(isWinner ? 16 : 226, isWinner ? 185 : 232, isWinner ? 129 : 240);
        doc.setLineWidth(isWinner ? 0.6 : 0.3);
        doc.roundedRect(x, currentY, cardWidth, 38, 2.5, 2.5, 'FD');

        // Card header tag
        doc.setFillColor(isWinner ? 16 : 100, isWinner ? 185 : 116, isWinner ? 129 : 139);
        doc.roundedRect(x + 4, currentY + 3.5, 24, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text(label, x + 6, currentY + 7);

        if (isWinner) {
          doc.setFillColor(209, 250, 229);
          doc.roundedRect(x + cardWidth - 28, currentY + 3.5, 24, 5, 1, 1, 'F');
          doc.setTextColor(6, 95, 70);
          doc.text('★ CLEANEST', x + cardWidth - 26, currentY + 7);
        }

        // Product Name (truncated if long)
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const splitTitle = doc.splitTextToSize(item.productName || 'Unlabeled Product', cardWidth - 8);
        doc.text(splitTitle[0] || '', x + 4, currentY + 14);

        // Grade Badge Box
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x + 4, currentY + 17, 24, 16, 2, 2, 'FD');

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(item.grade, x + 16, currentY + 25, { align: 'center' });
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`${item.score}/100`, x + 16, currentY + 30, { align: 'center' });

        // Stats summary beside grade
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`Purity: ${item.score}% (${theme.label})`, x + 32, currentY + 21);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105);
        doc.text(`Total Additives Flagged: ${stats.total}`, x + 32, currentY + 25.5);
        doc.text(`High Risk: ${stats.high} | Moderate: ${stats.med} | Low: ${stats.low}`, x + 32, currentY + 30);
      };

      drawProductCard(margin, productA, 'PRODUCT A', isWinnerA, themeA, {
        high: comparisonStats.highA,
        med: comparisonStats.medA,
        low: comparisonStats.lowA,
        total: comparisonStats.listA.length,
      });

      drawProductCard(margin + cardWidth + 6, productB, 'PRODUCT B', isWinnerB, themeB, {
        high: comparisonStats.highB,
        med: comparisonStats.medB,
        low: comparisonStats.lowB,
        total: comparisonStats.listB.length,
      });

      currentY += 43;

      // SECTION 3: HEAD-TO-HEAD MATRIX TABLE (Crisp Medical Header - No Black Bar)
      checkPageBreak(50);
      doc.setFillColor(236, 253, 245); // Medical Mint Emerald #ECFDF5
      doc.setDrawColor(167, 243, 208); // Emerald Border #A7F3D0
      doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, 'FD');

      doc.setTextColor(6, 95, 70); // Deep Emerald Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('METRIC / SAFETY PARAMETER', margin + 4, currentY + 4.8);
      doc.text('PRODUCT A', margin + 70, currentY + 4.8);
      doc.text('PRODUCT B', margin + 115, currentY + 4.8);
      doc.text('SAFETY ADVANTAGE', margin + 150, currentY + 4.8);

      currentY += 7;

      const matrixRows = [
        {
          param: 'Purity Score (0-100)',
          valA: `${productA.score}/100`,
          valB: `${productB.score}/100`,
          verdict: isWinnerA ? 'Product A Higher (+ ' + Math.abs(comparisonStats.scoreDiff) + ')' : isWinnerB ? 'Product B Higher (+ ' + Math.abs(comparisonStats.scoreDiff) + ')' : 'Equal (Tie)',
          highlight: true,
        },
        {
          param: 'Safety Grade',
          valA: `Grade ${productA.grade}`,
          valB: `Grade ${productB.grade}`,
          verdict: productA.grade < productB.grade ? 'Product A Safer' : productB.grade < productA.grade ? 'Product B Safer' : 'Equal Grade',
          highlight: false,
        },
        {
          param: 'Total Flagged Additives',
          valA: `${comparisonStats.listA.length} additives`,
          valB: `${comparisonStats.listB.length} additives`,
          verdict: comparisonStats.hazardWinner === 'A' ? 'Product A (Fewer)' : comparisonStats.hazardWinner === 'B' ? 'Product B (Fewer)' : 'Equal Count',
          highlight: false,
        },
        {
          param: 'High-Hazard Chemicals',
          valA: `${comparisonStats.highA} severe`,
          valB: `${comparisonStats.highB} severe`,
          verdict: comparisonStats.highWinner === 'A' ? 'Product A Cleaner' : comparisonStats.highWinner === 'B' ? 'Product B Cleaner' : 'Equal Risk',
          highlight: true,
        },
        {
          param: 'Moderate Dietary Additives',
          valA: `${comparisonStats.medA} moderate`,
          valB: `${comparisonStats.medB} moderate`,
          verdict: comparisonStats.medA < comparisonStats.medB ? 'Product A Cleaner' : comparisonStats.medB < comparisonStats.medA ? 'Product B Cleaner' : 'Equal',
          highlight: false,
        },
      ];

      matrixRows.forEach((row, rIdx) => {
        checkPageBreak(7);
        doc.setFillColor(rIdx % 2 === 0 ? 255 : 248, rIdx % 2 === 0 ? 255 : 250, rIdx % 2 === 0 ? 255 : 252);
        doc.rect(margin, currentY, contentWidth, 6.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, currentY + 6.5, margin + contentWidth, currentY + 6.5);

        doc.setFont('helvetica', row.highlight ? 'bold' : 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(row.param, margin + 4, currentY + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.text(row.valA, margin + 70, currentY + 4.5);
        doc.text(row.valB, margin + 115, currentY + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(row.verdict.includes('Product A') ? 16 : row.verdict.includes('Product B') ? 99 : 100, row.verdict.includes('Product A') ? 185 : row.verdict.includes('Product B') ? 102 : 116, row.verdict.includes('Product A') ? 129 : row.verdict.includes('Product B') ? 241 : 139);
        doc.text(row.verdict, margin + 150, currentY + 4.5);

        currentY += 6.5;
      });

      currentY += 5;

      // SECTION 4: ADDITIVES & HAZARDS BREAKDOWN
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, contentWidth, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('CHEMICAL & ADDITIVE HAZARD REGISTRY', margin + 4, currentY + 4.6);
      currentY += 9;

      // Subsection 4.1: Shared Additives
      if (comparisonStats.shared.length > 0) {
        checkPageBreak(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(180, 83, 9); // Amber
        doc.text(`SHARED ADDITIVES PRESENT IN BOTH PRODUCTS (${comparisonStats.shared.length})`, margin + 2, currentY);
        currentY += 4;

        comparisonStats.shared.forEach((item) => {
          checkPageBreak(12);
          doc.setFillColor(254, 243, 199);
          doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(146, 64, 14);
          doc.text(`• ${item.nameA}`, margin + 3, currentY + 4);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(180, 83, 9);
          doc.text(`[${(item.riskA || 'MED').toUpperCase()} RISK]`, margin + 60, currentY + 4);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(120, 53, 15);
          const desc = item.implications || item.description || 'Additive with potential dietary implications.';
          const wrapped = doc.splitTextToSize(desc, contentWidth - 85);
          doc.text(wrapped[0] || '', margin + 85, currentY + 4);

          currentY += 11.5;
        });
        currentY += 2;
      }

      // Subsection 4.2: Unique Additives
      const renderUniqueSection = (title: string, list: Ingredient[]) => {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`${title} (${list.length})`, margin + 2, currentY);
        currentY += 4;

        if (list.length === 0) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text('No exclusive flagged additives detected for this product.', margin + 4, currentY);
          currentY += 6;
          return;
        }

        list.forEach((item) => {
          checkPageBreak(12);
          doc.setFillColor(item.risk === 'high' ? 254 : 241, item.risk === 'high' ? 242 : 245, item.risk === 'high' ? 242 : 249);
          doc.roundedRect(margin, currentY, contentWidth, 10, 1.5, 1.5, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(item.risk === 'high' ? 153 : 30, item.risk === 'high' ? 27 : 41, item.risk === 'high' ? 27 : 59);
          doc.text(`• ${item.name}`, margin + 3, currentY + 4);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(item.risk === 'high' ? 190 : 180, item.risk === 'high' ? 18 : 83, item.risk === 'high' ? 60 : 9);
          doc.text(`[${(item.risk || 'MED').toUpperCase()} RISK]`, margin + 60, currentY + 4);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(71, 85, 105);
          const desc = item.implications || item.description || 'Dietary concern identified during screening.';
          const wrapped = doc.splitTextToSize(desc, contentWidth - 85);
          doc.text(wrapped[0] || '', margin + 85, currentY + 4);

          currentY += 11.5;
        });
        currentY += 2;
      };

      renderUniqueSection(`ADDITIVES EXCLUSIVE TO PRODUCT A (${productA.productName})`, comparisonStats.uniqueA);
      renderUniqueSection(`ADDITIVES EXCLUSIVE TO PRODUCT B (${productB.productName})`, comparisonStats.uniqueB);

      // SECTION 5: HEALTHIER ALTERNATIVES (SWAPS) - Dynamic Height & Zero Text Overlap
      checkPageBreak(38);
      const altNameA = productA.alternative?.name || 'Whole-Food Organic Alternative';
      const altReasonA = productA.alternative?.reason || 'Contains fewer synthetic additives, preservatives, and processing aids.';
      const altNameB = productB.alternative?.name || 'Whole-Food Organic Alternative';
      const altReasonB = productB.alternative?.reason || 'Contains fewer synthetic additives, preservatives, and processing aids.';

      // Calculate wrapped text to measure height dynamically
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const wrappedDescA = doc.splitTextToSize(`${altNameA} — ${altReasonA}`, contentWidth - 14);
      const wrappedDescB = doc.splitTextToSize(`${altNameB} — ${altReasonB}`, contentWidth - 14);

      const itemAHeight = 4.5 + (wrappedDescA.length * 3.5);
      const itemBHeight = 4.5 + (wrappedDescB.length * 3.5);
      const totalSwapsHeight = 10 + itemAHeight + itemBHeight + 4;

      checkPageBreak(totalSwapsHeight + 6);

      // Container Box (Clean Light Emerald - No Black Bar)
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(margin, currentY, contentWidth, totalSwapsHeight, 2, 2, 'FD');

      // Section Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(6, 95, 70);
      doc.text('RECOMMENDED CLEAN WHOLE-FOOD ALTERNATIVES (HEALTHY SWAPS)', margin + 4, currentY + 6);

      let swapCursorY = currentY + 11.5;

      // Product A swap: label on own line, text cleanly wrapped beneath
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(4, 120, 87);
      const labelA = `• Cleaner Alternative for ${productA.productName}:`;
      const truncatedLabelA = doc.splitTextToSize(labelA, contentWidth - 12)[0];
      doc.text(truncatedLabelA, margin + 4, swapCursorY);
      swapCursorY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(6, 95, 70);
      doc.text(wrappedDescA, margin + 7, swapCursorY);
      swapCursorY += (wrappedDescA.length * 3.5) + 3;

      // Product B swap: label on own line, text cleanly wrapped beneath
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(4, 120, 87);
      const labelB = `• Cleaner Alternative for ${productB.productName}:`;
      const truncatedLabelB = doc.splitTextToSize(labelB, contentWidth - 12)[0];
      doc.text(truncatedLabelB, margin + 4, swapCursorY);
      swapCursorY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(6, 95, 70);
      doc.text(wrappedDescB, margin + 7, swapCursorY);

      currentY += totalSwapsHeight + 6;

      // SECTION 6: OFFICIAL CLINICAL & REGULATORY SAFETY DISCLAIMER (End of Compare Report)
      const disclaimerParagraph = 'NOT A REPLACEMENT FOR MEDICAL OR CLINICAL ADVICE: This head-to-head comparison is generated deterministically by evaluating packaging ingredient nomenclature against published toxicological thresholds established by the FDA, EFSA, and WHO/FAO JECFA. PureScan does not diagnose, treat, prevent, or cure any medical condition. Formulations and cross-contamination risks may vary across production facilities and geographical markets. Individuals with acute allergies, autoimmune conditions, metabolic disorders, or clinical dietary requirements must prioritize physical packaging labels and consult licensed healthcare practitioners.';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      const wrappedDisclaimer = doc.splitTextToSize(disclaimerParagraph, contentWidth - 8);
      const disclaimerBoxHeight = 10 + (wrappedDisclaimer.length * 3.2);

      checkPageBreak(disclaimerBoxHeight + 8);
      doc.setFillColor(254, 243, 199); // Amber-100 Light Warning
      doc.setDrawColor(245, 158, 11); // Amber-500
      doc.roundedRect(margin, currentY, contentWidth, disclaimerBoxHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(146, 64, 14); // Amber-800
      doc.text('OFFICIAL CLINICAL & REGULATORY SAFETY DISCLAIMER', margin + 4, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(120, 53, 15); // Amber-900
      doc.text(wrappedDisclaimer, margin + 4, currentY + 10);

      currentY += disclaimerBoxHeight + 6;

      // SECTION 7: RUNNING HEADERS & FOOTERS ACROSS ALL PAGES
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Header line (pages 2+)
        if (i > 1) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text('PURESCAN CLINICAL HEALTH INTELLIGENCE • HEAD-TO-HEAD COMPARISON', margin, margin - 4);
          doc.text(`REF: PS-CMP-${Date.now().toString().slice(-6)}`, pageWidth - margin, margin - 4, { align: 'right' });
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, margin - 2, pageWidth - margin, margin - 2);
        }

        // Footer line (all pages)
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        doc.text('CONFIDENTIAL CLINICAL PURITY REPORT • GENERATED BY PURESCAN', margin, pageHeight - 6);
        doc.setFont('helvetica', 'bold');
        doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
      }

      // Save file
      const safeNameA = (productA.productName || 'PRODUCT_A').replace(/[^a-z0-9]/gi, '_').slice(0, 15).toUpperCase();
      const safeNameB = (productB.productName || 'PRODUCT_B').replace(/[^a-z0-9]/gi, '_').slice(0, 15).toUpperCase();
      const filename = `PureScan_Compare_${safeNameA}_vs_${safeNameB}.pdf`;

      doc.save(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      key="compare-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: 'opacity' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto transform-gpu"
    >
      {/* Dimmed backdrop with smooth click to exit */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65"
      />

      {/* Main modal dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
        transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
        style={{ willChange: 'transform, opacity' }}
        className="relative w-full max-w-4xl bg-white dark:bg-dark-card rounded-3xl border border-gray-200/90 dark:border-dark-border shadow-2xl flex flex-col max-h-[94vh] overflow-hidden my-auto z-10 transform-gpu"
      >
        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-dark-border bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-teal-500/10 dark:from-amber-950/30 dark:via-emerald-950/20 dark:to-teal-950/30">
          <div className="flex items-center justify-between gap-3">
            {/* Left Title Area */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 ring-2 ring-amber-300/30">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                    Product Comparison
                  </h2>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/80 dark:border-amber-700/80 shrink-0">
                    Direct Data • 0 AI
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate hidden sm:block">
                  Deterministic side-by-side purity audit & chemical hazard matrix
                </p>
              </div>
            </div>

            {/* Right Action Controls: Listen + Swap + Share + PROMINENT CLOSE BUTTON */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-listen-compare-verdict"
                onClick={() => {
                  if (isSpeakingCompare) {
                    stopVoiceSummary();
                    setIsSpeakingCompare(false);
                    return;
                  }
                  const winnerName =
                    comparisonStats.scoreWinner === 'A'
                      ? productA.productName
                      : comparisonStats.scoreWinner === 'B'
                      ? productB.productName
                      : null;
                  const script = winnerName
                    ? `PureScan Head-to-Head Comparison between ${productA.productName} and ${productB.productName}. The winner is ${winnerName}, with a purity advantage of ${Math.abs(comparisonStats.scoreDiff)} points and ${Math.abs(comparisonStats.hazardDiff)} fewer additive concerns. ${productA.productName} scored ${productA.score} out of 100 with Grade ${productA.grade}. ${productB.productName} scored ${productB.score} out of 100 with Grade ${productB.grade}. Disclaimer: This comparison is for educational purposes only and is not medical advice. Please verify physical product labels before consumption.`
                    : `PureScan Comparison between ${productA.productName} and ${productB.productName}. Both products are tied with a purity score of ${productA.score} out of 100 and Grade ${productA.grade}. Disclaimer: This comparison is for educational purposes only and is not medical advice. Please verify physical product labels before consumption.`;
                  const savedLang = localStorage.getItem('purescan_report_language') || 'en';
                  speakTextWithWebSpeech(
                    script,
                    savedLang,
                    0.96,
                    () => setIsSpeakingCompare(true),
                    () => setIsSpeakingCompare(false)
                  );
                }}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  isSpeakingCompare
                    ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                    : 'bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border-gray-200 dark:border-dark-border text-indigo-600 dark:text-indigo-400'
                }`}
                title="Listen to Spoken Comparison Summary"
              >
                {isSpeakingCompare ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {isSpeakingCompare ? 'Stop Audio' : 'Listen'}
                </span>
              </button>

              <button
                type="button"
                onClick={onSwap}
                className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-dark-border rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Swap Product A and B positions"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">Swap Sides</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border ${
                  downloadSuccess
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20'
                    : 'bg-healthy-green hover:bg-[#2db34f] text-white border-healthy-green/40 shadow-healthy-green/25'
                } disabled:opacity-60`}
                title="Download formatted Clinical PDF Comparison Report"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : downloadSuccess ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Download className="w-4 h-4 text-white" />
                )}
                <span className="hidden md:inline font-extrabold">
                  {isExporting ? 'Generating...' : downloadSuccess ? 'Downloaded!' : 'Download PDF'}
                </span>
              </button>

              {/* High-visibility Close Button in Top Right */}
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-gray-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ml-1"
                title="Close comparison modal (or press Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Winner Spotlight Card */}
          <div className="mt-3.5 p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-dark-card/95 border border-amber-200/90 dark:border-amber-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 ring-1 ring-amber-300/50">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                  {comparisonStats.scoreWinner === 'A' ? (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/50 underline-offset-2">
                        {productA.productName}
                      </span>
                      <span>is the cleaner, healthier product</span>
                    </>
                  ) : comparisonStats.scoreWinner === 'B' ? (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/50 underline-offset-2">
                        {productB.productName}
                      </span>
                      <span>is the cleaner, healthier product</span>
                    </>
                  ) : (
                    <span>Both products share an identical health rating</span>
                  )}
                </div>

                <div className="text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  {comparisonStats.scoreWinner !== 'tie' ? (
                    <>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{Math.abs(comparisonStats.scoreDiff)} purity delta
                      </span>
                      <span>•</span>
                      <span>
                        {Math.abs(comparisonStats.hazardDiff)}{' '}
                        {Math.abs(comparisonStats.hazardDiff) === 1 ? 'fewer additive concern' : 'fewer additive concerns'}
                      </span>
                    </>
                  ) : (
                    <span>Equal purity score and additive profile</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Score Delta Tag */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <div className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 flex items-center gap-2">
                <span>A: {productA.score}/100</span>
                <span className="text-gray-400">vs</span>
                <span>B: {productB.score}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Crisp High-Visibility Medical Bar (No Black Bar) */}
        <div className="w-full bg-slate-100/90 dark:bg-slate-800/90 border-y border-gray-200 dark:border-slate-700/80 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setViewTab('side-by-side')}
              className={`flex-1 sm:flex-initial py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-98 ${
                viewTab === 'side-by-side'
                  ? 'bg-healthy-green text-white shadow-md shadow-healthy-green/30 scale-[1.02]'
                  : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-healthy-green/50 shadow-xs'
              }`}
            >
              <Scale className={`w-4 h-4 ${viewTab === 'side-by-side' ? 'text-white' : 'text-healthy-green'}`} />
              <span>Side-by-Side Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('additives')}
              className={`flex-1 sm:flex-initial py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-98 ${
                viewTab === 'additives'
                  ? 'bg-healthy-green text-white shadow-md shadow-healthy-green/30 scale-[1.02]'
                  : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-healthy-green/50 shadow-xs'
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${viewTab === 'additives' ? 'text-white' : 'text-amber-500'}`} />
              <span>Hazard & Additives</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                viewTab === 'additives'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
              }`}>
                {comparisonStats.listA.length + comparisonStats.listB.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('swaps')}
              className={`flex-1 sm:flex-initial py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-98 ${
                viewTab === 'swaps'
                  ? 'bg-healthy-green text-white shadow-md shadow-healthy-green/30 scale-[1.02]'
                  : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 hover:border-healthy-green/50 shadow-xs'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${viewTab === 'swaps' ? 'text-white' : 'text-healthy-green'}`} />
              <span>Healthy Swaps</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SIDE-BY-SIDE OVERVIEW */}
          {viewTab === 'side-by-side' && (
            <div className="space-y-6">
              {/* Product Cards Row with VS badge */}
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column A */}
                <div className={`p-4 sm:p-5 rounded-2xl border ${themeA.border} ${themeA.bg} space-y-4 relative shadow-sm`}>
                  {comparisonStats.scoreWinner === 'A' && (
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Healthier
                    </span>
                  )}

                  <div className="space-y-1 pr-16 sm:pr-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                      Product A
                    </span>
                    
                    {/* Selector if multiple products */}
                    {allHistory.length > 2 ? (
                      <div className="relative mt-1">
                        <select
                          value={productA.id}
                          onChange={(e) => {
                            const found = allHistory.find(h => h.id === e.target.value);
                            if (found) onSelectProductA(found);
                          }}
                          className="w-full text-base sm:text-lg font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-300/80 dark:border-gray-600 pb-1 pr-6 truncate focus:outline-none cursor-pointer appearance-none"
                        >
                          {allHistory.map(h => (
                            <option key={h.id} value={h.id} className="dark:bg-slate-900 text-gray-900 dark:text-white">
                              {h.productName || 'Unlabeled'} (Grade {h.grade}, {h.score}/100)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1.5 pointer-events-none" />
                      </div>
                    ) : (
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate mt-1">
                        {productA.productName}
                      </h3>
                    )}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Scanned {new Date(productA.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Grade & Score Badge Card */}
                  <div className="p-3 bg-white/90 dark:bg-dark-card/90 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center gap-4 shadow-sm">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${themeA.border} ${themeA.bg}`}>
                      <span className={`text-2xl font-black ${themeA.text}`}>
                        {productA.grade}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-gray-600 dark:text-gray-300">
                        {productA.score}/100
                      </span>
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-extrabold ${themeA.text}`}>{themeA.label}</span>
                        <span className="font-mono font-black text-gray-900 dark:text-white">{productA.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${themeA.bar} rounded-full`}
                          style={{ width: `${Math.min(100, Math.max(0, productA.score))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Hazard Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/80 dark:bg-dark-card/80 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-rose-500 block">High Risk</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{comparisonStats.highA}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-dark-card/80 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-amber-500 block">Med Risk</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{comparisonStats.medA}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-dark-card/80 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Flagged</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{comparisonStats.listA.length}</span>
                    </div>
                  </div>
                </div>

                {/* Column B */}
                <div className={`p-4 sm:p-5 rounded-2xl border ${themeB.border} ${themeB.bg} space-y-4 relative shadow-sm`}>
                  {comparisonStats.scoreWinner === 'B' && (
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Healthier
                    </span>
                  )}

                  <div className="space-y-1 pr-16 sm:pr-0">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                      Product B
                    </span>

                    {/* Selector if multiple products */}
                    {allHistory.length > 2 ? (
                      <div className="relative mt-1">
                        <select
                          value={productB.id}
                          onChange={(e) => {
                            const found = allHistory.find(h => h.id === e.target.value);
                            if (found) onSelectProductB(found);
                          }}
                          className="w-full text-base sm:text-lg font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-300/80 dark:border-gray-600 pb-1 pr-6 truncate focus:outline-none cursor-pointer appearance-none"
                        >
                          {allHistory.map(h => (
                            <option key={h.id} value={h.id} className="dark:bg-slate-900 text-gray-900 dark:text-white">
                              {h.productName || 'Unlabeled'} (Grade {h.grade}, {h.score}/100)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1.5 pointer-events-none" />
                      </div>
                    ) : (
                      <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white truncate mt-1">
                        {productB.productName}
                      </h3>
                    )}
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Scanned {new Date(productB.timestamp).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Grade & Score Badge Card */}
                  <div className="p-3 bg-white/90 dark:bg-dark-card/90 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center gap-4 shadow-sm">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${themeB.border} ${themeB.bg}`}>
                      <span className={`text-2xl font-black ${themeB.text}`}>
                        {productB.grade}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-gray-600 dark:text-gray-300">
                        {productB.score}/100
                      </span>
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-extrabold ${themeB.text}`}>{themeB.label}</span>
                        <span className="font-mono font-black text-gray-900 dark:text-white">{productB.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${themeB.bar} rounded-full`}
                          style={{ width: `${Math.min(100, Math.max(0, productB.score))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Hazard Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/80 dark:bg-dark-card/80 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-rose-500 block">High Risk</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{comparisonStats.highB}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-dark-card/80 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-amber-500 block">Med Risk</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{comparisonStats.medB}</span>
                    </div>
                    <div className="bg-white/80 dark:bg-dark-card/80 p-2.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-2xs">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Total Flagged</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{comparisonStats.listB.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Metrics Comparison Matrix Table */}
              <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm overflow-hidden">
                <div className="p-3.5 bg-gray-50 dark:bg-slate-900/60 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-500" />
                    Head-to-Head Comparison Matrix
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Deterministic Metric Breakdown
                  </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
                  {/* Row 1: Health Score */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-4">
                    <div className="w-1/3 text-gray-600 dark:text-gray-400 font-bold flex items-center gap-1.5">
                      <span>Purity Score</span>
                    </div>
                    <div className={`w-1/3 text-center font-mono font-black ${
                      comparisonStats.scoreWinner === 'A' 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-lg' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {productA.score}/100 {comparisonStats.scoreWinner === 'A' && '✓'}
                    </div>
                    <div className={`w-1/3 text-center font-mono font-black ${
                      comparisonStats.scoreWinner === 'B' 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-lg' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {productB.score}/100 {comparisonStats.scoreWinner === 'B' && '✓'}
                    </div>
                  </div>

                  {/* Row 2: Safety Grade */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-4">
                    <div className="w-1/3 text-gray-600 dark:text-gray-400 font-bold">
                      Safety Grade
                    </div>
                    <div className="w-1/3 text-center font-extrabold">
                      <span className={`px-2.5 py-1 rounded-lg ${themeA.bg} ${themeA.text}`}>
                        Grade {productA.grade}
                      </span>
                    </div>
                    <div className="w-1/3 text-center font-extrabold">
                      <span className={`px-2.5 py-1 rounded-lg ${themeB.bg} ${themeB.text}`}>
                        Grade {productB.grade}
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Flagged Additives */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-4">
                    <div className="w-1/3 text-gray-600 dark:text-gray-400 font-bold">
                      Flagged Additives
                    </div>
                    <div className={`w-1/3 text-center font-mono font-black ${
                      comparisonStats.hazardWinner === 'A' 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-lg' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {comparisonStats.listA.length} {comparisonStats.hazardWinner === 'A' && '(Fewer ✓)'}
                    </div>
                    <div className={`w-1/3 text-center font-mono font-black ${
                      comparisonStats.hazardWinner === 'B' 
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-lg' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {comparisonStats.listB.length} {comparisonStats.hazardWinner === 'B' && '(Fewer ✓)'}
                    </div>
                  </div>

                  {/* Row 4: Critical High Hazards */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-4">
                    <div className="w-1/3 text-gray-600 dark:text-gray-400 font-bold">
                      High-Hazard Chemicals
                    </div>
                    <div className={`w-1/3 text-center font-mono font-black ${
                      comparisonStats.highA === 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {comparisonStats.highA} {comparisonStats.highA === 0 && '✓'}
                    </div>
                    <div className={`w-1/3 text-center font-mono font-black ${
                      comparisonStats.highB === 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {comparisonStats.highB} {comparisonStats.highB === 0 && '✓'}
                    </div>
                  </div>

                  {/* Row 5: Moderate Concerns */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-4">
                    <div className="w-1/3 text-gray-600 dark:text-gray-400 font-bold">
                      Moderate Additives
                    </div>
                    <div className="w-1/3 text-center font-mono font-black text-amber-600 dark:text-amber-400">
                      {comparisonStats.medA}
                    </div>
                    <div className="w-1/3 text-center font-mono font-black text-amber-600 dark:text-amber-400">
                      {comparisonStats.medB}
                    </div>
                  </div>

                  {/* Row 6: Recommended Healthy Swap */}
                  <div className="p-3 sm:p-3.5 flex items-center justify-between gap-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="w-1/3 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Cleaner Swap</span>
                    </div>
                    <div className="w-1/3 text-center text-emerald-900 dark:text-emerald-200 font-bold text-[11px] truncate px-1">
                      {productA.alternative?.name || 'Organic Whole-Food'}
                    </div>
                    <div className="w-1/3 text-center text-emerald-900 dark:text-emerald-200 font-bold text-[11px] truncate px-1">
                      {productB.alternative?.name || 'Organic Whole-Food'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HAZARD & ADDITIVES BREAKDOWN */}
          {viewTab === 'additives' && (
            <div className="space-y-6">
              {/* Shared Additives (In Both) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Shared Chemical Additives ({comparisonStats.shared.length})
                    </h4>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    Found in both products
                  </span>
                </div>

                {comparisonStats.shared.length === 0 ? (
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 italic py-2">
                    Zero shared chemical additives! Neither product contains common flagged additives.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {comparisonStats.shared.map((item, idx) => {
                      const regInfo = getAdditiveRegulatoryStatus(item.nameA, `${item.description || ''} ${item.implications || ''}`);
                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-dark-card border border-amber-100 dark:border-dark-border text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-gray-900 dark:text-white">
                              {item.nameA}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.riskA === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}>
                              {item.riskA.toUpperCase()} RISK
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          {item.implications && (
                            <p className="text-rose-600 dark:text-rose-400 text-[10px] font-semibold leading-relaxed">
                              Health impact: {item.implications}
                            </p>
                          )}
                          {regInfo && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {regInfo.rulings.map(r => (
                                <button
                                  type="button"
                                  key={r.agency}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedJurisdictionFocus(r.agency);
                                    setSelectedRegModalInfo(regInfo);
                                  }}
                                  title={`Tap to view why it's flagged and statutory law under ${r.agency}`}
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                                    r.level === 'banned'
                                      ? 'bg-rose-600 text-white border-rose-600'
                                      : r.level === 'warning'
                                      ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-400/50 hover:bg-amber-200'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {r.flag} {r.agency}: {r.badge} ↗
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unique to Product A vs Product B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unique to A */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-2.5">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[200px]">
                        Only in {productA.productName}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {comparisonStats.uniqueA.length} exclusive additives
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${themeA.bg} ${themeA.text}`}>
                      Product A
                    </span>
                  </div>

                  {comparisonStats.uniqueA.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                      Zero exclusive additives flagged.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {comparisonStats.uniqueA.map((item, idx) => {
                        const regInfo = getAdditiveRegulatoryStatus(item.name, `${item.description || ''} ${item.implications || ''}`);
                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-dark-border text-xs space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-gray-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.risk === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {item.risk}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {item.description}
                              </p>
                            )}
                            {regInfo && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {regInfo.rulings.map(r => (
                                  <button
                                    type="button"
                                    key={r.agency}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedJurisdictionFocus(r.agency);
                                      setSelectedRegModalInfo(regInfo);
                                    }}
                                    title={`Tap to view why it's flagged and statutory law under ${r.agency}`}
                                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                                      r.level === 'banned'
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : r.level === 'warning'
                                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-400/50 hover:bg-amber-200'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    {r.flag} {r.badge} ↗
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Unique to B */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-2.5">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[200px]">
                        Only in {productB.productName}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {comparisonStats.uniqueB.length} exclusive additives
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${themeB.bg} ${themeB.text}`}>
                      Product B
                    </span>
                  </div>

                  {comparisonStats.uniqueB.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                      Zero exclusive additives flagged.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {comparisonStats.uniqueB.map((item, idx) => {
                        const regInfo = getAdditiveRegulatoryStatus(item.name, `${item.description || ''} ${item.implications || ''}`);
                        return (
                          <div key={idx} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-dark-border text-xs space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-gray-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.risk === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {item.risk}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                {item.description}
                              </p>
                            )}
                            {regInfo && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {regInfo.rulings.map(r => (
                                  <button
                                    type="button"
                                    key={r.agency}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedJurisdictionFocus(r.agency);
                                      setSelectedRegModalInfo(regInfo);
                                    }}
                                    title={`Tap to view why it's flagged and statutory law under ${r.agency}`}
                                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                                      r.level === 'banned'
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : r.level === 'warning'
                                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-400/50 hover:bg-amber-200'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                    }`}
                                  >
                                    {r.flag} {r.badge} ↗
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEALTHY SWAPS - Zero Text Overlap Layout */}
          {viewTab === 'swaps' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Swap A */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-border pb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate min-w-0">
                      Swap for {productA.productName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 shrink-0">
                      Product A
                    </span>
                  </div>

                  {productA.alternative?.name ? (
                    <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-mono">
                            Recommended Whole Food Swap
                          </span>
                          <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200 break-words mt-0.5 leading-snug">
                            {productA.alternative.name}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-900/85 dark:text-emerald-300/85 leading-relaxed break-words pl-6.5">
                        {productA.alternative.reason}
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                      No swap registered for this product.
                    </div>
                  )}
                </div>

                {/* Swap B */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-border pb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate min-w-0">
                      Swap for {productB.productName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 shrink-0">
                      Product B
                    </span>
                  </div>

                  {productB.alternative?.name ? (
                    <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-mono">
                            Recommended Whole Food Swap
                          </span>
                          <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200 break-words mt-0.5 leading-snug">
                            {productB.alternative.name}
                          </h4>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-900/85 dark:text-emerald-300/85 leading-relaxed break-words pl-6.5">
                        {productB.alternative.reason}
                      </p>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500 italic">
                      No swap registered for this product.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OFFICIAL CLINICAL & REGULATORY SAFETY DISCLAIMER (End of Compare Report) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 text-amber-950 dark:text-amber-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Official Clinical & Regulatory Safety Disclaimer
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded">
                REGULATORY GRADE
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-300/90 font-medium">
              <strong>Not a Replacement for Professional Medical Advice:</strong> This side-by-side comparison report is deterministically computed by evaluating declared packaging ingredient nomenclature against international food additive registries (FDA, EFSA, WHO/FAO JECFA, and published peer-reviewed biochemical indexes). PureScan does not diagnose, treat, prevent, or cure any disease or medical condition. Formulations and manufacturing cross-contamination risks may vary across batches, regions, and production lines. Individuals with severe allergies, metabolic conditions, autoimmune disorders, or clinical dietary requirements must prioritize physical packaging labels and consult licensed healthcare practitioners.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-[10px] text-amber-800/80 dark:text-amber-400/80 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Deterministic Registry Logic
              </span>
              <span>•</span>
              <span>Zero AI Speculation</span>
              <span>•</span>
              <span>Always Verify Physical Labels</span>
            </div>
          </div>

          {/* Zero AI Guarantee & Footer */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200/70 dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-gray-500 dark:text-gray-400 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Pure Deterministic Comparison:</strong> Calculated instantly from ingredient registries without neural network or AI model calls.
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer self-end sm:self-auto"
            >
              Close
            </button>
          </div>
        </div>

        {/* Global Regulatory Ban & Warning Detail Modal */}
        <RegulatoryDetailModal
          isOpen={!!selectedRegModalInfo}
          onClose={() => {
            setSelectedRegModalInfo(null);
            setSelectedJurisdictionFocus(null);
          }}
          info={selectedRegModalInfo}
          productName={productA?.productName}
          selectedJurisdiction={selectedJurisdictionFocus}
        />
      </motion.div>
    </motion.div>
  );
};

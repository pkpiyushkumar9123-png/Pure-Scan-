import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Scan, 
  History, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  Loader2,
  X,
  Info,
  ChevronDown,
  CameraOff,
  RefreshCw,
  Crop as CropIcon,
  Check,
  Edit3,
  Search,
  Heart,
  Smartphone,
  Download,
  Zap,
  ShieldCheck,
  Globe,
  Moon,
  Sun,
  Share2,
  FileText,
  HelpCircle,
  Activity,
  Cpu,
  Eye,
  EyeOff,
  ExternalLink,
  Sliders,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Flame,
  Layers,
  CheckSquare,
  RotateCw,
  Maximize2,
  Volume2,
  VolumeX,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';

enum SchemaType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  INTEGER = "INTEGER",
  BOOLEAN = "BOOLEAN",
  ARRAY = "ARRAY",
  OBJECT = "OBJECT",
}
const Type = SchemaType;
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { RulesAndThresholdsView } from './components/RulesAndThresholdsView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { SettingsView } from './components/SettingsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FoodTruthCardModal } from './components/FoodTruthCardModal';
import { RegulatoryDetailModal } from './components/RegulatoryDetailModal';
import { FeedbackWidget } from './components/FeedbackWidget';
import { SettingsSubNav } from './components/SettingsSubNav';
import { openTallyFeedback } from './utils/tallyFeedback';
import { getPureScanQrCodeDataUrl, PURESCAN_WEB_URL, PURESCAN_FULL_URL } from './utils/qrCodeUtils';
import {
  FamilyMemberProfile,
  DEFAULT_FAMILY_PROFILES,
  evaluateFamilyCompatibility,
  buildLocalizedVoiceScript,
  speakTextWithWebSpeech,
  stopVoiceSummary
} from './utils/familyAndVoiceUtils';
import {
  getAdditiveRegulatoryStatus,
  analyzeProductRegulatoryProfile,
  createFallbackRegulatoryInfo,
  AdditiveRegulatoryInfo
} from './utils/regulatoryTracker';
import { getReportOntology, getAppUiStrings, ALL_REPORT_LANGUAGES, ALL_APP_LANGUAGES } from './languages';

// --- Types ---
interface Ingredient {
  name: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  implications: string;
}

interface DemographicSafetyMatrix {
  children: 'safe' | 'caution' | 'avoid';
  diabetics: 'safe' | 'caution' | 'avoid';
  fitness: 'safe' | 'caution' | 'avoid';
  general: 'safe' | 'caution' | 'avoid';
}

interface ScanResult {
  id: string;
  timestamp: number;
  productName: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 0-100
  confidenceScore?: number; // 0-100
  targetAudience?: string;
  targetMarketingAnalysis?: string;
  demographicRiskAlert?: string;
  novaGroup?: number;
  processingLevel?: string;
  glycemicImpact?: string;
  endocrineOrMetabolicAlerts?: string[];
  demographicSafety?: DemographicSafetyMatrix;
  scoreExplanation?: string;
  riskyIngredients: Ingredient[];
  alternative: {
    name: string;
    reason: string;
  };
}

// --- Mock Data ---
const MOCK_RESULT: ScanResult = {
  id: 'mock-1',
  timestamp: Date.now(),
  productName: "Ultra-Processed Granola Bar",
  grade: 'D',
  score: 35,
  targetAudience: "Children & School Lunchboxes",
  targetMarketingAnalysis: "Engineered with wholesome oats branding and bright cartoon illustrations to target children and school lunchboxes, while concealing 38% added sugars, petroleum dyes (Red 40), and industrial palm oil.",
  demographicRiskAlert: "Pediatric Vulnerability Warning: Developing nervous systems and intestinal linings have heightened sensitivity to synthetic petroleum dyes (Red 40) and high fructose corn syrup, triggering behavioral agitation and insulin resistance.",
  novaGroup: 4,
  processingLevel: "NOVA 4 — Ultra-Processed Food (UPF)",
  glycemicImpact: "Extreme (Rapid Glucose Spike)",
  endocrineOrMetabolicAlerts: [
    "Hepatic De Novo Lipogenesis (HFCS)",
    "Pediatric Neuro-Behavioral Sensitivity (Red 40)",
    "Lipid Peroxidation Risk (Refined Palm Oil)"
  ],
  demographicSafety: {
    children: 'avoid',
    diabetics: 'avoid',
    fitness: 'caution',
    general: 'caution'
  },
  scoreExplanation: "Starting Base 100. Deducted -15 pts for predatory pediatric targeting with Red 40, -15 pts for NOVA 4 industrial formulation, -25 pts for High Fructose Corn Syrup, and -10 pts for Palm Oil, resulting in final calibrated score 35 (Grade D).",
  riskyIngredients: [
    { 
      name: "High Fructose Corn Syrup", 
      risk: 'high', 
      description: "A highly refined sweetener made from corn starch.",
      implications: "Regular consumption is linked to increased risk of obesity, type 2 diabetes, and non-alcoholic fatty liver disease. It bypasses normal digestion and goes straight to the liver, triggering fat production."
    },
    { 
      name: "Palm Oil", 
      risk: 'medium', 
      description: "An edible vegetable oil derived from the fruit of oil palms.",
      implications: "High in saturated fats which can raise LDL (bad) cholesterol levels. Large-scale production is also a major driver of deforestation and habitat loss for endangered species."
    },
    { 
      name: "Artificial Flavors", 
      risk: 'medium', 
      description: "Chemical mixtures created in labs to mimic natural tastes.",
      implications: "While generally recognized as safe, some people experience sensitivities or allergic reactions. They are often used to mask the lack of real ingredients in highly processed foods."
    },
    { 
      name: "Red 40", 
      risk: 'high', 
      description: "A synthetic food dye derived from petroleum.",
      implications: "Some studies suggest a link to hyperactivity and behavioral issues in children. It is banned or requires warning labels in several European countries due to potential health concerns."
    }
  ],
  alternative: {
    name: "Kind Whole Grain Bar",
    reason: "Contains 50% less sugar and uses natural honey as a sweetener."
  }
};

const YOUTUBE_VIDEOS = [
  { id: '1', title: "Hidden Sugars in 'Healthy' Snacks", thumbnail: "https://picsum.photos/seed/sugar/320/180" },
  { id: '2', title: "The Truth About Granola Bars", thumbnail: "https://picsum.photos/seed/granola/320/180" },
  { id: '3', title: "How to Read Food Labels Like a Pro", thumbnail: "https://picsum.photos/seed/labels/320/180" },
];

// --- Components & API Helpers ---

const PURESCAN_LOGO_URL = "https://res.cloudinary.com/usgqcqre/image/upload/f_auto,q_auto/1000008434";

const optimizeImageBase64 = async (base64Data: string, maxDimension = 1800, quality = 0.88): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Data || !base64Data.startsWith('data:image')) {
      return resolve(base64Data);
    }
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Data);
        // Adaptive image enhancement for blurry, low-contrast, or dim camera photos:
        // Boost contrast and crispness so fine/blurry packaging print is sharp for AI OCR
        ctx.filter = 'contrast(1.12) brightness(1.02) saturate(1.04)';
        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = 'none';
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        console.warn("Image optimization fallback:", err);
        resolve(base64Data);
      }
    };
    img.onerror = () => resolve(base64Data);
    img.src = base64Data;
  });
};

const rotateImageBase64 = (imageSrc: string, degrees: number): Promise<string> => {
  const normDeg = ((degrees % 360) + 360) % 360;
  if (normDeg === 0) return Promise.resolve(imageSrc);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);

        const isSwap = normDeg === 90 || normDeg === 270;
        canvas.width = isSwap ? image.height : image.width;
        canvas.height = isSwap ? image.width : image.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((normDeg * Math.PI) / 180);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch (e) {
        console.warn("Image rotation fallback:", e);
        resolve(imageSrc);
      }
    };
    image.onerror = () => resolve(imageSrc);
    image.src = imageSrc;
  });
};

const cleanAndParseJson = (text: string) => {
  if (!text) throw new Error("Received empty response from AI engine.");
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.search(/[\{\[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
};

async function callGeminiApi({
  contents,
  config,
  model,
  customApiKey,
  provider,
  timeoutMs = 12000
}: {
  contents: any;
  config?: any;
  model?: string;
  customApiKey?: string;
  provider?: 'gemini' | 'groq';
  timeoutMs?: number;
}): Promise<{ text: string; usageMetadata?: any; modelUsed?: string }> {
  let lastError: Error | null = null;
  
  const activeProvider = provider || (typeof window !== 'undefined' ? (localStorage.getItem('purescan_ai_provider') as 'gemini' | 'groq') : 'gemini') || 'gemini';
  const isGroq = activeProvider === 'groq';
  const maxAttempts = isGroq ? 3 : 2;

  const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gemini-3.5-flash-lite';
  const activeModel = model || defaultModel;

  const activeKey = customApiKey?.trim() || (typeof window !== 'undefined' ? (isGroq ? localStorage.getItem('GROQ_API_KEY')?.trim() : localStorage.getItem('GEMINI_API_KEY')?.trim()) : '') || undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const endpoint = isGroq ? `/api/groq/generate${search}` : `/api/gemini/generate${search}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          contents,
          config,
          model: activeModel,
          customApiKey: activeKey
        })
      });

      clearTimeout(timer);

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();
      let data: any = null;

      if (contentType.includes('application/json') || rawText.trim().startsWith('{')) {
        try {
          data = JSON.parse(rawText);
        } catch {
          // not JSON
        }
      }

      // If Vercel or proxy returned HTML (e.g. 404/405/504 from misconfigured rewrites or cold starts)
      if (!data) {
        if (response.status === 404 || response.status === 405) {
          throw new Error(
            isGroq
              ? "Groq Cloud endpoint unavailable on this deployment. Please verify GROQ_API_KEY or paste your key in Settings."
              : "API endpoint unavailable on your deployment. Please ensure GEMINI_API_KEY is configured in Vercel Environment Variables, or enter your free Gemini API key in Settings."
          );
        }
        if (response.status === 504 || response.status === 502) {
          throw new Error("Server took too long to respond. Please tap Scan again.");
        }
        throw new Error(`Server temporarily unavailable (${response.status}). Please tap Scan again.`);
      }

      if (!response.ok) {
        const errorMsg = data?.error || `Server error (${response.status}): Failed to call ${isGroq ? 'Groq Cloud AI' : 'Gemini API'}.`;
        if (attempt < maxAttempts && (response.status === 405 || response.status === 429 || response.status >= 500)) {
          console.warn(`[AI Proxy] Attempt ${attempt} failed with ${response.status}. Retrying...`);
          const backoffTime = response.status === 429 ? 1200 : 500;
          await new Promise(r => setTimeout(r, backoffTime));
          continue;
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      const msg = err?.name === 'AbortError' ? "Connection timed out. Please try again." : (err?.message || "");
      if (
        err?.name === 'AbortError' ||
        msg.includes("timed out") ||
        msg.includes("invalid or unauthorized") ||
        msg.includes("Face detected") ||
        msg.includes("Safety override") ||
        msg.includes("API endpoint unavailable") ||
        msg.includes("GROQ_API_KEY")
      ) {
        throw new Error(msg);
      }
      if (attempt < maxAttempts) {
        console.warn(`[AI Proxy] Attempt ${attempt} failed: ${msg}. Retrying in ${attempt * 400}ms...`);
        await new Promise(r => setTimeout(r, 400 * attempt));
        continue;
      }
      throw new Error(msg);
    }
  }

  throw lastError || new Error(`Failed to communicate with ${isGroq ? 'Groq Cloud AI' : 'AI server'}. Please try again.`);
}

const getHealthScoreColor = (grade?: string, score?: number): string => {
  if (grade === 'A' || (score !== undefined && score >= 80)) return '#10B981'; // emerald-500
  if (grade === 'B' || (score !== undefined && score >= 60)) return '#84CC16'; // lime-500
  if (grade === 'C' || (score !== undefined && score >= 40)) return '#F59E0B'; // amber-500
  if (grade === 'D' || (score !== undefined && score >= 20)) return '#F97316'; // orange-500
  return '#EF4444'; // red-500
};

const CircularProgress = ({ score, grade }: { score: number; grade: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getHealthScoreColor(grade, score);

  return (
    <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          className="text-gray-100 dark:text-slate-800"
          strokeWidth="8"
          fill="transparent"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-black leading-none" 
          style={{ color }}
        >
          {grade}
        </motion.span>
        <span className="text-[10px] font-bold tracking-widest text-gray-400 mt-1 uppercase">Score {score}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [status, setStatus] = useState<'idle' | 'detecting' | 'cropping' | 'extracting' | 'editing' | 'analyzing' | 'result'>('idle');
  const [activeTab, setActiveTab] = useState('scan');
  const [showProfile, setShowProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [extractedIngredients, setExtractedIngredients] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('GEMINI_API_KEY') || '';
    } catch {
      return '';
    }
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiProvider, setAiProvider] = useState<'gemini' | 'groq'>(() => {
    try {
      return (localStorage.getItem('purescan_ai_provider') as 'gemini' | 'groq') || 'gemini';
    } catch {
      return 'gemini';
    }
  });
  const [customGroqApiKey, setCustomGroqApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('GROQ_API_KEY') || '';
    } catch {
      return '';
    }
  });
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    try {
      return localStorage.getItem('purescan_terms_accepted') === 'true';
    } catch {
      return true;
    }
  });
  const [anonymousAnalytics, setAnonymousAnalytics] = useState<boolean>(() => {
    try {
      return localStorage.getItem('purescan_anonymous_analytics') === 'true';
    } catch {
      return true;
    }
  });
  const [geminiThinkingLevel, setGeminiThinkingLevel] = useState<'MEDIUM' | 'HIGH'>(() => {
    try {
      const saved = localStorage.getItem('purescan_gemini_thinking_level');
      if (saved === 'HIGH') return 'HIGH';
      return 'MEDIUM';
    } catch {
      return 'MEDIUM';
    }
  });

  const handleUpdateGeminiThinkingLevel = (level: 'MEDIUM' | 'HIGH') => {
    setGeminiThinkingLevel(level);
    try {
      localStorage.setItem('purescan_gemini_thinking_level', level);
    } catch (e) {
      console.warn("Failed to persist thinking level", e);
    }
  };

  const [autoScan, setAutoScan] = useState<boolean>(() => {
    try {
      return localStorage.getItem('purescan_auto_scan') === 'true';
    } catch {
      return false;
    }
  });
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('purescan_dietary_preferences');
      return saved ? JSON.parse(saved) : ['Peanuts', 'Wheat / Gluten'];
    } catch {
      return ['Peanuts', 'Wheat / Gluten'];
    }
  });
  const [dietaryLifestylePreferences, setDietaryLifestylePreferences] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('purescan_dietary_lifestyle_preferences');
      return saved ? JSON.parse(saved) : ['Vegetarian', 'No Artificial Dyes'];
    } catch {
      return ['Vegetarian', 'No Artificial Dyes'];
    }
  });
  const [allergenDietaryEnabled, setAllergenDietaryEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('purescan_allergen_dietary_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [allergensEnabled, setAllergensEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('purescan_allergens_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [dietaryEnabled, setDietaryEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('purescan_dietary_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [familyGuardEnabled, setFamilyGuardEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('purescan_family_guard_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [familyProfiles, setFamilyProfiles] = useState<FamilyMemberProfile[]>(() => {
    try {
      const saved = localStorage.getItem('purescan_family_profiles');
      return saved ? JSON.parse(saved) : DEFAULT_FAMILY_PROFILES;
    } catch {
      return DEFAULT_FAMILY_PROFILES;
    }
  });
  const [isSpeakingResult, setIsSpeakingResult] = useState(false);
  const [showTruthCardModal, setShowTruthCardModal] = useState(false);
  const [selectedRegulatoryModalInfo, setSelectedRegulatoryModalInfo] = useState<AdditiveRegulatoryInfo | null>(null);
  const [selectedJurisdictionFocus, setSelectedJurisdictionFocus] = useState<'FSSAI (India)' | 'EU EFSA' | 'US FDA' | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [externalTriggerFeedback, setExternalTriggerFeedback] = useState<boolean>(false);

  const handleOpenFeedback = () => {
    openTallyFeedback(() => {
      setExternalTriggerFeedback(true);
    });
  };

  useEffect(() => {
    getPureScanQrCodeDataUrl().then(url => {
      if (url) setQrCodeDataUrl(url);
    });
  }, []);
  const [reportLanguage, setReportLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('purescan_report_language') || 'en';
    } catch {
      return 'en';
    }
  });
  const [appLanguage, setAppLanguage] = useState<string>(() => {
    try {
      return localStorage.getItem('purescan_app_language') || 'en';
    } catch {
      return 'en';
    }
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('purescan_dark_mode');
      if (saved !== null) return saved === 'true';
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      return false;
    }
    return false;
  });
  const [showLegalView, setShowLegalView] = useState<'none' | 'disclaimer' | 'privacy' | 'terms'>('none');
  const [showRulesView, setShowRulesView] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!hasAcceptedTerms);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [showKeyTutorial, setShowKeyTutorial] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [lastPdfBlob, setLastPdfBlob] = useState<Blob | null>(null);
  const [lastPdfUrl, setLastPdfUrl] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Real-time API Usage and Quota Analytics State ---
  const [apiLogs, setApiLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('purescan_api_usage_stats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordApiCall = (response: any, type: string, durationMs?: number) => {
    try {
      const isGroq = aiProvider === 'groq';
      const isCustom = isGroq ? !!customGroqApiKey : !!customApiKey;
      let tokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;
      if (response?.usageMetadata?.totalTokenCount) {
        tokens = response.usageMetadata.totalTokenCount;
        promptTokens = response.usageMetadata.promptTokenCount || Math.round(tokens * 0.7);
        completionTokens = response.usageMetadata.candidatesTokenCount || (tokens - promptTokens);
      } else {
        const textLength = (response?.text?.length || 0);
        tokens = Math.ceil(textLength / 4) || 120;
        promptTokens = Math.round(tokens * 0.7);
        completionTokens = tokens - promptTokens;
      }
      
      const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gemini-3.8-flash';
      const newCall = {
        id: 'call_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        tokensUsed: tokens,
        promptTokens,
        completionTokens,
        durationMs: durationMs || 0,
        model: response?.modelUsed || defaultModel,
        isCustomKey: isCustom,
        type
      };

      const saved = localStorage.getItem('purescan_api_usage_stats');
      const logs = saved ? JSON.parse(saved) : [];
      logs.push(newCall);
      const trimmed = logs.slice(-1000);
      localStorage.setItem('purescan_api_usage_stats', JSON.stringify(trimmed));
      setApiLogs(trimmed);
    } catch (err) {
      console.error("Failed to record api call metrics", err);
    }
  };

  const [testingKey, setTestingKey] = useState(false);
  const [keyTestReport, setKeyTestReport] = useState<{
    status: 'healthy' | 'error' | 'none';
    message: string;
  } | null>(null);

  const handleTestKeyStatus = async () => {
    setTestingKey(true);
    setKeyTestReport(null);
    try {
      const isGroq = aiProvider === 'groq';
      const key = isGroq
        ? (customGroqApiKey ? customGroqApiKey.trim() : undefined)
        : (customApiKey ? customApiKey.trim() : undefined);
      const start = Date.now();
      const testResponse = await callGeminiApi({
        contents: "Respond with precisely JSON: {\"status\": \"healthy\"}",
        config: {
          responseMimeType: "application/json"
        },
        customApiKey: key,
        provider: aiProvider,
        model: isGroq ? undefined : 'gemini-3.5-flash-lite',
        timeoutMs: 6000
      });
      const duration = Date.now() - start;
      recordApiCall(testResponse, isGroq ? 'Groq LPU Connection Ping' : 'Developer Connection Ping', duration);
      setKeyTestReport({
        status: 'healthy',
        message: isGroq
          ? `Connected to Groq Cloud AI successfully in ${duration}ms using ${testResponse.modelUsed || 'llama-3.3-70b-versatile'} on Groq LPU™! Your Groq API connection is active.`
          : `Connected successfully in ${duration}ms using ${testResponse.modelUsed || 'gemini-3.5-flash-lite'}! Your Gemini API connection is active and ultra-fast.`
      });
    } catch (err: any) {
      console.error("API Key Test failed:", err);
      setKeyTestReport({
        status: 'error',
        message: err?.message || (aiProvider === 'groq'
          ? "Groq Cloud connection failed. Please ensure your Groq API key is valid, or that the Groq server key is configured."
          : "Key verification failed. Ensure your Gemini API key is active and authorized.")
      });
    } finally {
      setTestingKey(false);
    }
  };
  const [countdown, setCountdown] = useState<number>(0);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('purescan_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (['detecting', 'extracting', 'analyzing'].includes(status)) {
      if (countdown === 0) setCountdown(15);
      
      countdownInterval.current = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setCountdown(0);
    }
    
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [status]);

  const [animatedScore, setAnimatedScore] = useState<number>(0);

  // Incrementally count up score from 0 when result card opens
  useEffect(() => {
    if (status !== 'result' || !scanResult) {
      setAnimatedScore(0);
      return;
    }

    if (isExporting) {
      setAnimatedScore(scanResult.score);
      return;
    }

    setAnimatedScore(0);
    const target = scanResult.score;
    const duration = 1350; // ms
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * target);
      setAnimatedScore(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setAnimatedScore(target);
      }
    };

    // Delay slightly to synchronize with modal opening & badge entrance
    const timer = setTimeout(() => {
      rafId = requestAnimationFrame(animate);
    }, 220);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [status, scanResult?.id, scanResult?.score, isExporting]);

  const FORBIDDEN_KEYWORDS = dietaryPreferences;
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPopup(false);
  };

  // Helper to derive comprehensive demographic intelligence and clinical scoring forensics
  const deriveDemographicForensics = (
    productName: string,
    riskyIngredients: Ingredient[],
    score: number,
    grade: string,
    existingData?: Partial<ScanResult>
  ) => {
    const nameLower = (productName || '').toLowerCase();
    const allText = [
      nameLower,
      ...riskyIngredients.map(r => `${r.name} ${r.description} ${r.implications}`)
    ].join(' ').toLowerCase();

    const hasDyes = allText.includes('red 40') || allText.includes('yellow 5') || allText.includes('yellow 6') || allText.includes('blue 1') || allText.includes('titanium dioxide') || allText.includes('tartrazine') || allText.includes('allura red');
    const hasHFCS = allText.includes('high fructose') || allText.includes('corn syrup') || allText.includes('liquid glucose') || allText.includes('invert sugar');
    const hasPalmOil = allText.includes('palm oil') || allText.includes('palmolein') || allText.includes('hydrogenated');
    const hasArtSweeteners = allText.includes('sucralose') || allText.includes('aspartame') || allText.includes('acesulfame') || allText.includes('saccharin');
    const hasMaltodextrin = allText.includes('maltodextrin') || allText.includes('dextrose');
    const hasCaffeine = allText.includes('caffeine') || allText.includes('taurine') || allText.includes('energy') || allText.includes('guarana');
    const isKidOriented = nameLower.includes('candy') || nameLower.includes('gummy') || nameLower.includes('chocolate') || nameLower.includes('cereal') || nameLower.includes('marshmallow') || nameLower.includes('cookie') || nameLower.includes('biscuit') || nameLower.includes('lollipop') || nameLower.includes('snack') || hasDyes;
    const isGamerOrEnergy = nameLower.includes('energy') || nameLower.includes('monster') || nameLower.includes('red bull') || nameLower.includes('sting') || hasCaffeine || nameLower.includes('takis');
    const isFitness = nameLower.includes('protein') || nameLower.includes('whey') || nameLower.includes('isolate') || nameLower.includes('creatine') || nameLower.includes('bcaa') || nameLower.includes('workout') || (nameLower.includes('bar') && !isKidOriented);
    const isDiabeticOrDiet = nameLower.includes('zero sugar') || nameLower.includes('sugar free') || nameLower.includes('diet') || nameLower.includes('keto') || nameLower.includes('low carb');

    let targetAudience = existingData?.targetAudience;
    let targetMarketingAnalysis = existingData?.targetMarketingAnalysis;
    let demographicRiskAlert = existingData?.demographicRiskAlert;
    let novaGroup = existingData?.novaGroup;
    let processingLevel = existingData?.processingLevel;
    let glycemicImpact = existingData?.glycemicImpact;
    let endocrineOrMetabolicAlerts = existingData?.endocrineOrMetabolicAlerts;
    let demographicSafety = existingData?.demographicSafety;
    let scoreExplanation = existingData?.scoreExplanation;

    if (!targetAudience) {
      if (isKidOriented) targetAudience = "Children & School Lunchboxes (Ages 3-12)";
      else if (isGamerOrEnergy) targetAudience = "Teens & Adolescents / Gamers";
      else if (isFitness) targetAudience = "Fitness & Gym Athletes";
      else if (isDiabeticOrDiet) targetAudience = "Diabetics / Keto / Weight-Loss Seekers";
      else targetAudience = "General Consumers & Family Household";
    }

    if (!targetMarketingAnalysis) {
      if (isKidOriented) {
        targetMarketingAnalysis = `Formulated with ultra-palatable sweet flavor profiles and bright commercial branding to target children, while carrying ${hasDyes ? 'petroleum synthetic dyes, ' : ''}${hasHFCS ? 'high fructose corn syrup, ' : ''}and cosmetic industrial texturizers.`;
      } else if (isGamerOrEnergy) {
        targetMarketingAnalysis = "Promoted as high-octane physical and mental alertness fuel targeting adolescent gaming culture, while concealing synthetic stimulant loads, citric acid, and artificial sweeteners.";
      } else if (isFitness) {
        targetMarketingAnalysis = "Heavily marketed with clean fitness imagery and protein metrics, but often conceals high-dose sugar alcohols (maltitol) causing severe GI distress, industrial palm oil, and synthetic sweeteners.";
      } else if (isDiabeticOrDiet) {
        targetMarketingAnalysis = "Leverages the 'Zero Sugar' health halo to attract diabetic and insulin-resistant consumers, yet often masks hidden maltodextrin (GI 110) or sucralose that alters glucose tolerance.";
      } else {
        targetMarketingAnalysis = "Engineered for maximum retail shelf life, hyper-palatability, and convenience across broad family demographics.";
      }
    }

    if (!demographicRiskAlert) {
      if (isKidOriented) {
        demographicRiskAlert = "Pediatric Vulnerability Warning: Developing central nervous systems and gut barrier permeability are especially susceptible to artificial food colorings and high-fructose syrups, contributing to attentional volatility and metabolic stress.";
      } else if (isGamerOrEnergy) {
        demographicRiskAlert = "Adolescent Cardiovascular Alert: High synthetic caffeine and concentrated taurine can induce tachycardia, sleep architecture disruption, and transient systolic hypertension in younger populations.";
      } else if (isFitness) {
        demographicRiskAlert = "Athletic Performance & GI Drag: Emulsifiers and polyol sweeteners may induce delayed gastric distress, bloating, and gut barrier permeability during endurance training.";
      } else if (isDiabeticOrDiet) {
        demographicRiskAlert = "Endocrine & Glycemic Threat: Artificial sweeteners and hidden high-GI starches (maltodextrin GI 110) stimulate insulin surges and alter gut microbiome composition.";
      } else {
        demographicRiskAlert = "General Metabolic Impact: Cumulative daily exposure to ultra-processed industrial food additives is clinically correlated with increased systemic low-grade inflammation.";
      }
    }

    if (!novaGroup) {
      if (riskyIngredients.some(r => r.risk === 'high') || hasDyes || hasHFCS || hasPalmOil || hasArtSweeteners || score < 60) {
        novaGroup = 4;
        processingLevel = "NOVA 4 — Ultra-Processed Food (UPF)";
      } else if (riskyIngredients.length > 0 || score < 80) {
        novaGroup = 3;
        processingLevel = "NOVA 3 — Processed Food";
      } else {
        novaGroup = 1;
        processingLevel = "NOVA 1 — Unprocessed / Minimally Processed";
      }
    } else if (!processingLevel) {
      processingLevel = novaGroup === 4 ? "NOVA 4 — Ultra-Processed Food (UPF)" : novaGroup === 3 ? "NOVA 3 — Processed Food" : "NOVA 1 — Whole Food";
    }

    if (!glycemicImpact) {
      if (hasHFCS || hasMaltodextrin || allText.includes('sugar > 15') || allText.includes('added sugar')) {
        glycemicImpact = "Extreme (Rapid Glucose Spike)";
      } else if (allText.includes('sugar') || allText.includes('flour') || allText.includes('maida')) {
        glycemicImpact = "High (Elevated Insulin Demand)";
      } else if (allText.includes('protein') || allText.includes('fiber') || allText.includes('grain')) {
        glycemicImpact = "Moderate (Balanced Absorption)";
      } else {
        glycemicImpact = "Low (Steady Glycemic Release)";
      }
    }

    if (!endocrineOrMetabolicAlerts || endocrineOrMetabolicAlerts.length === 0) {
      const alerts: string[] = [];
      if (hasDyes) alerts.push("Pediatric Neuro-Behavioral Sensitivity (Synthetic Dyes)");
      if (hasHFCS) alerts.push("Hepatic De Novo Lipogenesis (HFCS)");
      if (hasPalmOil) alerts.push("Lipid Peroxidation & Saturated Burden (Palm Oil)");
      if (hasArtSweeteners) alerts.push("Gut Microbiota Permeability Disruption (Artificial Sweeteners)");
      if (hasMaltodextrin) alerts.push("Acute Postprandial Glucose Volatility (High-GI Starches)");
      if (alerts.length === 0) alerts.push("Preservative & Chemical Additive Exposure");
      endocrineOrMetabolicAlerts = alerts;
    }

    if (!demographicSafety) {
      demographicSafety = {
        children: (isKidOriented && score < 70) || hasDyes || hasHFCS || score < 45 ? 'avoid' : score < 70 ? 'caution' : 'safe',
        diabetics: hasHFCS || hasMaltodextrin || score < 50 ? 'avoid' : score < 75 ? 'caution' : 'safe',
        fitness: hasPalmOil || hasHFCS || score < 40 ? 'caution' : 'safe',
        general: score < 40 ? 'avoid' : score < 65 ? 'caution' : 'safe'
      };
    }

    if (!scoreExplanation) {
      scoreExplanation = `Calibrated clinical score: ${score}/100 (Grade ${grade}). Evaluated against target demographic vulnerability (${targetAudience}), additive toxicity (${riskyIngredients.length} concerns flagged), and ${processingLevel}.`;
    }

    return {
      targetAudience,
      targetMarketingAnalysis,
      demographicRiskAlert,
      novaGroup,
      processingLevel,
      glycemicImpact,
      endocrineOrMetabolicAlerts,
      demographicSafety,
      scoreExplanation
    };
  };

  // Helper to sanitize any scan result item
  const sanitizeScanResult = (item: any): ScanResult => {
    if (!item || typeof item !== 'object') {
      const fallbackRisks: Ingredient[] = [];
      const derived = deriveDemographicForensics('Scanned Food Item', fallbackRisks, 50, 'C');
      return {
        id: Date.now().toString(),
        timestamp: Date.now(),
        productName: 'Scanned Food Item',
        grade: 'C',
        score: 50,
        confidenceScore: undefined,
        ...derived,
        riskyIngredients: fallbackRisks,
        alternative: {
          name: 'Whole Food Alternative',
          reason: 'Opt for clean, organic ingredients.'
        }
      };
    }

    const rawRisky = Array.isArray(item.riskyIngredients) ? item.riskyIngredients : [];
    const riskyIngredients: Ingredient[] = rawRisky.map((ri: any) => ({
      name: String(ri?.name || 'Additive Concern'),
      risk: (ri?.risk === 'high' || ri?.risk === 'medium' || ri?.risk === 'low') ? ri.risk : 'medium',
      description: String(ri?.description || 'Dietary concern identified during biochemical analysis.'),
      implications: String(ri?.implications || 'Exercise caution based on health recommendations.')
    }));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (typeof item.grade === 'string') {
      const uGrade = item.grade.trim().toUpperCase();
      if (['A', 'B', 'C', 'D', 'F'].includes(uGrade)) {
        grade = uGrade as any;
      }
    }

    let score = 50;
    if (typeof item.score === 'number' && !isNaN(item.score)) {
      score = Math.max(0, Math.min(100, item.score));
    } else if (typeof item.score === 'string') {
      const pScore = parseInt(item.score, 10);
      if (!isNaN(pScore)) score = Math.max(0, Math.min(100, pScore));
    }

    let alternative = {
      name: 'Whole Food Alternative',
      reason: 'Opt for clean, organic ingredients.'
    };
    if (item.alternative && typeof item.alternative === 'object') {
      alternative = {
        name: String(item.alternative.name || 'Whole Food Alternative'),
        reason: String(item.alternative.reason || 'Contains fewer processed additives.')
      };
    }

    const pName = String(item.productName || 'Scanned Food Item');
    const derived = deriveDemographicForensics(pName, riskyIngredients, score, grade, item);

    return {
      id: String(item.id || Date.now().toString()),
      timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
      productName: pName,
      grade,
      score,
      confidenceScore: typeof item.confidenceScore === 'number' ? item.confidenceScore : undefined,
      ...derived,
      riskyIngredients,
      alternative
    };
  };

  // Load history from local storage and sync with Supabase
  useEffect(() => {
    try {
      const saved = localStorage.getItem('purescan_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.map(sanitizeScanResult));
        }
      }
    } catch (err) {
      console.error('Failed to parse history from localStorage', err);
    }

    // Listen for auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync history with Supabase when user logs in
  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('scans')
          .select('*')
          .order('timestamp', { ascending: false });
        
        if (data && !error) {
          setHistory(prev => {
            const sanitizedRemote = data.map(sanitizeScanResult);
            // Merge and deduplicate by ID
            const combined = [...sanitizedRemote, ...prev];
            const unique = combined.filter((item, index, self) =>
              index === self.findIndex((t) => t.id === item.id)
            );
            localStorage.setItem('purescan_history', JSON.stringify(unique));
            return unique;
          });
        } else if (error) {
          console.error("Failed to fetch history from Supabase:", error);
        }
      };
      fetchHistory();
    }
  }, [user]);

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowProfile(false);
    setIsEditingProfile(false);
  };

  const handleUpdateProfile = async () => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { 
          full_name: editName,
          avatar_url: editAvatarUrl
        }
      });
      if (error) throw error;
      setUser(data.user);
      setIsEditingProfile(false);
      setError("Profile updated successfully!");
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError("Failed to update profile.");
    }
  };

  const startEditingProfile = () => {
    setEditName(user?.user_metadata?.full_name || "");
    setEditAvatarUrl(user?.user_metadata?.avatar_url || "");
    setIsEditingProfile(true);
  };

  const saveToHistory = async (result: ScanResult) => {
    setHistory(prev => {
      const newHistory = [result, ...prev];
      localStorage.setItem('purescan_history', JSON.stringify(newHistory));
      return newHistory;
    });

    if (user) {
      const { error } = await supabase.from('scans').insert([{
        ...result,
        user_id: user.id
      }]);
      if (error) console.error("Supabase sync failed:", error);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('purescan_history', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save updated history to localStorage:", err);
      }
      return updated;
    });

    if (user) {
      try {
        const { error } = await supabase.from('scans').delete().eq('id', id).eq('user_id', user.id);
        if (error) console.error("Supabase delete failed:", error);
      } catch (err) {
        console.error("Error deleting scan from Supabase:", err);
      }
    }
  };

  const handleClearHistory = async () => {
    setHistory([]);
    try {
      localStorage.removeItem('purescan_history');
    } catch (err) {
      console.error("Failed to clear history from localStorage:", err);
    }

    if (user) {
      try {
        const { error } = await supabase.from('scans').delete().eq('user_id', user.id);
        if (error) console.error("Supabase clear history failed:", error);
      } catch (err) {
        console.error("Error clearing scans from Supabase:", err);
      }
    }
  };
  
  // Cropper State & Adaptive Viewfinder
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropAspect, setCropAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [viewfinderMode, setViewfinderMode] = useState<'portrait' | 'landscape'>('landscape');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- AI Logic ---
  const getApiKey = () => {
    return customApiKey || '';
  };

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setCustomApiKey(trimmed);
    localStorage.setItem('GEMINI_API_KEY', trimmed);
    setKeyTestReport(null);
  };

  const handleSaveGroqApiKey = (key: string) => {
    const trimmed = key.trim();
    setCustomGroqApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('GROQ_API_KEY', trimmed);
    } else {
      localStorage.removeItem('GROQ_API_KEY');
    }
    setKeyTestReport(null);
  };

  const handleSwitchAiProvider = (provider: 'gemini' | 'groq') => {
    setAiProvider(provider);
    try {
      localStorage.setItem('purescan_ai_provider', provider);
    } catch (e) {
      console.error("Failed to save AI provider:", e);
    }
    setKeyTestReport(null);
  };

  const cropImageDirectly = async (
    imageSrc: string, 
    box: { 
      x: number; 
      y: number; 
      width: number; 
      height: number; 
      suggestedRotation?: number;
      isWideOrHorizontal?: boolean;
    }
  ) => {
    let sourceImage = imageSrc;
    // Auto-orient if the model detected that the text or horizontal packaging is rotated sideways
    if (box.suggestedRotation && (box.suggestedRotation === 90 || box.suggestedRotation === 180 || box.suggestedRotation === 270)) {
      try {
        sourceImage = await rotateImageBase64(imageSrc, box.suggestedRotation);
      } catch (rotErr) {
        console.warn("Auto rotation skipped:", rotErr);
      }
    }

    const image = new Image();
    image.src = sourceImage;
    await new Promise(resolve => image.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Detect if this is a horizontal / landscape packaging layout
    const isHorizontal = box.isWideOrHorizontal || (box.width > box.height * 1.1) || (image.width > image.height * 1.15);

    // Apply smart safety margins: 10-14% extra margin horizontally so nutrition tables or columns at the edges are NEVER cut off
    const padFactorX = isHorizontal ? 0.12 : 0.08;
    const padFactorY = 0.08;

    const padX = Math.max(35, box.width * padFactorX);
    const padY = Math.max(25, box.height * padFactorY);

    const safeX = Math.max(0, box.x - padX);
    const safeY = Math.max(0, box.y - padY);
    const safeW = Math.min(1000 - safeX, box.width + padX * 2);
    const safeH = Math.min(1000 - safeY, box.height + padY * 2);

    // If the detected box covers most of the image (>78% width & height), preserve the full image to guarantee zero cutoff!
    if (safeW >= 780 && safeH >= 780) {
      return sourceImage;
    }

    // Convert normalized coordinates (0-1000) to actual pixels
    const px = (safeX / 1000) * image.width;
    const py = (safeY / 1000) * image.height;
    const pw = (safeW / 1000) * image.width;
    const ph = (safeH / 1000) * image.height;

    const maxDim = 1400;
    let targetW = pw;
    let targetH = ph;
    if (targetW > maxDim || targetH > maxDim) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }

    canvas.width = Math.max(1, Math.round(targetW));
    canvas.height = Math.max(1, Math.round(targetH));

    ctx.drawImage(
      image,
      px,
      py,
      pw,
      ph,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const autoDetectLabel = async (base64Data: string) => {
    try {
      setStatus('detecting');
      setError(null);
      const optimizedImage = await optimizeImageBase64(base64Data, 1000, 0.78);
      const startDetect = Date.now();
      const response = await callGeminiApi({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: optimizedImage.split(',')[1] || optimizedImage,
                },
              },
              {
                text: `You are PureScan AI's master food label vision & computer vision engine.
Analyze this uploaded or captured packaging photo to locate ALL INFORMATION PANELS regardless of panel count, layout structure, or photo orientation (horizontal or vertical):

1. MULTI-NUTRITIONAL TABLES AUTO-DETECTION:
   - Auto-detect ALL Nutrition Facts / Nutritional Information tables present in the photo.
   - Detect dual-column tables (e.g., "Per 100g" vs "Per Serving" or "Per Package"), multi-language nutrition tables, and side-by-side or stacked nutritional grids.
   - Ensure the bounding box encompasses ALL nutrition tables visible in the image without cutting off any columns or values.

2. COMPLETE INGREDIENTS LIST & ALLERGEN PANELS:
   - Encompass every ingredients list, sub-ingredient statement, chemical additive list, preservative notice, and allergen warning panel across all sides.

3. ANY PHOTO ORIENTATION (VERTICAL / PORTRAIT, HORIZONTAL / LANDSCAPE, SIDEWAYS 90°/270°, UPSIDE DOWN 180°):
   - Works seamlessly for vertical packaging (bottles, cereal boxes, tall cans), horizontal packaging (biscuit wrappers, candy bars, snack pouches), or rotated photos.
   - If text is rotated sideways or upside down, specify suggestedRotation (0, 90, 180, or 270) to orient the label right-side up.
   - Set isWideOrHorizontal to true if panels spread horizontally across multiple columns or side surfaces.
   - Check if any human faces are present (hasFace: true/false).

Coordinates must be normalized from 0 to 1000 (0,0 is top-left, 1000,1000 is bottom-right).
Return JSON matching schema:
{
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "suggestedRotation": number,
  "isWideOrHorizontal": boolean,
  "hasFace": boolean
}`,
              },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: 'LOW' },
          maxOutputTokens: 300,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              width: { type: Type.NUMBER },
              height: { type: Type.NUMBER },
              suggestedRotation: { type: Type.NUMBER },
              isWideOrHorizontal: { type: Type.BOOLEAN },
              hasFace: { type: Type.BOOLEAN },
            },
            required: ['x', 'y', 'width', 'height', 'hasFace'],
          }
        },
        customApiKey: aiProvider === 'groq' ? (customGroqApiKey || undefined) : (customApiKey || undefined),
        provider: aiProvider
      });

      const box = cleanAndParseJson(response.text);
      recordApiCall(response, aiProvider === 'groq' ? "Groq Vision Label Detection" : "Label Face Detection", Date.now() - startDetect);

      if (box.hasFace) {
        setError("Face detected. For privacy reasons, we do not process images containing human faces.");
        setStatus('idle');
        return;
      }

      // If bounding box is suspiciously tiny (<120x80), or invalid, use full image directly
      if (!box.width || !box.height || box.width < 120 || box.height < 80) {
        console.info("Bounding box too small or ambiguous, scanning full frame");
        setCroppedImage(base64Data);
        await fastUnifiedScan(base64Data);
        return;
      }
      
      if (autoScan) {
        const cropped = await cropImageDirectly(base64Data, box);
        if (cropped) {
          setCroppedImage(cropped);
          await fastUnifiedScan(cropped);
        } else {
          await fastUnifiedScan(base64Data);
        }
      } else {
        // If rotation is suggested, apply to captured image for manual crop
        let imageForCrop = base64Data;
        if (box.suggestedRotation && (box.suggestedRotation === 90 || box.suggestedRotation === 180 || box.suggestedRotation === 270)) {
          imageForCrop = await rotateImageBase64(base64Data, box.suggestedRotation);
          setCapturedImage(imageForCrop);
        }

        // Set crop aspect ratio: default to undefined (freeform) or wide if horizontal
        if (box.isWideOrHorizontal || box.width > box.height * 1.2) {
          setCropAspect(16 / 9);
        } else {
          setCropAspect(undefined); // freeform
        }

        const zoomVal = Math.max(1, Math.min(2.5, 850 / Math.max(box.width, box.height)));
        setZoom(zoomVal);
        
        const ncx = (box.x + box.width / 2) / 1000;
        const ncy = (box.y + box.height / 2) / 1000;
        
        setCrop({
          x: (0.5 - ncx) * 100 * zoomVal,
          y: (0.5 - ncy) * 100 * zoomVal
        });

        setStatus('cropping');
      }
    } catch (error: any) {
      console.warn("Auto-detection notice:", error);
      const noticeMsg = error?.message?.includes("API key") 
        ? error.message 
        : `Auto-detect notice: ${error?.message || "Using manual crop"}`;
      setError(noticeMsg);
      if (autoScan) {
        // If auto scan fails, fallback to full image fast scan
        await fastUnifiedScan(base64Data);
      } else {
        // Fallback to manual crop with freeform
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCropAspect(undefined);
        setStatus('cropping');
      }
    }
  };

  const extractIngredients = async (base64Data: string) => {
    try {
      setStatus('extracting');
      setError(null);
      const optimizedImage = await optimizeImageBase64(base64Data, 1400, 0.82);
      const startExtract = Date.now();
      const response = await callGeminiApi({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: optimizedImage.split(',')[1] || optimizedImage,
                },
              },
              {
                text: `You are PureScan AI's expert clinical OCR vision reader & food safety auditor.
Thoroughly auto-detect and read ALL information from this product photo regardless of layout, panel count, or image orientation (horizontal or vertical):

1. AUTOMATIC ORIENTATION & MULTI-DIRECTIONAL READING:
   - Auto-detect text orientation automatically whether the photo was uploaded vertically (portrait), horizontally (landscape), sideways (90°/270°), or upside down. Read across all visible panels from top-to-bottom and left-to-right so zero text is missed.

2. MULTI-NUTRITIONAL TABLES AUTO-DETECTION:
   - Locate and extract ALL Nutrition Facts / Nutritional Information tables present in the photo (including single-column, dual-column like "Per Serving" / "Per 100g", multi-language tables, or side-by-side nutritional grids).
   - Extract Serving Size, Servings Per Container, Energy/Calories, Total Fat, Saturated Fat, Trans Fat, Cholesterol, Sodium/Salt, Total Carbohydrates, Dietary Fiber, Total Sugars, Added Sugars, Protein, and all listed Vitamins/Minerals from EVERY table.

3. COMPLETE INGREDIENTS LIST & ALLERGEN STATEMENT:
   - Extract EVERY single ingredient, sub-ingredient, chemical additive code (E-numbers), preservative, artificial dye (Red 40, Yellow 5, etc.), sweetener, emulsifier, stabilizer, and allergen statement ("Contains...", "May contain traces of...").
   - Do NOT skip or truncate any column, table, or side panel. Combine all detected sections into a single, comprehensive, clearly formatted text report.

4. FORENSIC OCR FOR BLURRY, GRAINY, REFLECTIVE & LOW-QUALITY PHOTOS:
   - If the photo is blurry, low-resolution, out-of-focus, motion-blurred, curved, or affected by plastic packaging glare, reconstruct characters using lexical and biochemical context.
   - For incomplete or smudged words, reconstruct the standard food additive or ingredient (e.g., "so... lec..." -> "Soy Lecithin", "potas... sorb..." -> "Potassium Sorbate", "high fruc... corn syr..." -> "High Fructose Corn Syrup", "monos... glut..." -> "Monosodium Glutamate", "red ... 40" -> "Red 40").
   - Extract numbers from nutritional grids by correlating standard nutrient line order, units, and serving ratios.
   - Never output 'No ingredients detected' if any food packaging text is decipherable.

If no food packaging label or text is detected, return 'No ingredients detected'.`,
              },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: geminiThinkingLevel },
          maxOutputTokens: 2500
        },
        customApiKey: aiProvider === 'groq' ? (customGroqApiKey || undefined) : (customApiKey || undefined),
        provider: aiProvider,
        timeoutMs: 16000
      });

      const text = response.text || "";
      recordApiCall(response, aiProvider === 'groq' ? "Groq LPU OCR Extraction" : "Ingredient OCR Extraction", Date.now() - startExtract);
      setExtractedIngredients(text);
      if (autoScan && text && text !== "No ingredients detected") {
        await analyzeIngredients(text);
      } else {
        setStatus('editing');
      }
    } catch (error: any) {
      console.error("AI Extraction failed:", error);
      setError(error?.message || "Failed to extract ingredients. Please check your API key or try again.");
      setStatus('idle');
    }
  };

  const processAndDisplayScanResult = async (safeObj: any, textForAudit: string) => {
    // Sanitize grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (typeof safeObj.grade === 'string') {
      const uGrade = safeObj.grade.trim().toUpperCase();
      if (['A', 'B', 'C', 'D', 'F'].includes(uGrade)) {
        grade = uGrade as 'A' | 'B' | 'C' | 'D' | 'F';
      }
    }

    // Sanitize score
    let score = 50;
    if (typeof safeObj.score === 'number' && !isNaN(safeObj.score)) {
      score = Math.max(0, Math.min(100, safeObj.score));
    } else if (typeof safeObj.score === 'string') {
      const parsedScore = parseInt(safeObj.score, 10);
      if (!isNaN(parsedScore)) score = Math.max(0, Math.min(100, parsedScore));
    }

    // Sanitize confidenceScore
    let confidenceScore: number | undefined = undefined;
    if (typeof safeObj.confidenceScore === 'number' && !isNaN(safeObj.confidenceScore)) {
      confidenceScore = safeObj.confidenceScore;
    } else if (typeof safeObj.confidenceScore === 'string') {
      const parsedConf = parseInt(safeObj.confidenceScore, 10);
      if (!isNaN(parsedConf)) confidenceScore = parsedConf;
    }

    // Sanitize riskyIngredients array
    const rawRisky = Array.isArray(safeObj.riskyIngredients) ? safeObj.riskyIngredients : [];
    const riskyIngredients: Ingredient[] = rawRisky.map((ri: any) => ({
      name: String(ri?.name || 'Additive / Ingredient Concern'),
      risk: (ri?.risk === 'high' || ri?.risk === 'medium' || ri?.risk === 'low') ? ri.risk : 'medium',
      description: String(ri?.description || 'Potential dietary concern identified in biochemical audit.'),
      implications: String(ri?.implications || 'Exercise caution based on your safety settings.')
    }));

    // Sanitize alternative
    let alternative: { name: string; reason: string } = {
      name: "Whole Food Alternative",
      reason: "Opt for minimally processed foods with clean, organic ingredients."
    };
    if (safeObj.alternative && typeof safeObj.alternative === 'object') {
      alternative = {
        name: String(safeObj.alternative.name || "Whole Food Alternative"),
        reason: String(safeObj.alternative.reason || "Contains fewer synthetic additives and processing.")
      };
    }

    const pName = String(safeObj.productName || "Scanned Food Item");
    const derivedDemographics = deriveDemographicForensics(pName, riskyIngredients, score, grade, safeObj);

    const result = {
      productName: pName,
      grade,
      score,
      confidenceScore,
      ...derivedDemographics,
      riskyIngredients,
      alternative
    };

    // AI Guardrail: Confidence Score Check
    if (result.confidenceScore !== undefined && result.confidenceScore < 85) {
      setError("Low scan confidence. Please ensure the label is well-lit and in focus for accurate analysis.");
      setStatus('editing');
      return;
    }

    // AI Guardrail: Allergen Hard-Coding (Only active when Allergen & Dietary Preferences + Allergen Sub-Setting are ON)
    if (allergenDietaryEnabled && allergensEnabled && FORBIDDEN_KEYWORDS.length > 0) {
      const lowerText = (textForAudit || '').toLowerCase();
      const allergenSynonyms: Record<string, string[]> = {
        'wheat / gluten': ['wheat', 'gluten', 'barley', 'rye', 'spelt', 'malt'],
        'milk / dairy': ['milk', 'dairy', 'whey', 'casein', 'lactose', 'butter', 'cheese'],
        'peanuts': ['peanut', 'groundnut', 'arachis'],
        'tree nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia'],
        'soy': ['soy', 'soya', 'edamame'],
        'eggs': ['egg', 'albumin', 'ovalbumin', 'mayonnaise'],
        'shellfish': ['shellfish', 'shrimp', 'prawn', 'crab', 'lobster', 'krill'],
        'fish': ['fish', 'anchovy', 'salmon', 'tuna', 'cod'],
        'sesame': ['sesame', 'tahini', 'gingelly'],
        'sulfites': ['sulfite', 'sulphite', 'sulfur dioxide', 'metabisulfite']
      };

      const foundForbidden = FORBIDDEN_KEYWORDS.filter(keyword => {
        const kLower = keyword.toLowerCase().trim();
        const terms = allergenSynonyms[kLower] || kLower.split('/').map(s => s.trim()).filter(Boolean);
        return terms.some(term => lowerText.includes(term));
      });

      if (foundForbidden.length > 0) {
        result.grade = 'F';
        result.score = 0;
        foundForbidden.forEach(keyword => {
          if (!result.riskyIngredients.some((ri: any) => ri.name.toLowerCase().includes(keyword.toLowerCase()))) {
            result.riskyIngredients.unshift({
              name: `CRITICAL ALLERGEN: ${keyword}`,
              risk: 'high',
              description: "Hard-coded safety override: This allergen is strictly forbidden based on your active Allergen Preferences in Settings.",
              implications: "Consumption of this allergen may cause severe allergic reactions or health complications for sensitive individuals."
            });
          }
        });
      }
    }

    const finalResult: ScanResult = {
      ...result,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    setScanResult(finalResult);
    await saveToHistory(finalResult);
    setStatus('result');
  };

  const fastUnifiedScan = async (base64Data: string) => {
    try {
      setStatus('analyzing');
      setError(null);
      const optimizedImage = await optimizeImageBase64(base64Data, 1280, 0.80);
      const startScan = Date.now();

      const activeAllergens = (allergenDietaryEnabled && allergensEnabled) ? dietaryPreferences : [];
      const activeDietGoals = (allergenDietaryEnabled && dietaryEnabled) ? dietaryLifestylePreferences : [];
      const allergenPromptInstruction = activeAllergens.length > 0
        ? `\n- PERSONAL ALLERGEN RESTRICTIONS ACTIVE (${activeAllergens.join(', ')}): If ANY of these allergens are present, flag them in riskyIngredients (risk: 'high', name starting with 'CRITICAL ALLERGEN: ') and set Score = 0, Grade = 'F'.`
        : '';
      const dietaryPromptInstruction = activeDietGoals.length > 0
        ? `\n- PERSONAL DIETARY GOALS ACTIVE (${activeDietGoals.join(', ')}): Flag any violations in riskyIngredients and ensure healthier alternative strictly conforms.`
        : '';

      const prompt = `You are PureScan AI's expert clinical food safety vision auditor.
Thoroughly examine this food packaging photo, auto-detect and read all Nutrition Facts and Ingredients panels regardless of orientation (portrait, landscape, rotated).
First, verify privacy: if any human face is visible in the photo, set "hasFace": true.

Then perform an exhaustive clinical biochemical, demographic targeting, and toxicology audit:
1. Extract complete text from all nutritional tables and ingredients into "extractedText".
2. Identify product name, target demographic (e.g. Children & Toddlers, Teens & Gamers, Fitness Athletes, Diabetics / Keto, Busy Adults, General Consumer), predatory marketing tactics, and demographic risks.
3. Calibrate Score (0-100) and Grade (A-F) based on NOVA ultra-processing level, demographic vulnerability penalties (e.g. pediatric synthetic dyes Red 40, hidden high-GI maltodextrin for diabetics), and toxic additive deductions.
4. List risky ingredients with biochemical implications and recommend a whole food healthier alternative.${allergenPromptInstruction}${dietaryPromptInstruction}

Return strictly JSON matching:
{
  "hasFace": boolean,
  "extractedText": "all deciphered ingredients and nutrition numbers",
  "productName": "Product Name",
  "grade": "A" | "B" | "C" | "D" | "F",
  "score": number (0-100),
  "confidenceScore": number (0-100),
  "targetAudience": "demographic category",
  "targetMarketingAnalysis": "marketing audit",
  "demographicRiskAlert": "demographic warning",
  "novaGroup": 1 | 2 | 3 | 4,
  "processingLevel": "string",
  "glycemicImpact": "Low" | "Moderate" | "High" | "Extreme",
  "endocrineOrMetabolicAlerts": ["specific metabolic alerts"],
  "demographicSafety": {
    "children": "safe" | "caution" | "avoid",
    "diabetics": "safe" | "caution" | "avoid",
    "fitness": "safe" | "caution" | "avoid",
    "general": "safe" | "caution" | "avoid"
  },
  "scoreExplanation": "breakdown of score calculation",
  "riskyIngredients": [
    {
      "name": "ingredient name",
      "risk": "low" | "medium" | "high",
      "description": "biochemical description",
      "implications": "clinical impact"
    }
  ],
  "alternative": {
    "name": "healthy alternative product name",
    "reason": "why it is healthier"
  }
}`;

      const response = await callGeminiApi({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: optimizedImage.split(',')[1] || optimizedImage,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: geminiThinkingLevel },
          maxOutputTokens: 3200,
          responseMimeType: "application/json"
        },
        customApiKey: aiProvider === 'groq' ? (customGroqApiKey || undefined) : (customApiKey || undefined),
        provider: aiProvider,
        timeoutMs: 16000
      });

      const rawParsed = cleanAndParseJson(response.text);
      const duration = Date.now() - startScan;
      recordApiCall(response, aiProvider === 'groq' ? "Groq Real-Time Vision Scan" : "Real-Time Vision Scan", duration);

      if (rawParsed.hasFace) {
        setError("Face detected. For privacy reasons, we do not process images containing human faces.");
        setStatus('idle');
        return;
      }

      if (rawParsed.extractedText) {
        setExtractedIngredients(rawParsed.extractedText);
      }

      await processAndDisplayScanResult(rawParsed, rawParsed.extractedText || "");
    } catch (error: any) {
      console.error("Fast unified scan failed:", error);
      setError(error?.message || "Scan failed. Please tap Scan again.");
      setStatus('idle');
    }
  };

  const analyzeIngredients = async (ingredientsText: string) => {
    try {
      setStatus('analyzing');
      setError(null);
      const startAnalyze = Date.now();
      const activeAllergens = (allergenDietaryEnabled && allergensEnabled) ? dietaryPreferences : [];
      const activeDietGoals = (allergenDietaryEnabled && dietaryEnabled) ? dietaryLifestylePreferences : [];
      const allergenPromptInstruction = activeAllergens.length > 0
        ? `\n   - PERSONAL ALLERGEN RESTRICTIONS ACTIVE (${activeAllergens.join(', ')}): Carefully check all ingredients and derivatives for [${activeAllergens.join(', ')}]. If ANY of these allergens are present, you MUST flag them in riskyIngredients (risk: 'high', name starting with 'CRITICAL ALLERGEN: ') and set Score = 0, Grade = 'F'.`
        : `\n   - PERSONAL ALLERGEN RESTRICTIONS: Turned OFF or none selected. Do NOT apply personal allergen overrides; evaluate purely on standard clinical toxicology.`;
      const dietaryPromptInstruction = activeDietGoals.length > 0
        ? `\n   - PERSONAL DIETARY PREFERENCES ACTIVE (${activeDietGoals.join(', ')}): Check if any ingredients violate the user's chosen dietary goals [${activeDietGoals.join(', ')}]. Flag any conflicting ingredient in riskyIngredients (risk: 'medium' or 'high', name starting with 'DIETARY ALERT: '), deduct 15-20 points per violation, and ensure the suggested Healthier Alternative strictly complies with [${activeDietGoals.join(', ')}].`
        : `\n   - PERSONAL DIETARY PREFERENCES: Turned OFF or none selected.`;

      const response = await callGeminiApi({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are PureScan AI — an expert clinical biochemist, food scientist, regulatory toxicologist, and commercial marketing auditor.
Analyze the following food item data (ingredients list and/or nutrition facts):
"${ingredientsText}"

You MUST evaluate the product using the EXACT standardized clinical scoring and demographic targeting algorithm below so that results are strictly reproducible and consistent (+-) across all AI providers:

1. TARGET DEMOGRAPHIC FORENSICS & PREDATORY MARKETING AUDIT:
   - Identify precisely who this product is engineered and marketed to:
     * Children & Toddlers (Ages 2-10), Teens & Adolescents / Gamers, Fitness & Gym Athletes, Diabetics / Keto Seekers, Weight-Loss Dieters, Busy Working Adults, or General Consumer.
   - Unmask Deceptive Marketing: Detect child-focused cartoon/color hooks, deceptive "Fitness/Protein" halos concealing palm oil or maltitol, "Zero Sugar" claims concealing high-GI maltodextrin (GI 110) or gut-disrupting sucralose, and fake fruit claims.
   - Demographic Risk Alert: Specify exact physiological and clinical consequences for the targeted group (e.g. pediatric neuro-behavioral hyperactivity from Red 40, diabetic glycemic surges, or athletic GI distress).

2. TARGET-CALIBRATED NUTRITIONAL SCORING ALGORITHM (Start at Base Score = 100):
   - DEMOGRAPHIC VULNERABILITY PENALTY:
     * If targeted at CHILDREN/TODDLERS with synthetic dyes (Red 40, Yellow 5/6, Blue 1), HFCS, titanium dioxide, or >12g added sugars: Deduct an ADDITIONAL 15-20 points.
     * If targeted at DIABETICS/KETO with hidden high-GI carbs (maltodextrin, dextrose, glucose syrup): Deduct an ADDITIONAL 15-20 points.
     * If targeted at FITNESS consumers with trans fats, hydrogenated oils, or excessive artificial sweeteners: Deduct 10-15 points.
   - ULTRA-PROCESSING PENALTY (NOVA Classification):
     * NOVA 4 (Ultra-Processed Food with cosmetic industrial additives): Deduct 10-15 points.
     * NOVA 3 (Processed Food): Deduct 5 points.
     * NOVA 1 & 2 (Whole / Minimally Processed): Award +5 bonus points (max 100).
   - INGREDIENT & ADDITIVE TOXICOLOGY DEDUCTIONS:
     * High Risk Additive (High Fructose Corn Syrup, Trans/Hydrogenated Fats, Red 40, Yellow 5, Titanium Dioxide, BHA/BHT, Sodium Nitrite, Potassium Bromate): Deduct 20-25 points each.
     * Medium Risk Additive / High Sugar or Sodium (Artificial Sweeteners, Maltodextrin, Carrageenan, Palm Oil, Sodium Benzoate, Potassium Sorbate, Added Sugar >15g, Sodium >500mg): Deduct 10-15 points each.
     * Low Risk Additive / Processing Concern (Natural Flavors, Citric Acid, Sunflower Oil, Xanthan/Guar Gum, Soy Lecithin, Added Sugars >10g): Deduct 3-5 points each.
     * Critical Allergen Violation / Banned Chemical: Set Score = 0, Grade = 'F'.${allergenPromptInstruction}${dietaryPromptInstruction}

3. CALCULATE GRADE FROM FINAL CALIBRATED SCORE:
   - Score 85 to 100 => Grade 'A'
   - Score 70 to 84 => Grade 'B'
   - Score 50 to 69 => Grade 'C'
   - Score 30 to 49 => Grade 'D'
   - Score 0 to 29 => Grade 'F'

4. Output strictly valid JSON matching the requested schema.`,
              },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: geminiThinkingLevel },
          maxOutputTokens: 3200,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              grade: { type: Type.STRING, enum: ['A', 'B', 'C', 'D', 'F'] },
              score: { type: Type.NUMBER },
              confidenceScore: { type: Type.NUMBER },
              targetAudience: { type: Type.STRING },
              targetMarketingAnalysis: { type: Type.STRING },
              demographicRiskAlert: { type: Type.STRING },
              novaGroup: { type: Type.NUMBER },
              processingLevel: { type: Type.STRING },
              glycemicImpact: { type: Type.STRING },
              endocrineOrMetabolicAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              demographicSafety: {
                type: Type.OBJECT,
                properties: {
                  children: { type: Type.STRING, enum: ['safe', 'caution', 'avoid'] },
                  diabetics: { type: Type.STRING, enum: ['safe', 'caution', 'avoid'] },
                  fitness: { type: Type.STRING, enum: ['safe', 'caution', 'avoid'] },
                  general: { type: Type.STRING, enum: ['safe', 'caution', 'avoid'] }
                }
              },
              scoreExplanation: { type: Type.STRING },
              riskyIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    risk: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    description: { type: Type.STRING },
                    implications: { type: Type.STRING },
                  },
                  required: ['name', 'risk', 'description', 'implications'],
                },
              },
              alternative: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['name', 'reason'],
              },
            },
            required: ['productName', 'grade', 'score', 'riskyIngredients', 'alternative'],
          },
        },
        customApiKey: aiProvider === 'groq' ? (customGroqApiKey || undefined) : (customApiKey || undefined),
        provider: aiProvider,
        timeoutMs: 16000
      });

      const rawParsed = cleanAndParseJson(response.text);
      recordApiCall(response, aiProvider === 'groq' ? "Groq Biochemical & Demographic Audit" : "Biochemical & Demographic Audit", Date.now() - startAnalyze);
      
      const safeObj = (rawParsed && typeof rawParsed === 'object') ? rawParsed : {};
      await processAndDisplayScanResult(safeObj, ingredientsText);
    } catch (error: any) {
      console.error("AI Analysis failed:", error);
      setError(error?.message || "Failed to analyze ingredients. Please check your API key or try again.");
      setStatus('editing');
    }
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    if (activeTab !== 'scan') return;
    
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
    } catch (err) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (innerErr) {
        console.error("All camera access failed:", innerErr);
        setCameraError("Camera access denied.");
        return;
      }
    }

    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraError(null);
      setCapturedImage(null);
    }
    return stream;
  };

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const init = async () => {
      currentStream = await startCamera();
    };
    init();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab]);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    if (!capturedImage || !croppedAreaPixels) return null;
    
    const image = new Image();
    image.src = capturedImage;
    await new Promise(resolve => image.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleScan = async (image?: string) => {
    let imageToDetect = image || capturedImage;

    if (!imageToDetect && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageToDetect = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageToDetect);
      }
    }

    if (imageToDetect) {
      if (autoScan) {
        await fastUnifiedScan(imageToDetect);
      } else {
        await autoDetectLabel(imageToDetect);
      }
    } else {
      setError("No image to scan. Please point your camera or upload a photo.");
    }
  };

  const handleConfirmCrop = async () => {
    const cropped = await getCroppedImg();
    if (cropped) {
      setCroppedImage(cropped);
      await fastUnifiedScan(cropped);
    }
  };

  const handleRotateCurrentCrop = async () => {
    if (!capturedImage) return;
    try {
      const rotated = await rotateImageBase64(capturedImage, 90);
      setCapturedImage(rotated);
      setCrop({ x: 0, y: 0 });
    } catch (err) {
      console.warn("Manual rotation failed:", err);
    }
  };

  const handleUseFullImage = async () => {
    if (!capturedImage) return;
    setCroppedImage(capturedImage);
    await fastUnifiedScan(capturedImage);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        setCameraError(null);
        // Detect natural image orientation
        const testImg = new Image();
        testImg.onload = () => {
          if (testImg.width > testImg.height * 1.15) {
            setViewfinderMode('landscape');
          }
        };
        testImg.src = result;
        handleScan(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const closeResult = () => {
    stopVoiceSummary();
    setIsSpeakingResult(false);
    setShowTruthCardModal(false);
    setSelectedRegulatoryModalInfo(null);
    setSelectedJurisdictionFocus(null);
    setStatus('idle');
    setExpandedIdx(null);
  };

  const currentFamilyCompatibility = React.useMemo(() => {
    if (!scanResult || !familyGuardEnabled) return [];
    return evaluateFamilyCompatibility(
      scanResult.score ?? 50,
      scanResult.grade || 'C',
      scanResult.riskyIngredients || [],
      extractedIngredients || '',
      familyProfiles
    );
  }, [scanResult, familyGuardEnabled, familyProfiles, extractedIngredients]);

  const currentRegulatoryOverview = React.useMemo(() => {
    if (!scanResult) return null;
    return analyzeProductRegulatoryProfile(
      scanResult.riskyIngredients || [],
      extractedIngredients || ''
    );
  }, [scanResult, extractedIngredients]);

  const handleToggleVoiceSummary = () => {
    if (!scanResult) return;
    if (isSpeakingResult) {
      stopVoiceSummary();
      setIsSpeakingResult(false);
      return;
    }
    const script = buildLocalizedVoiceScript({
      productName: scanResult.productName || 'Scanned Food Item',
      grade: scanResult.grade || 'C',
      score: scanResult.score ?? 50,
      riskyIngredients: scanResult.riskyIngredients || [],
      alternative: scanResult.alternative,
      familyResults: currentFamilyCompatibility,
      langCode: reportLanguage,
      targetAudience: scanResult.targetAudience,
      demographicRiskAlert: scanResult.demographicRiskAlert
    });
    speakTextWithWebSpeech(
      script,
      reportLanguage,
      0.95,
      () => setIsSpeakingResult(true),
      () => setIsSpeakingResult(false),
      (msg) => setError(msg)
    );
  };

  const toggleExpand = (idx: number) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const exportToPDF = async () => {
    if (!scanResult) return;
    
    try {
      setIsExporting(true);

      // Ensure QR Code data URL is fully generated before capturing
      let currentQrUrl = qrCodeDataUrl;
      if (!currentQrUrl) {
        currentQrUrl = await getPureScanQrCodeDataUrl();
        if (currentQrUrl) setQrCodeDataUrl(currentQrUrl);
      }

      const liveElement = document.getElementById('pdf-report-capture-area');
      if (!liveElement) {
        setError("Export error: Report content not found.");
        setIsExporting(false);
        return;
      }

      // Create an offscreen staging container dedicated for high-res 1024px PDF layout
      // This ensures the visible user interface NEVER zooms, stretches, or scrolls!
      const offscreenHost = document.createElement('div');
      offscreenHost.id = 'purescan-pdf-export-staging';
      offscreenHost.style.cssText = `
        position: fixed !important;
        left: -10000px !important;
        top: 0 !important;
        width: 1024px !important;
        min-width: 1024px !important;
        max-width: 1024px !important;
        background: #ffffff !important;
        color: #0f172a !important;
        z-index: -99999 !important;
        pointer-events: none !important;
        opacity: 1 !important;
        overflow: visible !important;
      `;

      // Deep clone the report DOM tree
      const clone = liveElement.cloneNode(true) as HTMLElement;
      clone.id = 'pdf-report-capture-clone';
      clone.className = 'p-5 space-y-3 report-container export-mode export-mode-active';
      clone.style.width = '1024px';
      clone.style.minWidth = '1024px';
      clone.style.maxWidth = '1024px';
      clone.style.boxSizing = 'border-box';
      clone.style.background = '#ffffff';

      // Clean up interactive-only action buttons, but KEEP all regulatory cards, additive chips, and law badges!
      clone.querySelectorAll('.print\\:hidden, [aria-label="Close report"], #btn-voice-summary-readout, #btn-open-food-truth-card-top, #btn-share-food-truth-card').forEach(el => el.remove());
      clone.querySelectorAll('.pdf-spacer').forEach(s => s.remove());

      // Turn remaining buttons (jurisdiction cards, additive chips, law badges) into pristine static display blocks
      clone.querySelectorAll('button').forEach(btn => {
        btn.setAttribute('tabindex', '-1');
        btn.style.pointerEvents = 'none';
        btn.style.cursor = 'default';
        btn.style.userSelect = 'none';
        btn.classList.remove('active:scale-95', 'hover:scale-105', 'hover:scale-[1.02]');
      });

      // Ensure QR image in the clone has the data URL ready
      if (currentQrUrl) {
        const cloneQrImg = clone.querySelector('#pdf-verification-qr-img') as HTMLImageElement;
        if (cloneQrImg) {
          cloneQrImg.src = currentQrUrl;
        }
        const qrBox = clone.querySelector('#pdf-verification-qr-box');
        if (qrBox && !cloneQrImg) {
          qrBox.innerHTML = `<img id="pdf-verification-qr-img" src="${currentQrUrl}" alt="Scan QR code for pure-scan-ai-seven.vercel.app" style="width: 76px; height: 76px; object-fit: contain; display: block;" />`;
        }
      }

      // Add safety bottom margin so bottom text and borders are never clipped
      clone.style.paddingBottom = '36px';

      // Strip dark:* utility classes from the clone so it renders in pure clinical light theme
      clone.querySelectorAll('*').forEach((node) => {
        const el = node as HTMLElement;
        if (el.classList) {
          const toRemove: string[] = [];
          el.classList.forEach((cls) => {
            if (cls.startsWith('dark:')) {
              toRemove.push(cls);
            }
          });
          toRemove.forEach((cls) => el.classList.remove(cls));
        }
      });

      // Synchronize circular gauge SVG progress ring in the clone
      const radius = 40;
      const circumference = 2 * Math.PI * radius;
      const targetOffset = circumference - (scanResult.score / 100) * circumference;
      clone.querySelectorAll('circle').forEach((c) => {
        if (c.getAttribute('stroke-dasharray')) {
          c.style.strokeDashoffset = `${targetOffset}px`;
          c.setAttribute('stroke-dashoffset', `${targetOffset}`);
          c.style.transition = 'none';
          c.style.animation = 'none';
        }
      });

      // Synchronize score display text in the clone
      clone.querySelectorAll('*').forEach((node) => {
        if (node.textContent && node.textContent.trim().startsWith('SCORE')) {
          node.textContent = `SCORE ${scanResult.score}`;
        }
      });

      // Settle any animation/transition states
      clone.querySelectorAll('*').forEach((node) => {
        const el = node as HTMLElement;
        if (el.style) {
          if (el.style.opacity === '0') el.style.opacity = '1';
          if (el.style.animation) el.style.animation = 'none';
          if (el.style.transition) el.style.transition = 'none';
        }
      });

      offscreenHost.appendChild(clone);
      document.body.appendChild(offscreenHost);

      // Brief tick to allow browser layout engine to calculate exact geometry at 1024px
      await new Promise(resolve => setTimeout(resolve, 120));

      const containerRect = clone.getBoundingClientRect();
      const elements = Array.from(clone.querySelectorAll(
        '.report-header, .report-product-title, #pdf-impact-summary-section, #result-family-compatibility-card, .ingredient-audit-title, #global-regulatory-ban-tracker-card, .ingredient-card, .swap-card, .medical-verification-section'
      )) as HTMLElement[];

      const boxes = elements.map(el => {
        const r = el.getBoundingClientRect();
        return {
          top: Math.round(r.top - containerRect.top),
          bottom: Math.round(r.bottom - containerRect.top)
        };
      }).filter(b => b.bottom > b.top).sort((a, b) => a.top - b.top);

      const totalElementHeight = Math.ceil(Math.max(clone.scrollHeight, clone.offsetHeight, containerRect.height)) + 36;

      // Target page capacity: 1360px fills A4 page leaving 18mm breathing room before footer
      const maxPageHeightPx = 1360;
      const slices: { startY: number; endY: number }[] = [];
      let currentPageStart = 0;

      while (currentPageStart < totalElementHeight - 15) {
        const targetEnd = currentPageStart + maxPageHeightPx;

        if (targetEnd >= totalElementHeight) {
          slices.push({ startY: currentPageStart, endY: totalElementHeight });
          break;
        }

        // Bulletproof atomic card-fitting: find the card that would cross targetEnd and split cleanly BEFORE it
        let splitY = -1;
        for (let i = 0; i < boxes.length; i++) {
          const card = boxes[i];
          if (card.top >= currentPageStart - 4) {
            if (card.bottom > targetEnd) {
              const prevCard = boxes[i - 1];
              if (prevCard && prevCard.bottom > currentPageStart) {
                // Split cleanly in the gap between prevCard and this card
                splitY = Math.round((prevCard.bottom + card.top) / 2);
              } else {
                splitY = card.top - 6;
              }
              break;
            }
          }
        }

        // If all remaining cards fit:
        if (splitY === -1) {
          splitY = totalElementHeight;
        }

        // Fallback guard:
        if (splitY <= currentPageStart + 250) {
          splitY = targetEnd;
        }

        slices.push({ startY: currentPageStart, endY: splitY });
        currentPageStart = splitY;
      }

      // Capture high-resolution full canvas from the offscreen clone
      const fullCanvas = await htmlToImage.toCanvas(clone, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1024,
        height: totalElementHeight,
        style: {
          margin: '0',
          maxHeight: 'none',
          height: 'auto',
          overflow: 'visible',
          borderRadius: '0',
          transform: 'none',
          width: '1024px',
          colorScheme: 'light',
          background: 'white',
          display: 'block',
          boxSizing: 'border-box'
        },
      });

      // Done with offscreen clone; remove it immediately
      if (offscreenHost.parentNode) {
        offscreenHost.parentNode.removeChild(offscreenHost);
      }

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
      
      // Margins: 8mm on sides for a balanced, full-width clinical presentation
      const margin = 8;
      const contentWidth = pageWidth - (margin * 2); // 194mm

      // Scale factor from clone CSS pixels (1024) to fullCanvas pixel resolution
      const scale = fullCanvas.width / 1024;

      // Render each slice onto its own canvas and insert into PDF
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        const sliceHeightPx = slice.endY - slice.startY;
        if (sliceHeightPx <= 0) continue;

        const sy = Math.round(slice.startY * scale);
        const sh = Math.min(Math.round(sliceHeightPx * scale), fullCanvas.height - sy);
        const sw = fullCanvas.width;

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = sw;
        pageCanvas.height = sh;
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, sw, sh);
          pageCtx.drawImage(fullCanvas, 0, sy, sw, sh, 0, 0, sw, sh);
        }

        const pageDataUrl = pageCanvas.toDataURL('image/png', 1.0);

        if (i > 0) {
          pdf.addPage();
          // Running header on page 2+
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(6.5);
          pdf.setTextColor(148, 163, 184); // slate-400
          pdf.text('PURESCAN AI CLINICAL AUDIT REPORT • CONFIDENTIAL HEALTH DATA', margin, 5.5);
          pdf.text(`DOC: PS-${scanResult?.id.slice(0, 8).toUpperCase() || '8D038A44'}`, pageWidth - margin, 5.5, { align: 'right' });
        }

        const sliceHeightMm = (sliceHeightPx / 1024) * contentWidth;
        pdf.addImage(
          pageDataUrl,
          'PNG',
          margin,
          margin,
          contentWidth,
          sliceHeightMm,
          undefined,
          'FAST'
        );

        // Clinical Page Number, URL & QR Code Footer on Every Page
        const footerY = pageHeight - 9;
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.25);
        pdf.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.5);
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.text('PURESCAN CLINICAL HEALTH AUDIT', margin, footerY + 2.5);

        // Active link to pure-scan-ai-seven.vercel.app in emerald green
        pdf.setTextColor(16, 185, 129); // emerald-500
        pdf.textWithLink(PURESCAN_WEB_URL, margin + 50, footerY + 2.5, {
          url: PURESCAN_FULL_URL
        });

        // Dedicated QR code on every page footer
        if (currentQrUrl) {
          const qrSize = 8;
          const qrX = pageWidth - margin - 38;
          const qrY = footerY - 2.5;
          pdf.addImage(currentQrUrl, 'PNG', qrX, qrY, qrSize, qrSize, undefined, 'FAST');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6);
          pdf.setTextColor(100, 116, 139); // slate-500
          pdf.text('SCAN QR', qrX + qrSize + 1.5, footerY + 2.5);
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(`PAGE ${i + 1} OF ${slices.length}`, pageWidth - margin, footerY + 2.5, { align: 'right' });
      }

      const fileName = `PureScan_Report_${(scanResult?.productName || 'PRODUCT').replace(/[^a-z0-9]/gi, '_').toUpperCase()}.pdf`;
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      setLastPdfBlob(pdfBlob);
      setLastPdfUrl(pdfUrl);
      
      pdf.save(fileName);
      setShowExportSuccess(true);
      setError(null);
    } catch (err) {
      console.error("PDF Export Error:", err);
      // Clean up offscreen host if still in DOM
      const lingeringHost = document.getElementById('purescan-pdf-export-staging');
      if (lingeringHost && lingeringHost.parentNode) {
        lingeringHost.parentNode.removeChild(lingeringHost);
      }
      setError("PDF Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePdf = async () => {
    if (!lastPdfBlob) return;
    
    const fileName = `PureScan_Report_${scanResult?.productName.replace(/[^a-z0-9]/gi, '_').toUpperCase() || 'DOCUMENT'}.pdf`;
    const file = new File([lastPdfBlob], fileName, { type: 'application/pdf' });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'PureScan Health Audit Report',
          text: `Check out this health audit report for ${scanResult?.productName || 'this product'} generated by PureScan AI.`,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Share failed:", err);
        }
      }
    } else {
      if (lastPdfUrl) {
        window.open(lastPdfUrl, '_blank');
      }
    }
  };

  return (
    <div className={`flex flex-col h-screen max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full bg-off-white dark:bg-dark-bg overflow-hidden relative transition-colors duration-300 shadow-2xl border-x border-gray-100 dark:border-dark-border`}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={PURESCAN_LOGO_URL} alt="PureScan Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">PureScan AI</h1>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Info className="w-5 h-5 text-gray-500" />
        </button>
      </header>

      {/* Main Content */}
      <ErrorBoundary onReset={() => setStatus('idle')}>
        <main className={`flex-1 overflow-y-auto ${activeTab === 'settings' ? 'pb-40' : 'pb-24'}`}>
        {activeTab === 'scan' && (
          <div className="p-4 sm:p-6 space-y-6 dark:bg-dark-bg">
            {/* Camera Viewfinder & Workflow Stage Container */}
            <div className={`relative w-full ${viewfinderMode === 'landscape' ? 'bg-slate-900/90 dark:bg-slate-950 p-2 sm:p-4 rounded-[36px] border border-white/10 shadow-2xl' : ''}`}>
              {/* Camera Viewfinder Box (STILL IN PORTRAIT ORIENTATION SAME) */}
              <div className={`relative aspect-[3/4] ${viewfinderMode === 'landscape' ? 'max-w-xs sm:max-w-sm mx-auto shadow-2xl border-2 border-emerald-400/40 ring-4 ring-emerald-400/10' : 'w-full'} bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 dark:border-white/15 group transition-all duration-300`}>
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                {/* Hidden Canvas for Frame Capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Top Floating HUD Bar (Clean non-overlapping header) */}
                <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto gap-2">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/15 shadow-lg shrink-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cameraError ? 'bg-critical-red' : 'bg-[#34D399] animate-pulse shadow-[0_0_8px_#34D399]'}`} />
                    <span className={`text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap ${cameraError ? 'text-critical-red' : 'text-[#6EE7B7]'}`}>
                      {cameraError ? 'STANDBY' : 'AI SCANNER ACTIVE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setViewfinderMode(prev => prev === 'landscape' ? 'portrait' : 'landscape')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-black/60 hover:bg-black/90 backdrop-blur-xl rounded-full text-white/90 border border-white/15 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-lg whitespace-nowrap"
                      title="Toggle Viewfinder Stage Mode"
                    >
                      <Sliders className="w-3 h-3 text-[#34D399] shrink-0" />
                      <span>{viewfinderMode === 'landscape' ? '↔️ WIDE' : '📱 PORTRAIT'}</span>
                    </button>
                    {!cameraError && (
                      <button
                        onClick={() => startCamera()}
                        className="p-1 bg-black/60 backdrop-blur-xl hover:bg-black/90 rounded-full text-white/90 border border-white/15 transition-colors cursor-pointer shadow-lg shrink-0"
                        title="Restart Camera"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              {/* Viewfinder Content */}
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    {capturedImage ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={capturedImage} 
                          alt="Captured" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => {
                            setCapturedImage(null);
                            setCameraError(null);
                            startCamera();
                          }}
                          className="absolute top-16 right-4 p-2 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-black/80 border border-white/15 transition-colors cursor-pointer"
                          title="Clear Image"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : cameraError ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/70 p-8 text-center space-y-5">
                        <div className="space-y-2">
                          <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <CameraOff className="w-7 h-7 text-critical-red" />
                          </div>
                          <h3 className="text-white font-extrabold text-base">Camera Access Inactive</h3>
                          <p className="text-xs leading-relaxed text-white/60 max-w-[240px] mx-auto">
                            Point camera or upload a clear photo of the product label to begin analysis.
                          </p>
                        </div>

                        <div className="flex flex-col gap-2.5 w-full max-w-[200px]">
                          <button 
                            onClick={triggerFileUpload}
                            className="px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl text-xs font-extrabold shadow-lg active:scale-95 transition-all cursor-pointer"
                          >
                            UPLOAD PHOTO
                          </button>
                          <button 
                            onClick={() => startCamera()}
                            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 transition-all cursor-pointer"
                          >
                            RETRY CAMERA
                          </button>
                        </div>

                        <div className="pt-3 border-t border-white/10 w-full max-w-[240px]">
                          <p className="text-[10px] uppercase tracking-widest font-bold mb-1.5 text-white/50">Troubleshooting</p>
                          <ul className="text-[10px] text-left space-y-1 text-white/60 list-disc pl-4">
                            <li>Check browser address bar camera permissions</li>
                            <li>Or use "Upload Photo" for instant file scan</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                )}

                {status === 'cropping' && capturedImage && (
                  <motion.div 
                    key="cropping"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative bg-slate-950 flex flex-col"
                  >
                    {/* Top Header of Crop Dialog */}
                    <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-healthy-green/20 text-[#34D399] rounded-xl border border-healthy-green/30">
                          <CropIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white tracking-wide">Crop Ingredient Panel</h4>
                          <p className="text-[10px] text-white/60">Zoom or drag to frame the text</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setStatus('idle')}
                        className="p-1.5 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Cropper Workspace */}
                    <div className="relative flex-1 w-full h-full">
                      <Cropper
                        image={capturedImage}
                        crop={crop}
                        zoom={zoom}
                        aspect={cropAspect}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                    </div>

                    {/* Bottom Controls of Crop Dialog */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-2.5">
                      {/* Aspect Ratio Toolbar & Quick Rotate / Full Buttons */}
                      <div className="flex items-center justify-between gap-1 px-2 py-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 max-w-sm mx-auto overflow-x-auto">
                        <div className="flex items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => setCropAspect(undefined)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${cropAspect === undefined ? 'bg-healthy-green text-white' : 'text-white/60 hover:text-white'}`}
                          >
                            Free
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCropAspect(16 / 9)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${cropAspect === 16 / 9 ? 'bg-healthy-green text-white' : 'text-white/60 hover:text-white'}`}
                          >
                            16:9 Wide
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCropAspect(4 / 3)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${cropAspect === 4 / 3 ? 'bg-healthy-green text-white' : 'text-white/60 hover:text-white'}`}
                          >
                            4:3
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCropAspect(3 / 4)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${cropAspect === 3 / 4 ? 'bg-healthy-green text-white' : 'text-white/60 hover:text-white'}`}
                          >
                            3:4
                          </button>
                        </div>

                        <div className="flex items-center gap-1 border-l border-white/10 pl-1.5">
                          <button 
                            type="button"
                            onClick={handleRotateCurrentCrop}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            title="Rotate image 90°"
                          >
                            <RotateCw className="w-3 h-3 text-[#34D399]" />
                            <span>Rotate</span>
                          </button>
                          <button 
                            type="button"
                            onClick={handleUseFullImage}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            title="Scan full photo"
                          >
                            <Maximize2 className="w-3 h-3 text-emerald-400" />
                            <span>Full</span>
                          </button>
                        </div>
                      </div>

                      {/* Interactive Zoom Bar */}
                      <div className="flex items-center justify-center gap-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-xs mx-auto">
                        <button 
                          onClick={() => setZoom(prev => Math.max(1, prev - 0.2))}
                          className="p-1 text-white/70 hover:text-white cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <input 
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-28 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-healthy-green"
                        />
                        <button 
                          onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                          className="p-1 text-white/70 hover:text-white cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-mono text-white/70 min-w-[28px] text-right">
                          {zoom.toFixed(1)}x
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => setStatus('idle')}
                          className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl text-xs font-bold border border-white/15 transition-all cursor-pointer"
                        >
                          CANCEL
                        </button>
                        <button 
                          onClick={handleConfirmCrop}
                          className="flex-[2] py-2.5 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl text-xs font-bold shadow-lg shadow-healthy-green/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          CONFIRM & ANALYZE
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {(status === 'detecting' || status === 'extracting' || status === 'analyzing') && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 sm:p-8 space-y-6 relative overflow-hidden"
                  >
                    {/* Ambient Glow */}
                    <div className="absolute w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Countdown Timer Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-md">
                      <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
                      <span className="text-xs font-mono font-bold tracking-wider text-[#6EE7B7]">{countdown}s</span>
                    </div>

                    {/* Rotating Concentric Scanner Rings */}
                    <div className="relative flex items-center justify-center w-28 h-28">
                      <div className="absolute inset-0 border-2 border-emerald-500/25 rounded-full animate-ping opacity-30" />
                      <div className="absolute inset-2 border-2 border-dashed border-emerald-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="absolute inset-4 border border-teal-400/30 rounded-full" />
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shadow-lg">
                        {status === 'detecting' ? (
                          <Eye className="w-7 h-7 text-emerald-400 animate-pulse" />
                        ) : status === 'extracting' ? (
                          <FileText className="w-7 h-7 text-emerald-400 animate-pulse" />
                        ) : (
                          <Cpu className="w-7 h-7 text-emerald-400 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Stage Headlines */}
                    <div className="text-center space-y-1.5 z-10">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#6EE7B7] bg-black/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        {status === 'detecting' ? 'Phase 1: OCR Recognition' : 
                         status === 'extracting' ? 'Phase 2: Additive Extraction' : 'Phase 3: Biochemical Audit'}
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                        {status === 'detecting' ? getAppUiStrings(appLanguage).detectingArea : 
                         status === 'extracting' ? getAppUiStrings(appLanguage).readingIngredients : getAppUiStrings(appLanguage).evaluatingRisks}
                      </h3>
                      <p className="text-xs text-white/60 max-w-[260px] mx-auto leading-relaxed">
                        {status === 'detecting' ? 'Finding the nutrition facts and ingredients' :
                         status === 'extracting' ? 'Extracting additives, preservatives & chemicals' : 'Calculating calibrated life-improvement grade'}
                      </p>
                    </div>

                    {/* Visual 3-Step Pipeline Tracker */}
                    <div className="w-full max-w-[280px] space-y-2 z-10 pt-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                          {status === 'detecting' ? 'Step 1 of 3' : status === 'extracting' ? 'Step 2 of 3' : 'Step 3 of 3'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          {status === 'detecting' ? '30%' : status === 'extracting' ? '65%' : '90%'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: status === 'detecting' ? '30%' : 
                                   status === 'extracting' ? '65%' : '90%' 
                          }}
                          transition={{ duration: 0.4 }}
                          className="h-full bg-gradient-to-r from-[#10B981] to-[#2DD4BF] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === 'editing' && (
                  <motion.div 
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex flex-col bg-white dark:bg-dark-card p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-dark-border">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-healthy-green/10 text-healthy-green rounded-xl">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{getAppUiStrings(appLanguage).reviewTitle}</h3>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">Verify ingredients before clinical scoring</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                        Editable
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col space-y-2">
                      <textarea 
                        value={extractedIngredients}
                        onChange={(e) => setExtractedIngredients(e.target.value)}
                        className="flex-1 w-full p-4 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-dark-border text-xs text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-healthy-green/20 focus:border-healthy-green outline-none resize-none font-mono leading-relaxed"
                        placeholder="Enter ingredients separated by commas..."
                      />
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        Tip: Separate ingredients with commas for optimal additive cross-referencing.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button 
                        onClick={() => setStatus('cropping')}
                        className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                      >
                        BACK TO CROP
                      </button>
                      <button 
                        onClick={() => analyzeIngredients(extractedIngredients)}
                        className="flex-[2] py-3 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl text-xs font-bold shadow-lg shadow-healthy-green/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        ANALYZE NOW
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Precision HUD Reticle & Sweeping Laser Beam (Only in idle) */}
              {status === 'idle' && !capturedImage && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 pointer-events-none z-10">
                  <div className="w-full h-full max-w-[280px] max-h-[360px] relative transition-all duration-300">
                    {/* Sleek Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-3 border-l-3 border-[#34D399] rounded-tl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-3 border-r-3 border-[#34D399] rounded-tr-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-3 border-l-3 border-[#34D399] rounded-bl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-3 border-r-3 border-[#34D399] rounded-br-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-40">
                      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white" />
                    </div>

                    {/* Sweeping Laser Beam */}
                    <motion.div
                      initial={{ top: '8%' }}
                      animate={{ top: '90%' }}
                      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2.2, ease: 'easeInOut' }}
                      className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[rgba(52,211,153,0.4)] to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                    />

                    {/* Center Framing Guide Pill */}
                    <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
                      <span className="bg-black/60 backdrop-blur-md text-[#6EE7B7] text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 shadow-md flex items-center gap-1.5">
                        <span>{viewfinderMode === 'landscape' ? '🖥️ WIDE STAGE (3:4 PORTRAIT CAMERA)' : '📱 PORTRAIT LABEL MODE'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Three Action Buttons: Outside the scan dialog box and below it */}
            <div className="flex flex-col items-center gap-3 pt-1">
              <div className="flex items-center justify-center gap-3 sm:gap-5 w-full max-w-sm">
                {/* Button 1: Upload Photo */}
                <button
                  onClick={triggerFileUpload}
                  className="flex-1 flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl bg-white dark:bg-dark-card border border-gray-200/80 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm cursor-pointer group min-h-[76px]"
                  title="Upload from gallery"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-healthy-green/10 text-gray-600 dark:text-gray-300 group-hover:text-healthy-green transition-colors mb-1">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide">Photo</span>
                </button>

                {/* Button 2: Primary Tactile Shutter Scan Button */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => handleScan()}
                  className="flex-[1.3] py-3.5 px-4 rounded-2xl bg-healthy-green hover:bg-[#2db34f] text-white shadow-lg shadow-healthy-green/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer min-h-[76px]"
                  title="Scan Ingredients"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner mb-0.5">
                    <Scan className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">SCAN</span>
                </motion.button>

                {/* Button 3: AI Rules & Thresholds */}
                <button
                  onClick={() => setShowRulesView(true)}
                  className="flex-1 flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl bg-white dark:bg-dark-card border border-gray-200/80 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-sm cursor-pointer group min-h-[76px]"
                  title="What rule we use to make your life improved"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-healthy-green/10 text-gray-600 dark:text-gray-300 group-hover:text-healthy-green transition-colors mb-1">
                    <ShieldCheck className="w-5 h-5 text-healthy-green" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide">Rules</span>
                </button>
              </div>

              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 text-center tracking-wide">
                Point at ingredients label or upload a photo
              </p>
            </div>

          </div>
        )}

        {activeTab === 'history' && (
          <ScanHistoryView
            history={history}
            onSelectScan={(item) => {
              setScanResult(sanitizeScanResult(item));
              setStatus('result');
            }}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onStartScan={() => setActiveTab('scan')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
            dietaryPreferences={dietaryPreferences}
            onUpdateDietaryPreferences={(prefs) => {
              setDietaryPreferences(prefs);
              try {
                localStorage.setItem('purescan_dietary_preferences', JSON.stringify(prefs));
              } catch (e) {
                console.error("Failed to save allergen preferences:", e);
              }
            }}
            dietaryLifestylePreferences={dietaryLifestylePreferences}
            onUpdateDietaryLifestylePreferences={(prefs) => {
              setDietaryLifestylePreferences(prefs);
              try {
                localStorage.setItem('purescan_dietary_lifestyle_preferences', JSON.stringify(prefs));
              } catch (e) {
                console.error("Failed to save dietary lifestyle preferences:", e);
              }
            }}
            allergenDietaryEnabled={allergenDietaryEnabled}
            onToggleAllergenDietaryEnabled={(val) => {
              const next = typeof val === 'boolean' ? val : !allergenDietaryEnabled;
              setAllergenDietaryEnabled(next);
              try {
                localStorage.setItem('purescan_allergen_dietary_enabled', String(next));
              } catch (e) {
                console.error(e);
              }
            }}
            allergensEnabled={allergensEnabled}
            onToggleAllergensEnabled={(val) => {
              const next = typeof val === 'boolean' ? val : !allergensEnabled;
              setAllergensEnabled(next);
              try {
                localStorage.setItem('purescan_allergens_enabled', String(next));
              } catch (e) {
                console.error(e);
              }
            }}
            dietaryEnabled={dietaryEnabled}
            onToggleDietaryEnabled={(val) => {
              const next = typeof val === 'boolean' ? val : !dietaryEnabled;
              setDietaryEnabled(next);
              try {
                localStorage.setItem('purescan_dietary_enabled', String(next));
              } catch (e) {
                console.error(e);
              }
            }}
            familyGuardEnabled={familyGuardEnabled}
            onToggleFamilyGuardEnabled={(val) => {
              const next = typeof val === 'boolean' ? val : !familyGuardEnabled;
              setFamilyGuardEnabled(next);
              try {
                localStorage.setItem('purescan_family_guard_enabled', String(next));
              } catch (e) {
                console.error(e);
              }
            }}
            familyProfiles={familyProfiles}
            onUpdateFamilyProfiles={(profiles) => {
              setFamilyProfiles(profiles);
              try {
                localStorage.setItem('purescan_family_profiles', JSON.stringify(profiles));
              } catch (e) {
                console.error("Failed to save family profiles:", e);
              }
            }}
            autoScan={autoScan}
            onToggleAutoScan={() => {
              const next = !autoScan;
              setAutoScan(next);
              try {
                localStorage.setItem('purescan_auto_scan', String(next));
              } catch (e) {
                console.error(e);
              }
            }}
            anonymousAnalytics={anonymousAnalytics}
            onToggleAnonymousAnalytics={() => {
              const next = !anonymousAnalytics;
              setAnonymousAnalytics(next);
              try {
                localStorage.setItem('purescan_anonymous_analytics', String(next));
              } catch (e) {
                console.error(e);
              }
            }}
            customApiKey={customApiKey}
            onSaveApiKey={handleSaveApiKey}
            aiProvider={aiProvider}
            onSwitchAiProvider={handleSwitchAiProvider}
            customGroqApiKey={customGroqApiKey}
            onSaveGroqApiKey={handleSaveGroqApiKey}
            geminiThinkingLevel={geminiThinkingLevel}
            onUpdateGeminiThinkingLevel={handleUpdateGeminiThinkingLevel}
            onTestKey={handleTestKeyStatus}
            testingKey={testingKey}
            keyTestReport={keyTestReport}
            apiLogs={apiLogs}
            onOpenRules={() => setShowRulesView(true)}
            onOpenLegal={(type) => setShowLegalView(type)}
            onOpenSupport={() => setShowSupportPopup(true)}
            onOpenFeedback={handleOpenFeedback}
            onOpenKeyTutorial={() => setShowKeyTutorial(true)}
            onWipeAllData={async () => {
              setHistory([]);
              try {
                localStorage.removeItem('purescan_history');
              } catch (e) {
                console.error(e);
              }
              if (user) {
                const { error } = await supabase.from('scans').delete().eq('user_id', user.id);
                if (error) console.error("Failed to wipe history from Supabase:", error);
              }
              setError("All scan history records wiped successfully.");
              setTimeout(() => setError(null), 3000);
            }}
            historyCount={history.length}
            todayScanCount={history.filter(h => {
              if (!h || !h.timestamp) return false;
              try {
                const logDate = typeof h.timestamp === 'number' 
                  ? new Date(h.timestamp).toISOString().split('T')[0]
                  : String(h.timestamp).includes('T')
                  ? String(h.timestamp).split('T')[0]
                  : new Date(h.timestamp).toISOString().split('T')[0];
                return logDate === new Date().toISOString().split('T')[0];
              } catch {
                return false;
              }
            }).length}
            user={user}
            reportLanguage={reportLanguage}
            onSelectReportLanguage={(lang) => {
              setReportLanguage(lang);
              try {
                localStorage.setItem('purescan_report_language', lang);
              } catch (e) {
                console.error(e);
              }
            }}
            appLanguage={appLanguage}
            onSelectAppLanguage={(lang) => {
              setAppLanguage(lang);
              try {
                localStorage.setItem('purescan_app_language', lang);
              } catch (e) {
                console.error(e);
              }
            }}
            onExportCSV={() => {
              if (history.length === 0) return;
              const headers = ['Date', 'Time', 'Product Name', 'Grade', 'Score (100)', 'Risk Count', 'Flagged Additives', 'Healthier Alternative'];
              const rows = history.map(item => {
                const dateObj = new Date(item.timestamp);
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const risks = item.riskyIngredients.map(r => `${r.name} (${r.risk})`).join('; ');
                const alt = item.alternative?.name ? `${item.alternative.name}: ${item.alternative.reason}` : 'None';

                return [
                  `"${date}"`,
                  `"${time}"`,
                  `"${item.productName.replace(/"/g, '""')}"`,
                  `"${item.grade}"`,
                  item.score,
                  item.riskyIngredients.length,
                  `"${risks.replace(/"/g, '""')}"`,
                  `"${alt.replace(/"/g, '""')}"`
                ].join(',');
              });

              const csvContent = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `purescan_history_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            onImportCSV={async (importedScans) => {
              if (!importedScans || importedScans.length === 0) {
                return { count: 0, error: 'No scan records found in CSV.' };
              }

              const sanitized = importedScans.map(sanitizeScanResult);

              setHistory(prev => {
                const existingKeys = new Set(prev.map(p => `${p.productName.toLowerCase()}_${p.timestamp}`));
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = sanitized.filter(item => 
                  !existingIds.has(item.id) && !existingKeys.has(`${item.productName.toLowerCase()}_${item.timestamp}`)
                );
                const merged = [...newItems, ...prev];
                try {
                  localStorage.setItem('purescan_history', JSON.stringify(merged));
                } catch (e) {
                  console.error("Failed to save imported history to localStorage:", e);
                }
                return merged;
              });

              if (user) {
                try {
                  const recordsToInsert = sanitized.map(item => ({
                    ...item,
                    user_id: user.id
                  }));
                  const { error } = await supabase.from('scans').upsert(recordsToInsert, { onConflict: 'id' });
                  if (error) console.error("Supabase import sync error:", error);
                } catch (err) {
                  console.error("Failed to sync imported scans to Supabase:", err);
                }
              }

              return { count: sanitized.length };
            }}
          />
        )}
      </main>
      </ErrorBoundary>

      {/* Result Card (Bottom Sheet) */}
      <AnimatePresence>
        {status === 'result' && (
          <>
            {/* Backdrop */}
            <motion.div
              key="result-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onClick={closeResult}
              style={{ willChange: 'opacity' }}
              className="absolute inset-0 bg-black/45 z-20 transform-gpu"
            />
            
            {/* Sheet */}
            <motion.div
              key="result-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%", transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: "spring", damping: 32, stiffness: 380, mass: 0.65 }}
              style={{ willChange: 'transform' }}
              className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card rounded-t-[40px] z-30 shadow-2xl max-h-[90%] ${isExporting ? 'overflow-hidden' : 'overflow-y-auto'} relative transform-gpu`}
            >
              {/* Clinical PDF Generation Overlay */}
              <AnimatePresence>
                {isExporting && (
                  <motion.div
                    key="pdf-exporting-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    style={{ willChange: 'opacity' }}
                    className="absolute inset-0 bg-white/95 dark:bg-dark-card/95 z-50 rounded-t-[40px] flex flex-col items-center justify-center p-6 text-center space-y-4 transform-gpu"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-healthy-green/10 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-healthy-green animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generating Clinical PDF</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                        Rendering high-resolution A4 document with automated pagination...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button (Visible on App, Hidden in PDF) */}
              <button 
                onClick={closeResult}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors z-40 print:hidden"
                aria-label="Close report"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* PDF Content Wrapper */}
              <div className="bg-white dark:bg-dark-card">
                {/* Handle */}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mt-4 mb-2 print:hidden" />
                
                <div 
                  id="pdf-report-capture-area"
                  className="p-5 sm:p-7 space-y-6 sm:space-y-8 report-container"
                >
                  {/* Professional Report Header (PDF Refined) */}
                  <div className="pdf-section report-header flex justify-between items-center border-b border-gray-900 pb-3 dark:border-white">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
                          <Scan className="w-6 h-6 text-white dark:text-gray-900" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter serif-header dark:text-white uppercase">{getReportOntology(reportLanguage).title}</h1>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 uppercase">DOCUMENT REF: PS-{scanResult?.id.slice(0,8).toUpperCase() || "8D038A44"}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white serif-header">{getReportOntology(reportLanguage).auditReport}</h2>
                      <p className="text-[10px] text-gray-500 font-medium">Issue Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[10px] text-gray-400 font-mono uppercase">LANG: {reportLanguage.toUpperCase()} • PURESCAN-GEMINI-CORE-3.0</p>
                    </div>
                  </div>

                  {/* Standard Header (App View) */}
                  <div className="pdf-section report-product-title flex flex-col items-center justify-center pt-2 text-center">
                    <h2 className="serif-title text-gray-900 dark:text-white leading-tight mb-1">
                      {scanResult?.productName || "Unknown Product"}
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">BIOCHEMICAL ANALYSIS RESULT</p>
                  </div>

                  {/* Impact Summary Section */}
                  <div id="pdf-impact-summary-section" className="pdf-section impact-summary-section flex flex-col items-center space-y-5">
                    <div className="relative impact-gauge-box">
                      {scanResult && (() => {
                        const gradeColor = getHealthScoreColor(scanResult.grade, scanResult.score);
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const targetOffset = circumference - (scanResult.score / 100) * circumference;
                        const currentOffset = isExporting
                          ? targetOffset
                          : circumference - (animatedScore / 100) * circumference;

                        return (
                          <motion.div
                            initial={{ scale: 0.72, opacity: 0, y: 18 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.15 }}
                            className="relative flex flex-col items-center justify-center"
                          >
                            {/* Ambient Glow Aura */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 0.22, scale: 1.15 }}
                              transition={{ duration: 1.2, delay: 0.2 }}
                              className="absolute w-44 h-44 rounded-full blur-2xl pointer-events-none"
                              style={{ backgroundColor: gradeColor }}
                            />

                            <div className="relative flex items-center justify-center w-48 h-48 score-circle-wrapper">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  stroke="#F3F4F6"
                                  className="dark:stroke-slate-800"
                                  strokeWidth="8"
                                  fill="transparent"
                                />
                                <motion.circle
                                  cx="50"
                                  cy="50"
                                  r={radius}
                                  stroke={gradeColor}
                                  strokeWidth="10"
                                  fill="transparent"
                                  strokeDasharray={circumference}
                                  initial={{ strokeDashoffset: circumference }}
                                  animate={{ strokeDashoffset: currentOffset }}
                                  transition={{ duration: 1.4, ease: "easeOut" }}
                                  strokeLinecap="round"
                                  style={{ filter: `drop-shadow(0 0 6px ${gradeColor}40)` }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <motion.span 
                                  initial={{ scale: 0.25, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}
                                  className="text-7xl font-black serif-header"
                                  style={{ color: gradeColor }}
                                >
                                  {scanResult?.grade || 'C'}
                                </motion.span>
                                <motion.span 
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.35 }}
                                  className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1"
                                >
                                  {getReportOntology(reportLanguage).score} {isExporting ? (scanResult?.score ?? 50) : animatedScore}
                                </motion.span>
                              </div>
                            </div>

                            {/* Rewarding Health Status Badge */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ 
                                opacity: (isExporting || animatedScore >= (scanResult?.score ?? 50)) ? 1 : 0,
                                scale: (isExporting || animatedScore >= (scanResult?.score ?? 50)) ? 1 : 0.85
                              }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-sm"
                              style={{
                                backgroundColor: `${gradeColor}15`,
                                color: gradeColor,
                                borderColor: `${gradeColor}35`
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: gradeColor }} />
                              {(scanResult?.score ?? 50) >= 75 ? getReportOntology(reportLanguage).cleanBadge : (scanResult?.score ?? 50) >= 50 ? getReportOntology(reportLanguage).cautionBadge : getReportOntology(reportLanguage).hazardBadge}
                            </motion.div>
                          </motion.div>
                        );
                      })()}
                    </div>

                    <div className="max-w-xs text-center space-y-2 impact-text-wrapper">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{getReportOntology(reportLanguage).impactSummary}</h3>
                      <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                        {scanResult?.grade === 'A'
                          ? getReportOntology(reportLanguage).pristineProfile
                          : scanResult?.grade === 'B'
                          ? getReportOntology(reportLanguage).favorableProfile
                          : scanResult?.grade === 'C'
                          ? getReportOntology(reportLanguage).moderateProfile
                          : getReportOntology(reportLanguage).criticalProfile}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full max-w-sm impact-cards-grid">
                      <div className="p-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl text-center space-y-0.5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{getReportOntology(reportLanguage).riskLevel}</p>
                        <p className={`text-base font-black uppercase ${scanResult?.score !== undefined && scanResult.score < 40 ? 'text-critical-red' : 'text-warning-amber'}`}>
                          {scanResult?.score !== undefined && scanResult.score < 40 ? getReportOntology(reportLanguage).critical : getReportOntology(reportLanguage).moderate}
                        </p>
                      </div>
                      <div className="p-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl text-center space-y-0.5">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">INTEGRITY</p>
                        <p className="text-base font-black text-gray-900 dark:text-white uppercase">{getReportOntology(reportLanguage).verifiedAi}</p>
                      </div>
                    </div>

                    {/* Feature 4 & 5 Quick Action Pill Bar (Listen to Voice Verdict + Share Food Truth Card) */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-md pt-2 print:hidden">
                      <button
                        type="button"
                        id="btn-voice-summary-readout"
                        onClick={handleToggleVoiceSummary}
                        className={`flex-1 min-w-[160px] py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border shadow-sm active:scale-95 ${
                          isSpeakingResult
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/25 animate-pulse'
                            : 'bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70'
                        }`}
                      >
                        {isSpeakingResult ? (
                          <>
                            <VolumeX className="w-4 h-4 shrink-0" />
                            <span>STOP VOICE READOUT</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 shrink-0" />
                            <span>LISTEN TO VERDICT ({reportLanguage.toUpperCase()})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id="btn-open-food-truth-card-top"
                        onClick={() => setShowTruthCardModal(true)}
                        className="flex-1 min-w-[160px] py-3 px-4 rounded-2xl bg-healthy-green/10 hover:bg-healthy-green/20 text-healthy-green border border-healthy-green/30 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Share2 className="w-4 h-4 shrink-0" />
                        <span>FOOD TRUTH CARD</span>
                      </button>
                    </div>
                  </div>

                  {/* Target Demographic & Marketing Forensics Card (Groq Clinical & Demographic AI) */}
                  {scanResult && (
                    <div
                      id="result-target-demographics-card"
                      className="pdf-section p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-purple-500/10 dark:from-amber-950/20 dark:via-dark-card dark:to-purple-950/20 border border-amber-300/80 dark:border-amber-700/60 space-y-4 shadow-xs"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                            <Scale className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">
                                Target Demographic & Marketing Forensics
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                🎯 TARGET: {scanResult.targetAudience || 'General Consumers'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              AI unmasking of intended audience, deceptive health halos & demographic-adjusted scoring
                            </p>
                          </div>
                        </div>

                        {/* NOVA & Glycemic Quick Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs">
                            NOVA {scanResult.novaGroup || (scanResult.score < 50 ? 4 : 2)}: {scanResult.novaGroup === 4 || scanResult.score < 50 ? 'Ultra-Processed' : 'Processed'}
                          </span>
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase border ${
                            (scanResult.glycemicImpact || '').toLowerCase().includes('extreme') || (scanResult.glycemicImpact || '').toLowerCase().includes('high')
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          }`}>
                            ⚡ {scanResult.glycemicImpact || 'Moderate Glycemic'}
                          </span>
                        </div>
                      </div>

                      {/* Marketing Deception Forensic Analysis Box */}
                      {scanResult.targetMarketingAnalysis && (
                        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-gray-200/80 dark:border-dark-border space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            Marketing Hook & Deceptive Health Halo Audit:
                          </span>
                          <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                            {scanResult.targetMarketingAnalysis}
                          </p>
                        </div>
                      )}

                      {/* Demographic Vulnerability Alert */}
                      {scanResult.demographicRiskAlert && (
                        <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-300/80 dark:border-rose-800/60 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                            Demographic Vulnerability Warning:
                          </span>
                          <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                            {scanResult.demographicRiskAlert}
                          </p>
                        </div>
                      )}

                      {/* Clinical Score Calibration Explanation */}
                      {scanResult.scoreExplanation && (
                        <div className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                          <span className="font-extrabold uppercase tracking-wide mr-1.5">⚖️ Score Calibration:</span>
                          {scanResult.scoreExplanation}
                        </div>
                      )}

                      {/* Demographic Suitability Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {[
                          { label: 'Children', icon: '🧒', key: 'children' as const },
                          { label: 'Diabetics', icon: '🩺', key: 'diabetics' as const },
                          { label: 'Athletes', icon: '🏋️', key: 'fitness' as const },
                          { label: 'General', icon: '👥', key: 'general' as const }
                        ].map(d => {
                          const status = scanResult.demographicSafety?.[d.key] || (scanResult.score < 40 ? 'avoid' : scanResult.score < 70 ? 'caution' : 'safe');
                          const isSafe = status === 'safe';
                          const isCaution = status === 'caution';
                          return (
                            <div
                              key={d.key}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-1.5 ${
                                isSafe
                                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-800 dark:text-emerald-300'
                                  : isCaution
                                  ? 'bg-amber-500/10 border-amber-400/30 text-amber-800 dark:text-amber-300'
                                  : 'bg-rose-500/10 border-rose-400/30 text-rose-800 dark:text-rose-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{d.icon}</span>
                                <span className="text-xs font-bold">{d.label}</span>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                isSafe ? 'bg-emerald-600 text-white' : isCaution ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
                              }`}>
                                {isSafe ? 'Safe' : isCaution ? 'Caution' : 'Avoid'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Feature 1: Family & Household Multi-Profile Compatibility Guard */}
                  {familyGuardEnabled && currentFamilyCompatibility.length > 0 && (
                    <div
                      id="result-family-compatibility-card"
                      className="pdf-section p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 dark:from-slate-900 dark:via-dark-card dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-900/50 space-y-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">
                              Family & Household Compatibility Guard
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Instant safety check across {currentFamilyCompatibility.length} active family member profile{currentFamilyCompatibility.length === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                          MULTI-PROFILE CHECK
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {currentFamilyCompatibility.map((fc) => {
                          const isSafe = fc.status === 'safe';
                          const isCaution = fc.status === 'caution';
                          return (
                            <div
                              key={fc.member.id}
                              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2 ${
                                isSafe
                                  ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800/60'
                                  : isCaution
                                  ? 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/60'
                                  : 'bg-rose-50/70 dark:bg-rose-950/35 border-rose-300 dark:border-rose-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xl shrink-0">{fc.member.avatarEmoji}</span>
                                  <div className="min-w-0">
                                    <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                      {fc.member.name}
                                    </h4>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">
                                      {fc.member.role}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                    isSafe
                                      ? 'bg-emerald-600 text-white'
                                      : isCaution
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-rose-600 text-white'
                                  }`}
                                >
                                  {isSafe ? '✓ SAFE' : isCaution ? '⚠ CAUTION' : '✕ UNSAFE'}
                                </span>
                              </div>

                              <p
                                className={`text-[11px] font-semibold leading-snug ${
                                  isSafe
                                    ? 'text-emerald-800 dark:text-emerald-300'
                                    : isCaution
                                    ? 'text-amber-900 dark:text-amber-300'
                                    : 'text-rose-900 dark:text-rose-300'
                                }`}
                              >
                                {fc.reasons.slice(0, 2).join(' • ')}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ingredient Audit Title */}
                  <div className="pdf-section ingredient-audit-title flex items-center justify-between pt-4 pb-1 border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-critical-red animate-pulse" />
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-baseline gap-3">
                        {getReportOntology(reportLanguage).ingredientAudit}
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          ({(scanResult?.riskyIngredients || []).length} {getReportOntology(reportLanguage).concernsIdentified})
                        </span>
                      </h3>
                    </div>
                  </div>

                  {/* Global Regulatory Ban Tracker Banner (FSSAI vs. EU EFSA vs. US FDA) */}
                  {currentRegulatoryOverview && (
                    <div
                      id="global-regulatory-ban-tracker-card"
                      className="pdf-section p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-amber-50/40 dark:from-slate-900 dark:via-dark-card dark:to-slate-900 border border-gray-200/90 dark:border-dark-border space-y-4 shadow-xs"
                    >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white tracking-tight">
                                Global Regulatory Ban & Warning Tracker
                              </h4>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Cross-referenced against 🇮🇳 FSSAI (India), 🇪🇺 EU EFSA (Europe) & 🇺🇸 US FDA statutory rules
                              </p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (currentRegulatoryOverview.matchedAdditives.length > 0) {
                                setSelectedRegulatoryModalInfo(currentRegulatoryOverview.matchedAdditives[0].info);
                                setSelectedJurisdictionFocus(null);
                              } else if (scanResult?.riskyIngredients && scanResult.riskyIngredients.length > 0) {
                                setSelectedRegulatoryModalInfo(
                                  createFallbackRegulatoryInfo(
                                    scanResult.riskyIngredients[0].name,
                                    scanResult.riskyIngredients[0].description,
                                    scanResult.riskyIngredients[0].risk
                                  )
                                );
                                setSelectedJurisdictionFocus(null);
                              }
                            }}
                            className={`text-[10px] font-mono font-extrabold px-3 py-1.5 rounded-full border cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs ${
                              currentRegulatoryOverview.hasAnyBanned
                                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                                : currentRegulatoryOverview.matchedAdditives.length > 0
                                ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                            }`}
                            title="Click to view regulatory audit summary and statutory laws"
                          >
                            <span>
                              {currentRegulatoryOverview.hasAnyBanned
                                ? 'GLOBAL BAN DETECTED'
                                : currentRegulatoryOverview.matchedAdditives.length > 0
                                ? `${currentRegulatoryOverview.matchedAdditives.length} REGULATED ADDITIVE${currentRegulatoryOverview.matchedAdditives.length === 1 ? '' : 'S'}`
                                : 'GLOBALLY COMPLIANT'}
                            </span>
                            <span className="text-xs">↗</span>
                          </button>
                        </div>

                        {/* Interactive Clickable Flagged Additives Row */}
                        {currentRegulatoryOverview.matchedAdditives.length > 0 && (
                          <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/50 space-y-2">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                Flagged Additives (Tap chemical to see why flagged & laws):
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                                {currentRegulatoryOverview.matchedAdditives.length} flagged
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {currentRegulatoryOverview.matchedAdditives.map((item, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRegulatoryModalInfo(item.info);
                                    setSelectedJurisdictionFocus(null);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-amber-300/90 dark:border-amber-700 hover:border-amber-500 shadow-2xs hover:scale-105 active:scale-95 transition-all text-gray-800 dark:text-gray-100 cursor-pointer"
                                  title={`Tap to see why ${item.ingredientName} is flagged and its statutory laws`}
                                >
                                  <span>{item.ingredientName}</span>
                                  {item.info.code && (
                                    <span className="text-[10px] text-gray-500 font-mono">({item.info.code})</span>
                                  )}
                                  <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 ml-0.5">⚖️ Laws ↗</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3-Jurisdiction Summary Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            {
                              flag: '🇮🇳',
                              agency: 'FSSAI (India)' as const,
                              count: currentRegulatoryOverview.fssaiBannedOrWarnedCount,
                              sub: 'Statutory Warnings / Caps'
                            },
                            {
                              flag: '🇪🇺',
                              agency: 'EU EFSA' as const,
                              displayAgency: 'EU EFSA (Europe)',
                              count: currentRegulatoryOverview.euBannedOrWarnedCount,
                              sub: 'EU Bans / Child Warnings'
                            },
                            {
                              flag: '🇺🇸',
                              agency: 'US FDA' as const,
                              displayAgency: 'US FDA / CA Act',
                              count: currentRegulatoryOverview.fdaBannedOrWarnedCount,
                              sub: 'FDA / State Restrictions'
                            }
                          ].map((jur) => {
                            const isFlagged = jur.count > 0;
                            return (
                              <button
                                key={jur.agency}
                                type="button"
                                onClick={() => {
                                  // Find additive with ruling for this agency or pick first
                                  const matched = currentRegulatoryOverview.matchedAdditives.find(m =>
                                    m.info.rulings.some(r => r.agency === jur.agency && (r.level === 'banned' || r.level === 'warning' || r.level === 'restricted'))
                                  ) || currentRegulatoryOverview.matchedAdditives[0];

                                  if (matched) {
                                    setSelectedJurisdictionFocus(jur.agency);
                                    setSelectedRegulatoryModalInfo(matched.info);
                                  } else if (scanResult?.riskyIngredients && scanResult.riskyIngredients.length > 0) {
                                    setSelectedJurisdictionFocus(jur.agency);
                                    setSelectedRegulatoryModalInfo(
                                      createFallbackRegulatoryInfo(
                                        scanResult.riskyIngredients[0].name,
                                        scanResult.riskyIngredients[0].description,
                                        scanResult.riskyIngredients[0].risk
                                      )
                                    );
                                  }
                                }}
                                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                                  isFlagged
                                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50 hover:border-amber-400'
                                    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">{jur.flag}</span>
                                    <span className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
                                      {jur.displayAgency || jur.agency}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                    {jur.sub}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5 shrink-0">
                                  <span
                                    className={`px-2 py-1 rounded-xl text-[10px] font-black font-mono shrink-0 ${
                                      isFlagged
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-emerald-600 text-white'
                                    }`}
                                  >
                                    {isFlagged ? `${jur.count} Flagged` : '✓ Clean'}
                                  </span>
                                  {isFlagged && (
                                    <span className="text-[8.5px] font-bold text-amber-700 dark:text-amber-400">
                                      Laws & Why ↗
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Risky Ingredients - Refined Cards with Global Legal Status Badges */}
                  <div className="space-y-4">
                    {(scanResult?.riskyIngredients || []).map((ing, idx) => {
                      const regInfo = getAdditiveRegulatoryStatus(
                        ing.name,
                        `${ing.description || ''} ${ing.implications || ''}`
                      ) || createFallbackRegulatoryInfo(ing.name, `${ing.description || ''} ${ing.implications || ''}`, ing.risk);

                      return (
                        <div 
                          key={idx} 
                          className={`pdf-section ingredient-card ${
                            ing.risk === 'high' ? 'ingredient-card-high' : 'ingredient-card-medium'
                          }`}
                        >
                          <div className="flex items-start gap-6">
                            <div className={`mt-2 w-4 h-4 rounded-full shrink-0 ${ing.risk === 'high' ? 'bg-critical-red' : 'bg-warning-amber'}`} />
                            <div className="space-y-2.5 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h4 className="text-xl font-black text-gray-900 dark:text-white serif-header">{ing.name}</h4>
                                {regInfo?.code && (
                                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-700">
                                    {regInfo.code}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                {ing.description} {ing.implications}
                              </p>

                              {/* Global Legal Status Badges (FSSAI, EU EFSA, US FDA) */}
                              {regInfo && (
                                <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60 space-y-2">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {regInfo.rulings.map((r) => {
                                      const isBanned = r.level === 'banned';
                                      const isWarn = r.level === 'warning';
                                      return (
                                        <button
                                          type="button"
                                          key={r.agency}
                                          onClick={() => {
                                            setSelectedJurisdictionFocus(r.agency);
                                            setSelectedRegulatoryModalInfo(regInfo);
                                          }}
                                          title={`Click to view why it's flagged and statutory law under ${r.agency}`}
                                          className={`cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold tracking-wide border hover:scale-105 active:scale-95 transition-all ${
                                            isBanned
                                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs hover:bg-rose-700'
                                              : isWarn
                                              ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-400/60 hover:bg-amber-200 dark:hover:bg-amber-900/80'
                                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
                                          }`}
                                        >
                                          <span>{r.flag}</span>
                                          <span>{r.agency}: {r.badge}</span>
                                          <span className="text-[9px] opacity-75">↗</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedJurisdictionFocus(null);
                                      setSelectedRegulatoryModalInfo(regInfo);
                                    }}
                                    className="cursor-pointer text-left text-[11px] font-semibold text-amber-800 dark:text-amber-300 leading-snug hover:underline flex items-center justify-between gap-2 w-full pt-0.5"
                                  >
                                    <span>⚖️ Global Ruling: {regInfo.regulatorySummary}</span>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                      Why Flagged & Laws ↗
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommended Swap - Designs Matches Screenshot */}
                  {scanResult?.alternative && (
                    <div className="pdf-section swap-card bg-[#0F172A] text-white p-6 sm:p-7 rounded-3xl space-y-3 relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-1 bg-[#22C55E]" />
                        <h3 className="text-[10px] font-black text-[#22C55E] uppercase tracking-[0.2em]">{getReportOntology(reportLanguage).recommendedSwap}</h3>
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-xl sm:text-2xl font-black tracking-tight leading-snug uppercase break-words">
                          {scanResult.alternative.name}
                        </h4>
                        <p className="text-gray-300 text-sm sm:text-base italic leading-relaxed break-words">
                          {scanResult.alternative.reason}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Medical Context & Legal / Official Verification (High-Density Clinical Layout) */}
                  <div className="pdf-section medical-verification-section pt-6 space-y-5 border-t border-gray-300 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                      <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-gray-700 dark:text-gray-300 shrink-0" />
                          <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                            {getReportOntology(reportLanguage).medicalContext}
                          </h4>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed text-justify font-medium">
                          {getReportOntology(reportLanguage).disclaimer} THIS IS NOT A REPLACEMENT FOR PROFESSIONAL MEDICAL ADVICE. Laboratory testing is the only definitive method for determining ingredient purity. Individuals with clinical health conditions or severe allergies must prioritize physical labels and professional medical consultations over this automated report.
                        </p>
                        
                        <div className="flex gap-6 pt-1">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{getReportOntology(reportLanguage).methodology}</p>
                            <p className="text-[9px] font-bold font-mono text-gray-700 dark:text-gray-300">CV_HYBRID_ONTOLOGY_4.0</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">REVIEWER</p>
                            <p className="text-[9px] font-bold font-mono uppercase text-gray-700 dark:text-gray-300">AUTOMATED_AI_AGENT</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">SECURITY</p>
                            <p className="text-[9px] font-bold font-mono uppercase text-emerald-600 dark:text-emerald-400">SHA256_VERIFIED</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* PureScan AI QR Code & Official Verification Card */}
                      <div id="pdf-verification-card" className="flex flex-col items-center justify-center p-3.5 sm:p-4 border-2 border-slate-900 dark:border-slate-300 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2 shadow-xs">
                        <div className="flex items-center gap-1.5 text-[8.5px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>PURESCAN AI VERIFICATION</span>
                        </div>
                        
                        <div id="pdf-verification-qr-box" className="p-1 bg-white rounded-xl border border-gray-200 shadow-2xs inline-block">
                          {qrCodeDataUrl ? (
                            <img 
                              id="pdf-verification-qr-img"
                              src={qrCodeDataUrl} 
                              alt="Scan QR code for pure-scan-ai-seven.vercel.app" 
                              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                            />
                          ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                              <Scan className="w-7 h-7 text-gray-400 animate-pulse" />
                              <span className="text-[8px] text-gray-400 mt-1 font-mono">LOADING QR</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5 max-w-full">
                          <a 
                            href="https://pure-scan-ai-seven.vercel.app" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 hover:underline block truncate tracking-tight"
                          >
                            pure-scan-ai-seven.vercel.app
                          </a>
                          <p className="text-[7.5px] font-bold text-gray-500 uppercase tracking-wider">
                            Scan QR or visit pure-scan-ai-seven.vercel.app to audit food purity
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center pt-2">
                      <p className="text-[8.5px] text-gray-400 text-center font-bold tracking-[0.3em] uppercase">
                        KNOW THE TRUTH, IMPROVE YOUR LIFE • PURESCAN CLINICAL INTEL • pure-scan-ai-seven.vercel.app
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="btn-share-food-truth-card"
                    onClick={() => setShowTruthCardModal(true)}
                    className="w-full py-4 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-healthy-green/25 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>SHARE FOOD TRUTH CARD</span>
                  </button>

                  <button 
                    onClick={exportToPDF}
                    disabled={isExporting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-75 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        GENERATING CLINICAL PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {getAppUiStrings(appLanguage).exportPdf}
                      </>
                    )}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setStatus('editing')}
                    className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {getAppUiStrings(appLanguage).edit}
                  </button>
                  <button 
                    onClick={closeResult}
                    className="flex-1 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-transform"
                  >
                    {getAppUiStrings(appLanguage).gotIt}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Feature 5: Shareable Food Truth Card (1-Image Social & WhatsApp Modal) */}
      {scanResult && (
        <FoodTruthCardModal
          isOpen={showTruthCardModal}
          onClose={() => setShowTruthCardModal(false)}
          productName={scanResult.productName || 'Scanned Food Item'}
          grade={scanResult.grade || 'C'}
          score={scanResult.score ?? 50}
          riskyIngredients={scanResult.riskyIngredients || []}
          alternative={scanResult.alternative}
          familyResults={currentFamilyCompatibility}
          targetAudience={scanResult.targetAudience}
          novaGroup={scanResult.novaGroup}
        />
      )}

      {/* Global Regulatory Ban & Warning Detail Modal */}
      <RegulatoryDetailModal
        isOpen={!!selectedRegulatoryModalInfo}
        onClose={() => {
          setSelectedRegulatoryModalInfo(null);
          setSelectedJurisdictionFocus(null);
        }}
        info={selectedRegulatoryModalInfo}
        productName={scanResult?.productName}
        selectedJurisdiction={selectedJurisdictionFocus}
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-toast"
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.96, transition: { duration: 0.14, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: "spring", damping: 28, stiffness: 420, mass: 0.5 }}
            style={{ willChange: 'transform, opacity' }}
            className="fixed bottom-24 left-6 right-6 z-50 transform-gpu"
          >
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Waving Hand Feedback Badge & Tally Modal */}
      <FeedbackWidget
        hideBubble={activeTab === 'settings' || showOnboarding || isExporting}
        externalTriggerOpen={externalTriggerFeedback}
        onResetExternalTrigger={() => setExternalTriggerFeedback(false)}
      />

      {/* Settings Top-Right Circular Floating Hamburger Navigation Menu (Only in Settings) */}
      <AnimatePresence>
        {activeTab === 'settings' && !showRulesView && showLegalView === 'none' && !showOnboarding && status !== 'result' && !showKeyTutorial && !showSupportPopup && !showExportSuccess && (
          <SettingsSubNav />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-dark-card/90 backdrop-blur-lg border-t border-gray-100 dark:border-dark-border px-8 py-4 flex items-center justify-between z-40 max-w-md mx-auto">
        <NavButton 
          active={activeTab === 'scan'} 
          onClick={() => setActiveTab('scan')} 
          icon={<Scan className="w-6 h-6" />} 
          label={getAppUiStrings(appLanguage).scanButton} 
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<History className="w-6 h-6" />} 
          label={getAppUiStrings(appLanguage).historyTab} 
        />
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<Settings className="w-6 h-6" />} 
          label={getAppUiStrings(appLanguage).settingsTab} 
        />
      </nav>

      {/* Onboarding Gate */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            key="onboarding-gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-[100] bg-white dark:bg-dark-bg flex flex-col p-8 overflow-y-auto no-scrollbar transform-gpu"
          >
            <div className="min-h-full flex flex-col items-center justify-center text-center space-y-8 py-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shadow-healthy-green/20 overflow-hidden">
                <img src={PURESCAN_LOGO_URL} alt="PureScan Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">PureScan AI</h2>
                <p className="text-healthy-green font-bold text-lg leading-tight px-4">
                  Scan the Label. Know the Truth. Make your life 1 step more Improved!
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-2">
                  Stop guessing. Start auditing. Most food labels are designed to confuse you. "Natural flavors," "Heart healthy," and "No added sugar" are often masks for ultra-processed ingredients that compromise your long-term health. PureScan uses advanced Computer Vision and proprietary AI to cut through the marketing fluff and give you the raw truth in seconds.
                </p>
              </div>

              <div className="w-full bg-gray-50 dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border space-y-4 text-left">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning-amber" />
                  Medical Disclaimer
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  PureScan provides nutritional information for educational purposes only. Our AI-generated health grades are not medical advice, a diagnosis, or a treatment plan. Always consult a healthcare professional before making dietary changes, especially if you have severe allergies or chronic conditions.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => {
                  setHasAcceptedTerms(true);
                  localStorage.setItem('purescan_terms_accepted', 'true');
                  setShowOnboarding(false);
                }}
                className="w-full py-5 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl font-bold shadow-xl shadow-healthy-green/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                ACCEPT & CONTINUE
              </button>
              <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
                By continuing, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What rule we use to make your life improved Overlay */}
      <AnimatePresence>
        {showRulesView && (
          <RulesAndThresholdsView onClose={() => setShowRulesView(false)} />
        )}
      </AnimatePresence>

      {/* Legal Views Overlay */}
      <AnimatePresence>
        {showLegalView !== 'none' && (
          <motion.div 
            key="legal-view-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] } }}
            transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.65 }}
            style={{ willChange: 'transform' }}
            className="fixed inset-0 z-[110] bg-white dark:bg-dark-bg flex flex-col transform-gpu"
          >
            <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border">
              <button 
                onClick={() => setShowLegalView('none')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronDown className="w-6 h-6 rotate-90 dark:text-white" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showLegalView === 'disclaimer' ? 'Medical Disclaimer' : 
                 showLegalView === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {showLegalView === 'disclaimer' && (
                <div className="prose prose-sm max-w-none space-y-6">
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dual AI Engine Non-Medical Advice</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      PureScan provides automated nutritional analysis and biochemical risk evaluations for educational purposes only. Analyses are powered dynamically by <strong>Google Gemini AI</strong> (Google DeepMind) and <strong>Groq LPU AI</strong> (Meta Llama & OpenAI GPT architectures). Health grades (A-F), clinical scores (0-100), and ingredient concern flags are not medical advice, a formal diagnosis, or a treatment plan.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Professional Medical & Dietary Consultation</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Always consult a qualified physician, certified allergist, or registered dietitian before making significant dietary changes, especially if you have severe food allergies, autoimmune conditions, or chronic illnesses. Do not disregard professional medical advice or delay seeking treatment due to automated AI health grades.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verification Against Physical Packaging</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      While both Google Gemini AI and Groq AI engines operate under strict clinical prompts, optical character recognition and AI language models can occasionally misinterpret packaging text. Always cross-reference AI findings with the physical product label.
                    </p>
                  </section>
                </div>
              )}

              {showLegalView === 'privacy' && (
                <div className="space-y-8">
                  <div className="bg-healthy-green/5 dark:bg-healthy-green/15 p-6 rounded-3xl border border-healthy-green/15 dark:border-healthy-green/25">
                    <h3 className="text-sm font-bold text-healthy-green uppercase tracking-widest mb-4">30-Second Privacy Summary</h3>
                    <ul className="space-y-3">
                      {[
                        "Dual AI Processing: Native support for Google Gemini AI & Groq LPU AI.",
                        "Data Minimization: Photo buffers are processed in temporary RAM and purged immediately.",
                        "Zero Biometric Tracking: No face recognition, biometric tracking, or identity recording.",
                        "Zero PII Exposure: No personal user information is transmitted to Google or Groq servers.",
                        "Complete Data Autonomy: Export or wipe your scan history locally or in Cloud anytime."
                      ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-healthy-green shrink-0 mt-0.5" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="prose prose-sm max-w-none space-y-6">
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ephemeral RAM Processing & Zero Image Retention</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        PureScan does not permanently store original packaging photos on remote servers. Image frames captured via camera or uploaded via file picker are held in transient base64 memory buffers, sent directly to your selected AI engine (Google Gemini or Groq LPU), and instantly purged upon text extraction. Only extracted text strings and calculated scan reports reside on your device.
                      </p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dual AI Infrastructure Disclosures (Gemini & Groq)</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        PureScan enables user-controlled toggling between <strong>Google Gemini AI</strong> and <strong>Groq LPU AI</strong>:
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                        <li><strong>Google Gemini AI:</strong> Encrypted HTTPS requests transmit packaging text directly to Google GenAI endpoints.</li>
                        <li><strong>Groq LPU Engine:</strong> Encrypted HTTPS requests transmit packaging text to Groq LPU hardware endpoints running Meta Llama (3.3 / 3.1) and OpenAI GPT OSS models.</li>
                      </ul>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                        Zero personally identifiable information (PII), such as names, email addresses, IP locations, or payment credentials, is ever transmitted to Google or Groq API servers.
                      </p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Biometric or Facial Tracking</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Camera access is strictly limited to scanning food ingredient labels. Viewfinder vision models monitor text boundaries exclusively; if a human face is detected in the viewfinder frame, scanning is instantly aborted.
                      </p>
                    </section>
                    <section className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Data Autonomy & Deletion</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        You hold full ownership of your data. You can export your historical scans as structured CSV or clinical PDF reports, or permanently erase all scan history and local preferences with a single tap in Settings.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {showLegalView === 'terms' && (
                <div className="prose prose-sm max-w-none space-y-6">
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">"As-Is" Dual AI Service Operation</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      PureScan is provided on an "as-is" and "as-available" basis across both Google Gemini and Groq LPU AI engines without warranties of any kind, express or implied.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Verification Responsibility</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Users are solely responsible for verifying AI findings against physical packaging before consuming any food item. PureScan accepts no liability for consumption decisions made based on AI automated scoring.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Automated Model Updates & Fallbacks</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      PureScan reserves the right to dynamically optimize AI model routes between Google Gemini and Groq model versions to maintain zero latency and high availability.
                    </p>
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Popup */}
      <AnimatePresence>
        {showInstallPopup && (
          <motion.div
            key="install-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 transform-gpu"
          >
            <div
              onClick={() => setShowInstallPopup(false)}
              className="absolute inset-0 bg-black/55"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-[32px] p-8 shadow-2xl text-center space-y-6 transform-gpu"
            >
              <div className="w-16 h-16 bg-healthy-green/10 dark:bg-healthy-green/20 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 text-healthy-green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Install PureScan AI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Install PureScan AI on your home screen for faster access and a better experience.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-4 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl font-bold shadow-lg shadow-healthy-green/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  INSTALL NOW
                </button>
                <button
                  onClick={() => setShowInstallPopup(false)}
                  className="w-full py-4 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold active:scale-[0.98] transition-all"
                >
                  MAYBE LATER
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Us Popup */}
      <AnimatePresence>
        {showSupportPopup && (
          <motion.div
            key="support-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 transform-gpu"
          >
            <div
              onClick={() => setShowSupportPopup(false)}
              className="absolute inset-0 bg-black/55"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar bg-white dark:bg-dark-card rounded-[32px] p-6 sm:p-8 shadow-2xl text-center space-y-5 transform-gpu"
            >
              <button
                type="button"
                onClick={() => setShowSupportPopup(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 bg-[#10b981]/15 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-[#10b981] fill-[#10b981]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Support PureScan AI</h3>
                <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
                  <img
                    src="https://res.cloudinary.com/ketsuujx/image/upload/v1794641001/IMG_20261114_125127.jpg"
                    alt="Support PureScan AI"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-56 object-cover object-top rounded-2xl block"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  We’re committed to keeping your health data private and ad-free. Support for direct donations. Thank you for being part of the journey.
                </p>

                {/* Creator Dedication & Ambition Note in Yellow with Piyush in Red */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-400/40 dark:border-yellow-500/30 text-center space-y-2">
                  <p className="text-xs sm:text-sm font-semibold leading-relaxed text-amber-900 dark:text-yellow-200">
                    This app is made with love by{' '}
                    <span className="text-red-500 dark:text-red-400 font-black text-sm sm:text-base tracking-wide">
                      Piyush Kumar
                    </span>{' '}
                    over the hard work of more than 1+ years.
                  </p>
                  <p id="creator-ambition-line" className="text-xs sm:text-sm font-extrabold leading-relaxed text-amber-700 dark:text-yellow-300">
                    With an ambition to make your life 1 step more improved, healthier, and protected every single day.
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <a
                  href="https://workdrive.zohoexternal.in/folder/nwnu202fc5fac9511429c85b032a116a56451"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl font-bold text-sm shadow-lg shadow-healthy-green/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer no-underline"
                >
                  <span>😍 to SUPPORT</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowSupportPopup(false)}
                  className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gemini API Key Tutorial */}
      <AnimatePresence>
        {showKeyTutorial && (
          <motion.div
            key="key-tutorial-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 text-left transform-gpu"
          >
            <div
              onClick={() => setShowKeyTutorial(false)}
              className="absolute inset-0 bg-black/55"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transform-gpu"
            >
              <div className="p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-healthy-green/10 rounded-xl">
                    <Zap className="w-5 h-5 text-healthy-green" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Get Gemini API Key
                  </h3>
                </div>
                <button 
                  onClick={() => setShowKeyTutorial(false)}
                  className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">01</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Go to <a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer" className="text-healthy-green font-bold hover:underline">Google Gemini Developer Portal (Get API Key)</a>.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">02</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Login with your Google Account.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">03</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Click on <strong>"Get API key"</strong> in the sidebar.</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">04</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Select <strong>"Create API key in new project"</strong>.</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-slate-900">
                  <img 
                    src="/gemini_guide.png" 
                    alt="Gemini API Key Tutorial" 
                    className="w-full h-auto"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://huggingface.co/spaces/pk-piyush/PureScan-Assets/resolve/main/gemini_tutorial_fallback.png';
                    }}
                  />
                </div>

                <div className="p-4 bg-healthy-green/5 rounded-2xl border border-healthy-green/15">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                    Paste the copied key in the settings input to use your own quota.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-dark-border">
                <button
                  onClick={() => setShowKeyTutorial(false)}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold active:scale-[0.98] transition-all"
                >
                  GOT IT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Success Popup */}
      <AnimatePresence>
        {showExportSuccess && (
          <motion.div
            key="export-success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 transform-gpu"
          >
            <div
              onClick={() => setShowExportSuccess(false)}
              className="absolute inset-0 bg-black/55"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-sm bg-white dark:bg-dark-card rounded-[32px] p-8 shadow-2xl text-center space-y-6 transform-gpu"
            >
              <div className="w-16 h-16 bg-healthy-green/10 dark:bg-healthy-green/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-healthy-green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Report Generated!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your biochemical health audit for <strong>{scanResult?.productName}</strong> is ready. 
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (lastPdfUrl) window.open(lastPdfUrl, '_blank');
                    setShowExportSuccess(false);
                  }}
                  className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-5 h-5" />
                  VIEW REPORT
                </button>
                
                <button
                  onClick={() => {
                    handleSharePdf();
                    setShowExportSuccess(false);
                  }}
                  className="w-full py-4 bg-healthy-green hover:bg-[#2db34f] text-white rounded-2xl font-bold shadow-lg shadow-healthy-green/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                  SHARE REPORT
                </button>
                
                <button
                  onClick={() => setShowExportSuccess(false)}
                  className="w-full py-3 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-healthy-green scale-110' : 'text-gray-400 dark:text-gray-500'}`}
    >
      <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-healthy-green/10' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="w-1 h-1 bg-healthy-green rounded-full"
        />
      )}
    </button>
  );
}

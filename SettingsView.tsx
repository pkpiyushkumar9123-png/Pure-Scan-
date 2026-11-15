import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Settings as SettingsIcon, 
  ExternalLink, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Activity, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cpu, 
  Zap, 
  HeartHandshake, 
  FileText, 
  Lock, 
  AlertTriangle, 
  Trash2, 
  ChevronRight, 
  Download,
  Upload,
  Info,
  Clock,
  Radio,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Globe,
  Languages,
  Check,
  X,
  SlidersHorizontal,
  Bot,
  ShieldAlert,
  Leaf,
  Plus,
  Power,
  Users,
  UserPlus,
  MessageSquarePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';
import { 
  ALL_REPORT_LANGUAGES, 
  ALL_APP_LANGUAGES, 
  LanguageOption 
} from '../languages';
import { FamilyMemberProfile, DEFAULT_FAMILY_PROFILES } from '../utils/familyAndVoiceUtils';
import { parseScanResultsFromCSV } from '../utils/csvImport';
import { ScanResult } from './ScanHistoryView';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false
}) => {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-healthy-green focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-card disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-healthy-green' : 'bg-gray-200 dark:bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

interface SettingsViewProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  dietaryPreferences?: string[];
  onUpdateDietaryPreferences?: (prefs: string[]) => void;
  allergenDietaryEnabled?: boolean;
  onToggleAllergenDietaryEnabled?: (val?: boolean) => void;
  allergensEnabled?: boolean;
  onToggleAllergensEnabled?: (val?: boolean) => void;
  dietaryEnabled?: boolean;
  onToggleDietaryEnabled?: (val?: boolean) => void;
  dietaryLifestylePreferences?: string[];
  onUpdateDietaryLifestylePreferences?: (prefs: string[]) => void;
  familyGuardEnabled?: boolean;
  onToggleFamilyGuardEnabled?: (val?: boolean) => void;
  familyProfiles?: FamilyMemberProfile[];
  onUpdateFamilyProfiles?: (profiles: FamilyMemberProfile[]) => void;
  autoScan: boolean;
  onToggleAutoScan: () => void;
  anonymousAnalytics: boolean;
  onToggleAnonymousAnalytics: () => void;
  customApiKey: string;
  onSaveApiKey: (key: string) => void;
  onTestKey: () => void;
  testingKey: boolean;
  keyTestReport: { status: 'healthy' | 'error' | 'none'; message: string } | null;
  apiLogs: any[];
  onOpenRules: () => void;
  onOpenLegal: (type: 'disclaimer' | 'privacy' | 'terms') => void;
  onOpenSupport: () => void;
  onOpenFeedback?: () => void;
  onOpenKeyTutorial: () => void;
  onWipeAllData: () => void;
  historyCount: number;
  todayScanCount?: number;
  user?: User | null;
  onExportCSV?: () => void;
  onImportCSV?: (scans: ScanResult[]) => Promise<{ count: number; error?: string }>;
  reportLanguage?: string;
  onSelectReportLanguage?: (langCode: string) => void;
  appLanguage?: string;
  onSelectAppLanguage?: (langCode: string) => void;
  aiProvider?: 'gemini' | 'groq';
  onSwitchAiProvider?: (provider: 'gemini' | 'groq') => void;
  customGroqApiKey?: string;
  onSaveGroqApiKey?: (key: string) => void;
  geminiThinkingLevel?: 'MEDIUM' | 'HIGH';
  onUpdateGeminiThinkingLevel?: (level: 'MEDIUM' | 'HIGH') => void;
}

export const COMMON_ALLERGEN_OPTIONS = [
  'Peanuts',
  'Tree Nuts',
  'Milk / Dairy',
  'Wheat / Gluten',
  'Soy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Sesame',
  'Mustard',
  'Sulfites',
  'Corn',
  'Barley',
  'Rye'
];

export const COMMON_DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Jain (No Root Veggies)',
  'Gluten-Free',
  'Keto / Low-Carb',
  'Sugar-Free / Diabetic',
  'Seed Oil Free',
  'No Artificial Dyes',
  'Dairy-Free',
  'Halal',
  'Kosher',
  'Low Sodium',
  'High Protein',
  'Organic / Whole Food'
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  dietaryPreferences = ['Wheat / Gluten', 'Peanuts'],
  onUpdateDietaryPreferences,
  allergenDietaryEnabled = true,
  onToggleAllergenDietaryEnabled,
  allergensEnabled = true,
  onToggleAllergensEnabled,
  dietaryEnabled = true,
  onToggleDietaryEnabled,
  dietaryLifestylePreferences = ['Vegetarian', 'No Artificial Dyes'],
  onUpdateDietaryLifestylePreferences,
  familyGuardEnabled = true,
  onToggleFamilyGuardEnabled,
  familyProfiles = DEFAULT_FAMILY_PROFILES,
  onUpdateFamilyProfiles,
  autoScan,
  onToggleAutoScan,
  anonymousAnalytics,
  onToggleAnonymousAnalytics,
  customApiKey,
  onSaveApiKey,
  onTestKey,
  testingKey,
  keyTestReport,
  apiLogs,
  onOpenRules,
  onOpenLegal,
  onOpenSupport,
  onOpenFeedback,
  onOpenKeyTutorial,
  onWipeAllData,
  historyCount,
  todayScanCount,
  onExportCSV,
  onImportCSV,
  reportLanguage = 'en',
  onSelectReportLanguage,
  appLanguage = 'en',
  onSelectAppLanguage,
  aiProvider = 'gemini',
  onSwitchAiProvider,
  customGroqApiKey = '',
  onSaveGroqApiKey,
  geminiThinkingLevel = 'MEDIUM',
  onUpdateGeminiThinkingLevel
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  const [customAllergenInput, setCustomAllergenInput] = useState('');
  const [customDietaryInput, setCustomDietaryInput] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Child Safety');
  const [newMemberEmoji, setNewMemberEmoji] = useState('🧒');

  // CSV Import State & Handler
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportMessage, setCsvImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingCsv(true);
    setCsvImportMessage(null);

    try {
      const text = await file.text();
      const { results, errors } = parseScanResultsFromCSV(text);

      if (results.length === 0) {
        setCsvImportMessage({
          type: 'error',
          text: errors[0] || 'No valid scan records found in the uploaded CSV.'
        });
        setIsImportingCsv(false);
        if (csvInputRef.current) csvInputRef.current.value = '';
        return;
      }

      if (onImportCSV) {
        const response = await onImportCSV(results);
        if (response.error) {
          setCsvImportMessage({ type: 'error', text: response.error });
        } else {
          setCsvImportMessage({
            type: 'success',
            text: `Successfully imported ${response.count} scan record(s) into your history!`
          });
        }
      } else {
        setCsvImportMessage({
          type: 'success',
          text: `Parsed ${results.length} scan record(s) from CSV.`
        });
      }
    } catch (err: any) {
      console.error('CSV import failed:', err);
      setCsvImportMessage({
        type: 'error',
        text: err?.message || 'Failed to read or parse the CSV file.'
      });
    } finally {
      setIsImportingCsv(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  const handleToggleMemberEnabled = (id: string) => {
    if (!onUpdateFamilyProfiles) return;
    const next = familyProfiles.map(m => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    onUpdateFamilyProfiles(next);
  };

  const handleToggleMemberAllergen = (memberId: string, allergen: string) => {
    if (!onUpdateFamilyProfiles) return;
    const next = familyProfiles.map(m => {
      if (m.id !== memberId) return m;
      const exists = m.allergens.includes(allergen);
      return {
        ...m,
        allergens: exists ? m.allergens.filter(a => a !== allergen) : [...m.allergens, allergen]
      };
    });
    onUpdateFamilyProfiles(next);
  };

  const handleToggleMemberDiet = (memberId: string, pref: string) => {
    if (!onUpdateFamilyProfiles) return;
    const next = familyProfiles.map(m => {
      if (m.id !== memberId) return m;
      const exists = m.dietaryPreferences.includes(pref);
      return {
        ...m,
        dietaryPreferences: exists
          ? m.dietaryPreferences.filter(d => d !== pref)
          : [...m.dietaryPreferences, pref]
      };
    });
    onUpdateFamilyProfiles(next);
  };

  const handleAddFamilyMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed || !onUpdateFamilyProfiles) return;
    const newProfile: FamilyMemberProfile = {
      id: 'member-' + Date.now(),
      name: trimmed,
      role: newMemberRole,
      avatarEmoji: newMemberEmoji,
      enabled: true,
      allergens: [],
      dietaryPreferences: ['No Artificial Dyes']
    };
    onUpdateFamilyProfiles([...familyProfiles, newProfile]);
    setNewMemberName('');
    setShowAddMemberForm(false);
    setEditingMemberId(newProfile.id);
    if (!familyGuardEnabled && onToggleFamilyGuardEnabled) {
      onToggleFamilyGuardEnabled(true);
    }
  };

  const handleDeleteFamilyMember = (id: string) => {
    if (!onUpdateFamilyProfiles) return;
    onUpdateFamilyProfiles(familyProfiles.filter(m => m.id !== id));
    if (editingMemberId === id) setEditingMemberId(null);
  };

  const handleToggleAllergenItem = (item: string) => {
    if (!onUpdateDietaryPreferences) return;
    if (dietaryPreferences.includes(item)) {
      onUpdateDietaryPreferences(dietaryPreferences.filter(i => i !== item));
    } else {
      onUpdateDietaryPreferences([...dietaryPreferences, item]);
      if (!allergensEnabled && onToggleAllergensEnabled) onToggleAllergensEnabled(true);
      if (!allergenDietaryEnabled && onToggleAllergenDietaryEnabled) onToggleAllergenDietaryEnabled(true);
    }
  };

  const handleAddCustomAllergen = () => {
    const trimmed = customAllergenInput.trim();
    if (!trimmed || !onUpdateDietaryPreferences) return;
    if (!dietaryPreferences.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      onUpdateDietaryPreferences([...dietaryPreferences, trimmed]);
      if (!allergensEnabled && onToggleAllergensEnabled) onToggleAllergensEnabled(true);
      if (!allergenDietaryEnabled && onToggleAllergenDietaryEnabled) onToggleAllergenDietaryEnabled(true);
    }
    setCustomAllergenInput('');
  };

  const handleToggleDietaryItem = (item: string) => {
    if (!onUpdateDietaryLifestylePreferences) return;
    if (dietaryLifestylePreferences.includes(item)) {
      onUpdateDietaryLifestylePreferences(dietaryLifestylePreferences.filter(i => i !== item));
    } else {
      onUpdateDietaryLifestylePreferences([...dietaryLifestylePreferences, item]);
      if (!dietaryEnabled && onToggleDietaryEnabled) onToggleDietaryEnabled(true);
      if (!allergenDietaryEnabled && onToggleAllergenDietaryEnabled) onToggleAllergenDietaryEnabled(true);
    }
  };

  const handleAddCustomDietary = () => {
    const trimmed = customDietaryInput.trim();
    if (!trimmed || !onUpdateDietaryLifestylePreferences) return;
    if (!dietaryLifestylePreferences.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      onUpdateDietaryLifestylePreferences([...dietaryLifestylePreferences, trimmed]);
      if (!dietaryEnabled && onToggleDietaryEnabled) onToggleDietaryEnabled(true);
      if (!allergenDietaryEnabled && onToggleAllergenDietaryEnabled) onToggleAllergenDietaryEnabled(true);
    }
    setCustomDietaryInput('');
  };

  const allAllergenOptions = Array.from(new Set([...COMMON_ALLERGEN_OPTIONS, ...dietaryPreferences]));
  const allDietaryOptions = Array.from(new Set([...COMMON_DIETARY_OPTIONS, ...dietaryLifestylePreferences]));

  // 100% Real-time ticker: updates every 1,000ms so rolling windows, RPM, and timers update live
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time calculations
  const todayIso = new Date(currentTimeMs).toISOString().split('T')[0];
  const getLogDateIso = (log: any): string => {
    if (!log || !log.timestamp) return '';
    if (typeof log.timestamp === 'string') {
      return log.timestamp.includes('T')
        ? log.timestamp.split('T')[0]
        : new Date(log.timestamp).toISOString().split('T')[0];
    }
    try {
      const d = new Date(log.timestamp);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }
    return '';
  };

  const logsToday = apiLogs.filter(log => getLogDateIso(log) === todayIso);
  const requestsToday = logsToday.length;

  // Rolling 60s window (updates dynamically every second)
  const logsLastMinute = apiLogs.filter(
    log => log?.timestamp && (currentTimeMs - new Date(log.timestamp).getTime()) < 60000
  );
  const requestsMinute = logsLastMinute.length;

  // Real-time scan metrics
  const totalScansAllTime = historyCount;
  const calculatedScansToday = todayScanCount !== undefined 
    ? todayScanCount 
    : logsToday.filter(l => l.type === 'Biochemical Audit & Health Grade').length;

  // AI standard quotas (adapted dynamically to active provider)
  const isGroq = aiProvider === 'groq';
  const DAILY_LIMIT = isGroq ? 14400 : 1500;
  const MINUTE_LIMIT = isGroq ? 30 : 15;
  const remainingQuotaDay = Math.max(0, DAILY_LIMIT - requestsToday);
  const dayQuotaPercentLeft = Math.min(100, Math.max(0, Math.round((remainingQuotaDay / DAILY_LIMIT) * 100)));
  const dayQuotaPercentUsed = Math.min(100, Math.max(0, Math.round((requestsToday / DAILY_LIMIT) * 100)));

  // Real token analytics
  const tokensToday = logsToday.reduce((sum, log) => sum + (log?.tokensUsed || 0), 0);
  const DAILY_TOKEN_LIMIT = isGroq
    ? (customGroqApiKey ? 5000000 : 1000000)
    : (customApiKey ? 5000000 : 1000000);
  const tokensLeftToday = Math.max(0, DAILY_TOKEN_LIMIT - tokensToday);
  const tokenPercentUsed = Math.min(100, Math.max(0, (tokensToday / DAILY_TOKEN_LIMIT) * 100));
  const tokenPercentLeft = Math.max(0, 100 - tokenPercentUsed);
  const promptTokensToday = logsToday.reduce(
    (sum, log) => sum + (log?.promptTokens || Math.round((log?.tokensUsed || 0) * 0.7)),
    0
  );
  const completionTokensToday = logsToday.reduce(
    (sum, log) => sum + (log?.completionTokens || Math.round((log?.tokensUsed || 0) * 0.3)),
    0
  );
  const tokensAllTime = apiLogs.reduce((sum, log) => sum + (log?.tokensUsed || 0), 0);

  // Most recent latency
  const latestLogWithDuration = [...apiLogs].reverse().find(l => l?.durationMs && l.durationMs > 0);
  const currentLatencyMs = latestLogWithDuration ? latestLogWithDuration.durationMs : null;

  // Time since last API call
  const latestLog = apiLogs.length > 0 ? apiLogs[apiLogs.length - 1] : null;
  const secondsSinceLastCall = latestLog?.timestamp 
    ? Math.max(0, Math.floor((currentTimeMs - new Date(latestLog.timestamp).getTime()) / 1000))
    : null;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto dark:bg-dark-bg min-h-full pb-20 overflow-x-hidden w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h2>
            <span className="text-[10px] font-mono font-bold bg-healthy-green/10 text-healthy-green dark:text-healthy-green px-2.5 py-0.5 rounded-full border border-healthy-green/20">
              v2.5
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time AI telemetry, clinical inspection rules & scanning behavior
          </p>
        </div>

        {/* Real-time pulse indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-healthy-green/10 dark:bg-healthy-green/20 text-healthy-green dark:text-healthy-green border border-healthy-green/20 px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-healthy-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-healthy-green" />
          </span>
          <span>100% Real-Time Live</span>
        </div>
      </div>

      {/* SECTION 1: Clinical Framework & Transparency Rule Card (Moved ABOVE Display & Scanner Behavior) */}
      <button
        id="clinical-ai-transparency-card"
        type="button"
        onClick={onOpenRules}
        className="w-full text-left p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-healthy-green/10 via-emerald-500/5 to-transparent dark:from-healthy-green/20 dark:via-emerald-500/10 dark:to-transparent border border-healthy-green/30 dark:border-healthy-green/40 hover:border-healthy-green/60 transition-all group shadow-sm flex items-center justify-between gap-3 cursor-pointer overflow-hidden scroll-mt-28"
      >
        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="p-2.5 sm:p-3 bg-healthy-green text-white rounded-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="inline-block text-[10px] font-bold text-healthy-green dark:text-healthy-green uppercase tracking-widest bg-healthy-green/15 dark:bg-healthy-green/25 px-2.5 py-0.5 rounded-full">
                Clinical AI Transparency
              </span>
              <span className="text-[10px] font-bold text-healthy-green flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 100-Point Formula
              </span>
            </div>
            <h3 className="font-extrabold text-xs sm:text-base text-gray-900 dark:text-white leading-tight">
              What rule we use to make your life improved
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
              Explore the strict grading algorithm, carcinogen penalties, inflammatory seed oil thresholds & clean whole-food swaps.
            </p>
          </div>
        </div>
        <div className="p-2 rounded-full bg-white dark:bg-dark-card border border-healthy-green/20 shadow-sm shrink-0 group-hover:translate-x-1 transition-transform">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-healthy-green" />
        </div>
      </button>

      {/* SECTION 2: Dual Language Configuration (Hybrid Model System) */}
      <div id="section-language" className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm space-y-5 scroll-mt-28">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                Dual Language Configuration
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-mono">
                HYBRID MODEL
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Native translations with deterministic clinical ontological accuracy (No hallucinated translation)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sub-section 1: Analysis Report Language */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-healthy-green" />
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  1. Analysis Report Language
                </h4>
              </div>
              <span className="text-[10px] font-mono text-healthy-green bg-healthy-green/10 px-2 py-0.5 rounded-full">
                22 Scheduled
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
              Used when generating clinical breakdown cards, allergen summaries, and exportable PDF audit files.
            </p>
            <div className="relative">
              <select
                id="select-report-language"
                value={reportLanguage}
                onChange={(e) => onSelectReportLanguage && onSelectReportLanguage(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-healthy-green/20 focus:border-healthy-green appearance-none cursor-pointer"
              >
                {ALL_REPORT_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} {lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''} • {lang.region}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sub-section 2: App Native Interface Language */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  2. App Native Interface
                </h4>
              </div>
              <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                22 + Regional
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
              Configures controls, buttons, tooltips, HUD scanner instructions, and telemetry metrics.
            </p>
            <div className="relative">
              <select
                id="select-app-language"
                value={appLanguage}
                onChange={(e) => onSelectAppLanguage && onSelectAppLanguage(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <optgroup label="22 Scheduled Languages">
                  {ALL_APP_LANGUAGES.filter(l => l.isScheduled || l.code === 'en').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} {lang.nativeName !== lang.name ? `(${lang.nativeName})` : ''}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Regional & Local Languages">
                  {ALL_APP_LANGUAGES.filter(l => !l.isScheduled && l.code !== 'en').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName}) • {lang.region}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>100% Native Deterministic Precision:</strong> Medical and biochemical nomenclature uses validated ISO Indian language lexicons. This guarantees zero hallucination or garbled phrasing during analysis reports.
          </p>
        </div>
      </div>

      {/* SECTION 2.5: Unified Allergen & Dietary Preferences (Divided into Two Sub-Settings + Option to Turn OFF) */}
      <div
        id="allergen-dietary-preferences-section"
        className={`bg-white dark:bg-dark-card p-5 sm:p-6 rounded-3xl border shadow-sm space-y-5 transition-all scroll-mt-28 ${
          allergenDietaryEnabled
            ? 'border-gray-100 dark:border-dark-border'
            : 'border-gray-200/80 dark:border-slate-800 opacity-90'
        }`}
      >
        {/* Unified Master Header + Option to Turn OFF */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2.5 rounded-2xl shrink-0 transition-colors ${
                allergenDietaryEnabled
                  ? 'bg-healthy-green/10 text-healthy-green'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  Allergen & Dietary Preferences
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                    allergenDietaryEnabled
                      ? 'bg-healthy-green/10 dark:bg-healthy-green/20 text-healthy-green border-healthy-green/30'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-slate-700'
                  }`}
                >
                  {allergenDietaryEnabled ? 'ACTIVE • DUAL FILTER' : 'OFF • DISABLED'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                Unified personal health guard divided into <strong>1. Allergen Triggers</strong> and <strong>2. Dietary Preferences</strong>, with one-tap option to turn it off.
              </p>
            </div>
          </div>

          {/* Master ON / OFF Controls */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 bg-gray-50 dark:bg-slate-900/80 px-3 py-2 rounded-2xl border border-gray-200/70 dark:border-dark-border">
            <button
              type="button"
              id="btn-toggle-allergen-dietary-mode"
              onClick={() => onToggleAllergenDietaryEnabled?.(!allergenDietaryEnabled)}
              className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                allergenDietaryEnabled
                  ? 'text-healthy-green'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{allergenDietaryEnabled ? 'ON' : 'OFF'}</span>
            </button>
            <ToggleSwitch
              id="toggle-allergen-dietary-master"
              label="Toggle Allergen and Dietary Preferences On or Off"
              checked={allergenDietaryEnabled}
              onChange={() => onToggleAllergenDietaryEnabled?.(!allergenDietaryEnabled)}
            />
          </div>
        </div>

        {/* Status Banner when Master Filter is Turned OFF */}
        {!allergenDietaryEnabled && (
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/90 border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Allergen & Dietary Screening is Turned OFF
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                  Scans will evaluate products purely on the standard 100-Point Clinical Biochemical Formula without personal allergen overrides or dietary penalties. Your saved selections below are preserved.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggleAllergenDietaryEnabled?.(true)}
              className="px-3.5 py-2 bg-healthy-green hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shrink-0 cursor-pointer transition-all self-start sm:self-center shadow-xs"
            >
              Turn On Now
            </button>
          </div>
        )}

        {/* Divided into TWO Sub-Sections: 1. Allergen Preferences & 2. Dietary Preferences */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${!allergenDietaryEnabled ? 'opacity-60' : 'opacity-100'}`}>
          {/* SUB-SECTION 1: Allergen Preferences */}
          <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-slate-900/60 border border-rose-200/60 dark:border-dark-border flex flex-col justify-between space-y-3.5">
            <div className="space-y-3">
              {/* Header for Part 1 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      1. Allergen Preferences
                    </h4>
                  </div>
                </div>

                {/* Individual Sub-Toggle for Allergens (ON / OFF) */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    allergenDietaryEnabled && allergensEnabled && dietaryPreferences.length > 0
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-gray-200/70 dark:bg-slate-800 text-gray-500'
                  }`}>
                    {!allergenDietaryEnabled || !allergensEnabled
                      ? 'OFF'
                      : `${dietaryPreferences.length} Active`}
                  </span>
                  <ToggleSwitch
                    id="toggle-allergens-sub"
                    label="Toggle Allergen Preferences On or Off"
                    checked={allergenDietaryEnabled && allergensEnabled}
                    onChange={() => {
                      if (!allergenDietaryEnabled) {
                        onToggleAllergenDietaryEnabled?.(true);
                        onToggleAllergensEnabled?.(true);
                      } else {
                        onToggleAllergensEnabled?.(!allergensEnabled);
                      }
                    }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Zero-tolerance safety triggers. If any selected allergen is found on a label, PureScan flags a <strong>Critical Allergen Hazard (Grade F)</strong>.
              </p>

              {/* Selectable Allergen Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {allAllergenOptions.map((allergen) => {
                  const isSelected = dietaryPreferences.includes(allergen);
                  const isActive = allergenDietaryEnabled && allergensEnabled && isSelected;
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => handleToggleAllergenItem(allergen)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        isActive
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : isSelected
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/40'
                          : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-rose-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                      <span>{allergen}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Allergen Input & Quick Off/Clear Bar */}
            <div className="space-y-2.5 pt-2 border-t border-rose-200/40 dark:border-dark-border">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customAllergenInput}
                  onChange={(e) => setCustomAllergenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAllergen();
                    }
                  }}
                  placeholder="Add custom allergen (e.g. Kiwi, Celery)..."
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-[11px] text-gray-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergen}
                  disabled={!customAllergenInput.trim()}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => onToggleAllergensEnabled?.(!allergensEnabled)}
                  className="font-bold text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 cursor-pointer transition-colors"
                >
                  {allergensEnabled ? 'Turn Off Allergen Alerts' : 'Turn On Allergen Alerts'}
                </button>
                {dietaryPreferences.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateDietaryPreferences?.([])}
                    className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All ({dietaryPreferences.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SUB-SECTION 2: Dietary Preferences */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-slate-900/60 border border-healthy-green/25 dark:border-dark-border flex flex-col justify-between space-y-3.5">
            <div className="space-y-3">
              {/* Header for Part 2 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-healthy-green/15 text-healthy-green flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                      2. Dietary Preferences
                    </h4>
                  </div>
                </div>

                {/* Individual Sub-Toggle for Dietary Preferences (ON / OFF) */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    allergenDietaryEnabled && dietaryEnabled && dietaryLifestylePreferences.length > 0
                      ? 'bg-healthy-green/15 text-healthy-green'
                      : 'bg-gray-200/70 dark:bg-slate-800 text-gray-500'
                  }`}>
                    {!allergenDietaryEnabled || !dietaryEnabled
                      ? 'OFF'
                      : `${dietaryLifestylePreferences.length} Active`}
                  </span>
                  <ToggleSwitch
                    id="toggle-dietary-sub"
                    label="Toggle Dietary Preferences On or Off"
                    checked={allergenDietaryEnabled && dietaryEnabled}
                    onChange={() => {
                      if (!allergenDietaryEnabled) {
                        onToggleAllergenDietaryEnabled?.(true);
                        onToggleDietaryEnabled?.(true);
                      } else {
                        onToggleDietaryEnabled?.(!dietaryEnabled);
                      }
                    }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                Lifestyle & nutrition goals. Flags non-compliant ingredients and customizes <strong>Recommended Healthier Swaps</strong> to match your diet.
              </p>

              {/* Selectable Dietary Preference Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {allDietaryOptions.map((pref) => {
                  const isSelected = dietaryLifestylePreferences.includes(pref);
                  const isActive = allergenDietaryEnabled && dietaryEnabled && isSelected;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handleToggleDietaryItem(pref)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        isActive
                          ? 'bg-healthy-green text-white border-healthy-green shadow-xs'
                          : isSelected
                          ? 'bg-healthy-green/15 text-healthy-green border-healthy-green/40'
                          : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-healthy-green'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                      <span>{pref}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Dietary Input & Quick Off/Clear Bar */}
            <div className="space-y-2.5 pt-2 border-t border-healthy-green/20 dark:border-dark-border">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customDietaryInput}
                  onChange={(e) => setCustomDietaryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDietary();
                    }
                  }}
                  placeholder="Add custom preference (e.g. Paleo, FODMAP)..."
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-[11px] text-gray-900 dark:text-white focus:outline-none focus:border-healthy-green"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDietary}
                  disabled={!customDietaryInput.trim()}
                  className="px-2.5 py-1.5 bg-healthy-green hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => onToggleDietaryEnabled?.(!dietaryEnabled)}
                  className="font-bold text-gray-500 hover:text-healthy-green dark:text-gray-400 dark:hover:text-healthy-green cursor-pointer transition-colors"
                >
                  {dietaryEnabled ? 'Turn Off Dietary Filter' : 'Turn On Dietary Filter'}
                </button>
                {dietaryLifestylePreferences.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onUpdateDietaryLifestylePreferences?.([])}
                    className="font-bold text-healthy-green hover:underline cursor-pointer"
                  >
                    Clear All ({dietaryLifestylePreferences.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary Bar with One-Tap Turn Off Button */}
        <div className="p-3 bg-healthy-green/5 dark:bg-healthy-green/10 border border-healthy-green/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-start gap-2.5 min-w-0">
            <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${allergenDietaryEnabled ? 'text-healthy-green' : 'text-gray-400'}`} />
            <p className="leading-relaxed text-[11px] text-gray-700 dark:text-gray-300">
              {allergenDietaryEnabled ? (
                <>
                  <strong>Active Protection Summary:</strong>{' '}
                  {allergensEnabled && dietaryPreferences.length > 0
                    ? `${dietaryPreferences.length} Allergen(s) [${dietaryPreferences.join(', ')}]`
                    : 'Allergen Alerts OFF'}{' '}
                  •{' '}
                  {dietaryEnabled && dietaryLifestylePreferences.length > 0
                    ? `${dietaryLifestylePreferences.length} Dietary Goal(s) [${dietaryLifestylePreferences.join(', ')}]`
                    : 'Dietary Goals OFF'}
                </>
              ) : (
                <>
                  <strong>Preferences Currently OFF:</strong> Personal allergen & dietary checks are bypassed during label analysis.
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            id="btn-quick-turn-off-preferences"
            onClick={() => onToggleAllergenDietaryEnabled?.(!allergenDietaryEnabled)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 cursor-pointer transition-all border self-start sm:self-center ${
              allergenDietaryEnabled
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50'
                : 'bg-healthy-green text-white border-healthy-green hover:bg-emerald-600'
            }`}
          >
            {allergenDietaryEnabled ? 'Turn Off Preferences' : 'Turn On Preferences'}
          </button>
        </div>
      </div>

      {/* SECTION 2.8: Family & Household Multi-Profile Guard (Feature 1) */}
      <div
        id="family-multi-profile-guard-section"
        className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm space-y-5 scroll-mt-28"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`p-2.5 rounded-2xl shrink-0 ${
                familyGuardEnabled
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  Family & Household Multi-Profile Guard
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                    familyGuardEnabled
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-500 border-gray-300 dark:border-slate-700'
                  }`}
                >
                  {familyGuardEnabled
                    ? `${familyProfiles.filter(m => m.enabled).length} MEMBERS GUARDED`
                    : 'OFF'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                Every single food scan automatically checks compatibility for each household member (e.g., <em>Me</em>, <em>Kid</em>, <em>Parents</em>) at once.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 bg-gray-50 dark:bg-slate-900/80 px-3 py-2 rounded-2xl border border-gray-200/70 dark:border-dark-border">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 dark:text-gray-300">
              {familyGuardEnabled ? 'ON' : 'OFF'}
            </span>
            <ToggleSwitch
              id="toggle-family-guard-master"
              label="Toggle Family Household Multi-Profile Guard"
              checked={familyGuardEnabled}
              onChange={() => onToggleFamilyGuardEnabled?.(!familyGuardEnabled)}
            />
          </div>
        </div>

        {/* Household Profiles Grid */}
        <div className={`space-y-3 transition-opacity ${!familyGuardEnabled ? 'opacity-60' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {familyProfiles.map((member) => {
              const isEditing = editingMemberId === member.id;
              return (
                <div
                  key={member.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    member.enabled && familyGuardEnabled
                      ? 'bg-indigo-50/30 dark:bg-slate-900/80 border-indigo-200/80 dark:border-indigo-900/50'
                      : 'bg-gray-50 dark:bg-slate-900/40 border-gray-200 dark:border-dark-border opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{member.avatarEmoji}</span>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                            {member.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate">
                            {member.role}
                          </span>
                        </div>
                      </div>
                      <ToggleSwitch
                        id={`toggle-member-${member.id}`}
                        label={`Toggle ${member.name} profile`}
                        checked={member.enabled}
                        onChange={() => handleToggleMemberEnabled(member.id)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.allergens.map(a => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-bold border border-rose-400/30"
                        >
                          ⚠️ {a}
                        </span>
                      ))}
                      {member.dietaryPreferences.map(d => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded-md bg-healthy-green/15 text-healthy-green text-[10px] font-bold border border-healthy-green/30"
                        >
                          🌱 {d}
                        </span>
                      ))}
                      {member.allergens.length === 0 && member.dietaryPreferences.length === 0 && (
                        <span className="text-[10px] text-gray-400 italic">
                          Standard clinical threshold
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-dark-border text-[10px]">
                    <button
                      type="button"
                      onClick={() => setEditingMemberId(isEditing ? null : member.id)}
                      className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {isEditing ? 'Done Editing' : 'Customize Rules'}
                    </button>
                    {familyProfiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFamilyMember(member.id)}
                        className="text-gray-400 hover:text-rose-500 font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Editor for Selected Family Member */}
          <AnimatePresence>
            {editingMemberId && (() => {
              const target = familyProfiles.find(m => m.id === editingMemberId);
              if (!target) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{target.avatarEmoji}</span>
                      <span>Customize Allergens & Diet for {target.name}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingMemberId(null)}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      {target.name}&apos;s Allergen Triggers:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_ALLERGEN_OPTIONS.slice(0, 10).map(alg => {
                        const active = target.allergens.includes(alg);
                        return (
                          <button
                            key={alg}
                            type="button"
                            onClick={() => handleToggleMemberAllergen(target.id, alg)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              active
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border'
                            }`}
                          >
                            {alg}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-healthy-green">
                      {target.name}&apos;s Dietary Goals:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_DIETARY_OPTIONS.slice(0, 10).map(diet => {
                        const active = target.dietaryPreferences.includes(diet);
                        return (
                          <button
                            key={diet}
                            type="button"
                            onClick={() => handleToggleMemberDiet(target.id, diet)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              active
                                ? 'bg-healthy-green text-white border-healthy-green'
                                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border-gray-200 dark:border-dark-border'
                            }`}
                          >
                            {diet}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Add Family Member Row */}
          {!showAddMemberForm ? (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowAddMemberForm(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Family Member</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFamilyProfiles?.(DEFAULT_FAMILY_PROFILES)}
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                Reset Household Defaults
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-dark-border space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {['🧒', '🧓', '👩', '👨', '👶'].map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewMemberEmoji(em)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base border cursor-pointer ${
                        newMemberEmoji === em
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60'
                          : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  placeholder="Member Name (e.g. Mom, Dad, Aarav)..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-xs text-gray-900 dark:text-white"
                >
                  <option value="Child Safety">Child Safety</option>
                  <option value="Senior Care">Senior Care</option>
                  <option value="Partner / Adult">Partner / Adult</option>
                  <option value="Fitness / Athlete">Fitness / Athlete</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddFamilyMember}
                  disabled={!newMemberName.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                >
                  Save Member
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Scanner & Display Preferences (Dark Mode toggle switch hidden) */}
      <div id="section-scanner" className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm space-y-4 scroll-mt-28">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-healthy-green/10 text-healthy-green rounded-2xl">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
              Display & Scanner Behavior
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize scanning acceleration & privacy telemetry
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-dark-border">
          {/* Rapid Auto-Audit Mode */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-healthy-green/15 text-healthy-green flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  Rapid Auto-Audit
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                  Skip manual crop confirmation for instant results in under 15s
                </p>
              </div>
            </div>
            <ToggleSwitch
              id="toggle-auto-scan"
              label="Toggle Rapid Auto-Audit"
              checked={autoScan}
              onChange={onToggleAutoScan}
            />
          </div>

          {/* Anonymous Hazard Analytics */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-healthy-green/15 text-healthy-green flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  Anonymous Hazard Analytics
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                  Share anonymized chemical lists to improve model accuracy (No photos stored)
                </p>
              </div>
            </div>
            <ToggleSwitch
              id="toggle-anonymous-analytics"
              label="Toggle Anonymous Hazard Analytics"
              checked={anonymousAnalytics}
              onChange={onToggleAnonymousAnalytics}
            />
          </div>
        </div>
      </div>

      {/* AI ENGINE SELECTOR & SWITCHER DIALOG BOX (Just above AI Connection) */}
      <div className="bg-gradient-to-r from-healthy-green/10 via-emerald-500/5 to-teal-500/10 dark:from-healthy-green/20 dark:via-slate-900 dark:to-teal-500/20 p-5 sm:p-6 rounded-3xl border border-healthy-green/20 dark:border-healthy-green/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className={`p-3 rounded-2xl shrink-0 ${isGroq ? 'bg-amber-500/15 text-amber-500' : 'bg-healthy-green/15 text-healthy-green'}`}>
              {isGroq ? <Zap className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-mono">
                  Active Intelligence Model
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                  isGroq 
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/30' 
                    : 'bg-healthy-green/15 dark:bg-healthy-green/25 text-healthy-green border border-healthy-green/30'
                }`}>
                  {isGroq ? '⚡ GROQ CLOUD AI' : '✨ GOOGLE GEMINI AI'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                {isGroq ? 'Groq Cloud AI (Llama 3.2 Vision on LPU™)' : 'Google Gemini AI (Gemini 3.8 Flash)'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                {isGroq
                  ? 'Active: PureScan now runs on Groq Cloud LPUs for ultra-fast, sub-second vision audits and ingredient extraction.'
                  : 'Active: PureScan prioritizes Google Gemini 3.8 Flash for micro-font OCR & clinical scoring, with automated fallback if unavailable.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-open-ai-switch-dialog"
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 cursor-pointer self-start sm:self-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>CHANGE AI ENGINE</span>
          </button>
        </div>
      </div>

      {/* Dialog Box to Change AI Provider */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            key="ai-provider-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 text-left transform-gpu"
          >
            <div
              onClick={() => setShowAiModal(false)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.55 }}
              style={{ willChange: 'transform, opacity' }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-dark-border flex flex-col max-h-[90vh] z-10 transform-gpu"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-healthy-green/10 text-healthy-green rounded-2xl">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                      Change AI Engine
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Select which LLM powers the entire food scanning and audit system
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-ai-dialog"
                  onClick={() => setShowAiModal(false)}
                  className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Options */}
              <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
                {/* OPTION 1: Google Gemini AI (Default) */}
                <div
                  id="ai-option-gemini"
                  onClick={() => {
                    onSwitchAiProvider?.('gemini');
                    setShowAiModal(false);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 relative ${
                    aiProvider === 'gemini'
                      ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                            Google Gemini AI
                          </h4>
                          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            DEFAULT • MULTIMODAL
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          Model: Gemini 3.8 Flash (Auto-Fallback)
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-1 ${
                      aiProvider === 'gemini' ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300 dark:border-slate-600'
                    }`}>
                      {aiProvider === 'gemini' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    Advanced Gemini multimodal vision intelligence. Delivers comprehensive multi-column nutrition mapping, allergen warnings, and clinical grade computations with zero-cutoff protection.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-healthy-green" /> Free 1,500 RPD
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-healthy-green" /> Multi-column OCR
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-healthy-green" /> Gemini Multimodal
                    </span>
                  </div>
                </div>

                {/* OPTION 2: Groq Cloud AI */}
                <div
                  id="ai-option-groq"
                  onClick={() => {
                    onSwitchAiProvider?.('groq');
                    setShowAiModal(false);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col gap-3 relative ${
                    aiProvider === 'groq'
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm'
                      : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                            Groq Cloud AI
                          </h4>
                          <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                            NEW • ULTRA-FAST LPU™
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          Model: Llama 3.2 Vision on Groq LPU™
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 mt-1 ${
                      aiProvider === 'groq' ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300 dark:border-slate-600'
                    }`}>
                      {aiProvider === 'groq' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    Powered by custom Groq Language Processing Units (LPUs). Bypasses Google quota exhaustion with blazing ~200-300ms latency, high throughput, and accurate biochemical hazard detection.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> ~250ms LPU Speed
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-healthy-green" /> High Rate Limits
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-healthy-green" /> Free Groq Console Keys
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Current: <strong className="text-gray-900 dark:text-white">{isGroq ? 'Groq Cloud AI' : 'Google Gemini AI'}</strong>. Tap any option to switch immediately.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  DONE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 3: Active AI Connection (Dynamically changes between Gemini and Groq Cloud AI) */}
      <div id="section-ai-engine" className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm space-y-5 overflow-hidden scroll-mt-28">
        {/* Header & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`p-2.5 rounded-2xl shrink-0 mt-0.5 sm:mt-0 ${
              isGroq ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            }`}>
              {isGroq ? <Zap className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  {isGroq ? 'Groq Cloud AI Connection' : 'Google Gemini AI Connection'}
                </h3>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono shrink-0 ${
                  isGroq 
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/20' 
                    : 'bg-healthy-green/10 dark:bg-healthy-green/20 text-healthy-green border-healthy-green/20'
                }`}>
                  <Radio className={`w-3 h-3 ${isGroq ? 'text-amber-500' : 'text-healthy-green'} animate-pulse`} />
                  {isGroq ? 'GROQ LPU™ REALTIME' : 'REALTIME'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isGroq
                  ? 'Connected to Groq Cloud AI (Llama 3.2 Vision Preview on Groq LPU™)'
                  : 'Connected to Gemini 3.8 Flash (Primary Multimodal Engine with Auto-Fallback)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <a
              href={isGroq ? 'https://console.groq.com/keys' : 'https://ai.google.dev/gemini-api/docs/api-key'}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 whitespace-nowrap ${
                isGroq 
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' 
                  : 'text-healthy-green bg-healthy-green/10 hover:bg-healthy-green/20'
              }`}
            >
              {isGroq ? 'Get Free Groq Key' : 'Get Free Key'} <ExternalLink className="w-3 h-3" />
            </a>
            <button 
              type="button"
              onClick={onOpenKeyTutorial}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-healthy-green cursor-pointer shrink-0"
              title={isGroq ? "How to get a free Groq Cloud API key" : "How to get a free Google API key"}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Calculation Dashboard (Accurate Usage, Left, Scans Done) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-healthy-green/5 dark:from-slate-900 dark:to-healthy-green/10 border border-gray-200/80 dark:border-dark-border space-y-4 min-w-0">
          {/* Top Real-time Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200/60 dark:border-dark-border">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
                Channel:
              </span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border truncate ${
                isGroq
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/20'
                  : 'bg-healthy-green/10 dark:bg-healthy-green/20 text-healthy-green border-healthy-green/20'
              }`}>
                {isGroq 
                  ? (customGroqApiKey ? 'Custom Groq API Key' : 'Shared Cloud Groq Server')
                  : (customApiKey ? 'Custom User API Key' : 'Shared Cloud Server Key')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono font-bold shrink-0">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-healthy-green" />
                {secondsSinceLastCall !== null ? `${secondsSinceLastCall}s since last call` : 'Active'}
              </span>
              <span className="text-healthy-green bg-healthy-green/10 px-2 py-0.5 rounded-md border border-healthy-green/20">
                {dayQuotaPercentLeft}% Quota Remaining
              </span>
            </div>
          </div>

          {/* Primary 4-Metric Real-Time Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Metric 1: Scans Completed */}
            <div className="p-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Scans Done
                </span>
                <span className="w-2 h-2 rounded-full bg-healthy-green" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white font-mono">
                  {calculatedScansToday}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  today
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                {totalScansAllTime} total all-time
              </p>
            </div>

            {/* Metric 2: API Requests Used */}
            <div className="p-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Requests Used
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white font-mono">
                  {requestsToday}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  / {DAILY_LIMIT}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                {dayQuotaPercentUsed}% used today
              </p>
            </div>

            {/* Metric 3: Quota Left Today */}
            <div className="p-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Daily Left
                </span>
                <span className="w-2 h-2 rounded-full bg-healthy-green" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-healthy-green font-mono">
                  {remainingQuotaDay}
                </span>
                <span className="text-[10px] font-bold text-healthy-green">
                  left
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                Resets at 00:00 UTC
              </p>
            </div>

            {/* Metric 4: Real-time 60s RPM */}
            <div className="p-3 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Current RPM
                </span>
                <span className={`w-2 h-2 rounded-full ${requestsMinute > 10 ? 'bg-warning-amber' : 'bg-healthy-green'}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-warning-amber font-mono">
                  {requestsMinute}
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  / {MINUTE_LIMIT}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">
                Rolling 60s window
              </p>
            </div>
          </div>

          {/* Dual-Color Token Quota Single Horizontal Bar */}
          <div className="space-y-2 p-3 bg-white/70 dark:bg-dark-card/70 rounded-2xl border border-gray-200/80 dark:border-dark-border">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 text-xs font-semibold">
              <span className="text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-healthy-green inline-block" />
                Daily API Token Quota:
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-healthy-green font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-healthy-green shrink-0" />
                  Tokens Used: {tokensToday.toLocaleString()} ({tokenPercentUsed.toFixed(1)}%)
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm bg-gray-300 dark:bg-slate-600 shrink-0" />
                  Tokens Left: {tokensLeftToday.toLocaleString()} ({tokenPercentLeft.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Single Unified Horizontal Bar */}
            <div className="h-3.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 shadow-inner">
              {/* Healthy Green Bar (Tokens Used) */}
              {tokenPercentUsed > 0 && (
                <div 
                  className="h-full bg-healthy-green rounded-l-full transition-all duration-500"
                  style={{ width: `${Math.min(100, tokenPercentUsed)}%` }}
                  title={`Tokens Used: ${tokensToday.toLocaleString()}`}
                />
              )}
              {/* Remaining Bar (Tokens Left) */}
              <div 
                className={`h-full bg-gray-200 dark:bg-slate-700 transition-all duration-500 ${tokenPercentUsed > 0 ? 'rounded-r-full' : 'rounded-full'}`}
                style={{ width: `${Math.max(0, 100 - tokenPercentUsed)}%` }}
                title={`Tokens Left: ${tokensLeftToday.toLocaleString()}`}
              />
            </div>
          </div>

          {/* Token Breakdown Sub-panel */}
          <div className="pt-2 border-t border-gray-200/60 dark:border-dark-border grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="bg-white/60 dark:bg-dark-card/60 p-2 rounded-xl border border-gray-100 dark:border-dark-border">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Tokens Today
              </span>
              <span className="font-extrabold font-mono text-gray-900 dark:text-white">
                {tokensToday.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/60 dark:bg-dark-card/60 p-2 rounded-xl border border-gray-100 dark:border-dark-border">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                Prompt / Input
              </span>
              <span className="font-extrabold font-mono text-gray-700 dark:text-gray-300">
                {promptTokensToday.toLocaleString()}
              </span>
            </div>
            <div className="bg-white/60 dark:bg-dark-card/60 p-2 rounded-xl border border-gray-100 dark:border-dark-border">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                Output / Analysis
              </span>
              <span className="font-extrabold font-mono text-warning-amber">
                {completionTokensToday.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Latency & All-Time Stats */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500 dark:text-gray-400 pt-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-healthy-green" />
              Realtime Latency: <strong className="font-mono text-gray-900 dark:text-white">{currentLatencyMs ? `${currentLatencyMs}ms` : '420ms (avg)'}</strong>
            </span>
            <span className="font-mono">
              Lifetime Tokens: <strong className="text-healthy-green">{tokensAllTime.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label 
            htmlFor={isGroq ? "groq-api-key-input" : "gemini-api-key-input"}
            className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block"
          >
            {isGroq ? "Custom Groq Cloud API Key (Optional)" : "Custom Gemini API Key (Optional)"}
          </label>
          <div className="relative w-full min-w-0">
            <input 
              id={isGroq ? "groq-api-key-input" : "gemini-api-key-input"}
              type={(isGroq ? showGroqKey : showApiKey) ? "text" : "password"}
              placeholder={isGroq ? "Paste Groq API Key (gsk_...)" : "Paste Gemini API Key (AIzaSy...)"}
              value={isGroq ? customGroqApiKey : customApiKey}
              onChange={(e) => {
                if (isGroq) {
                  onSaveGroqApiKey?.(e.target.value);
                } else {
                  onSaveApiKey(e.target.value);
                }
              }}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-dark-border rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-healthy-green/20 focus:border-healthy-green transition-all dark:text-white font-mono"
            />
            <button 
              type="button"
              onClick={() => {
                if (isGroq) {
                  setShowGroqKey(!showGroqKey);
                } else {
                  setShowApiKey(!showApiKey);
                }
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              title={(isGroq ? showGroqKey : showApiKey) ? "Hide Key" : "Show Key"}
            >
              {(isGroq ? showGroqKey : showApiKey) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="min-w-0 flex-1">
              {isGroq
                ? "Empty uses shared cloud server key. Enter your free key from console.groq.com/keys for direct high-speed quota."
                : "Empty uses server/Vercel env quota. Enter your key for 100% direct connection & 1,500 RPD quota."}
            </span>
            {(isGroq ? customGroqApiKey : customApiKey) && (
              <button 
                type="button"
                onClick={() => {
                  if (isGroq) {
                    onSaveGroqApiKey?.('');
                  } else {
                    onSaveApiKey('');
                  }
                }}
                className="font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer shrink-0 self-start sm:self-auto"
              >
                Reset to Default
              </button>
            )}
          </div>
          <div className="p-3 bg-healthy-green/5 dark:bg-healthy-green/15 border border-healthy-green/20 rounded-xl text-[11px] text-healthy-green dark:text-emerald-400 leading-relaxed">
            {isGroq ? (
              <>
                <strong>Groq Cloud LPU™ Ready:</strong> Groq runs Llama 3.2 Vision on dedicated LPUs for ultra-fast response. Add <code>GROQ_API_KEY</code> to your environment or paste your free key above from <em>console.groq.com/keys</em>.
              </>
            ) : (
              <>
                <strong>Deploying to Vercel?</strong> PureScan is Vercel Serverless Ready. In your Vercel Project Settings &rarr; <em>Environment Variables</em>, add <code>GEMINI_API_KEY</code>. You can also paste your key directly above for instant access.
              </>
            )}
          </div>

          {/* Gemini Thinking Level Selector (Between Middle to High) */}
          {!isGroq && (
            <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-dark-border">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Gemini Thinking Level (Middle to High)
                </label>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {geminiThinkingLevel === 'HIGH' ? 'HIGH FORENSIC' : 'MIDDLE (MEDIUM)'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-thinking-medium"
                  onClick={() => onUpdateGeminiThinkingLevel?.('MEDIUM')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    geminiThinkingLevel === 'MEDIUM'
                      ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 shadow-xs ring-1 ring-purple-500'
                      : 'border-gray-200 dark:border-dark-border bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">Middle (Medium)</span>
                    {geminiThinkingLevel === 'MEDIUM' && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                    Balanced clinical reasoning depth & fast scanning speed.
                  </p>
                </button>

                <button
                  type="button"
                  id="btn-thinking-high"
                  onClick={() => onUpdateGeminiThinkingLevel?.('HIGH')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    geminiThinkingLevel === 'HIGH'
                      ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 shadow-xs ring-1 ring-purple-500'
                      : 'border-gray-200 dark:border-dark-border bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">High (Forensic)</span>
                    {geminiThinkingLevel === 'HIGH' && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                    Maximum reasoning tokens for deep additive toxicology analysis.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Test Connection Button & Status */}
        <div className="space-y-3">
          <button
            id={isGroq ? "btn-test-groq-connection" : "btn-test-gemini-connection"}
            type="button"
            onClick={onTestKey}
            disabled={testingKey}
            className={`w-full py-3 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
              isGroq 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-healthy-green hover:bg-emerald-600'
            }`}
          >
            {testingKey ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isGroq ? 'PINGING GROQ CLOUD LPU™ IN REAL TIME...' : 'PINGING GOOGLE GEMINI CLOUD IN REAL TIME...'}</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                <span>{isGroq ? 'TEST GROQ REAL-TIME CONNECTION NOW' : 'TEST REAL-TIME CONNECTION NOW'}</span>
              </>
            )}
          </button>

          <AnimatePresence>
            {keyTestReport && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                  keyTestReport.status === 'healthy' 
                    ? 'bg-healthy-green/10 text-healthy-green border-healthy-green/30 dark:bg-healthy-green/20 dark:text-emerald-400 dark:border-healthy-green/40' 
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {keyTestReport.status === 'healthy' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-healthy-green mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <div>
                  <p className="font-extrabold uppercase tracking-wide text-[10px]">
                    {keyTestReport.status === 'healthy' ? 'Active & Ready • 100% Operational' : 'Connection Error'}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{keyTestReport.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time Activity Stream Toggle */}
        <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
          <button
            type="button"
            onClick={() => setShowDetailedLogs(!showDetailedLogs)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-healthy-green py-1 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-healthy-green" />
              Real-Time Audit Log ({apiLogs.length} Operations Recorded)
            </span>
            <span className="flex items-center gap-1 text-[11px] font-normal text-gray-400">
              {showDetailedLogs ? 'Hide Details' : 'Show Live Stream'}
              {showDetailedLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </span>
          </button>

          <AnimatePresence>
            {showDetailedLogs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3 space-y-2"
              >
                {apiLogs.length === 0 ? (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-dark-border text-center text-xs text-gray-400">
                    No Gemini API operations logged yet. Perform a scan or test connection to see real-time execution telemetry.
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {[...apiLogs].reverse().slice(0, 15).map((log, index) => {
                      const logDate = log?.timestamp ? new Date(log.timestamp) : null;
                      const timeStr = logDate ? logDate.toLocaleTimeString() : 'Recent';
                      const secondsAgo = logDate ? Math.max(0, Math.floor((currentTimeMs - logDate.getTime()) / 1000)) : 0;
                      return (
                        <div 
                          key={log?.id || index}
                          className="p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-dark-border flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-healthy-green shrink-0" />
                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                              {log.type || 'AI Inference'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                              {secondsAgo < 60 ? `${secondsAgo}s ago` : timeStr}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                            {log.durationMs ? (
                              <span className="text-gray-500 dark:text-gray-400">
                                {log.durationMs}ms
                              </span>
                            ) : null}
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/20">
                              {log.tokensUsed || 0} tokens
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION 4: Data Management & Reset */}
      <div id="section-data" className="bg-white dark:bg-dark-card p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm space-y-4 scroll-mt-28">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
              Data Management & Privacy
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Export data backups or erase local application memory
            </p>
          </div>
        </div>

        {/* Hidden CSV file input */}
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv,text/comma-separated-values"
          onChange={handleCsvFileChange}
          className="hidden"
          id="csv-file-input"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {onExportCSV && (
            <button
              id="btn-export-history-csv"
              type="button"
              onClick={onExportCSV}
              disabled={historyCount === 0}
              className="py-3 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-dark-border rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm active:scale-98"
            >
              <Download className="w-4 h-4 text-healthy-green" />
              <span>Export CSV ({historyCount})</span>
            </button>
          )}

          <button
            id="btn-import-history-csv"
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={isImportingCsv}
            className="py-3 px-4 bg-healthy-green/10 dark:bg-healthy-green/20 hover:bg-healthy-green/15 dark:hover:bg-healthy-green/30 text-healthy-green dark:text-emerald-400 border border-healthy-green/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
          >
            {isImportingCsv ? (
              <Loader2 className="w-4 h-4 animate-spin text-healthy-green" />
            ) : (
              <Upload className="w-4 h-4 text-healthy-green" />
            )}
            <span>{isImportingCsv ? 'Importing CSV...' : 'Import CSV'}</span>
          </button>

          <button
            id="btn-wipe-scan-history"
            type="button"
            onClick={() => setShowWipeConfirm(true)}
            className="py-3 px-4 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Wipe All History</span>
          </button>
        </div>

        {/* CSV Import Feedback Alert Banner */}
        <AnimatePresence>
          {csvImportMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                csvImportMessage.type === 'success'
                  ? 'bg-healthy-green/10 text-healthy-green border-healthy-green/30 dark:bg-healthy-green/20 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {csvImportMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-healthy-green" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <span className="font-medium leading-relaxed">{csvImportMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setCsvImportMessage(null)}
                className="p-1 hover:opacity-75 transition-opacity cursor-pointer shrink-0 ml-2"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wipe Confirmation Dialog */}
        <AnimatePresence>
          {showWipeConfirm && (
            <motion.div
              key="wipe-confirm-dialog"
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.13, ease: [0.32, 0, 0.67, 0] } }}
              transition={{ type: 'spring', damping: 28, stiffness: 420, mass: 0.5 }}
              style={{ willChange: 'transform, opacity' }}
              className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-3 transform-gpu"
            >
              <div className="flex items-start gap-2.5 text-xs text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to wipe all {historyCount} scan records? This action cannot be undone.
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWipeConfirm(false)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-dark-border rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onWipeAllData();
                    setShowWipeConfirm(false);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Yes, Wipe Everything
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 5: Legal, Compliance & Information */}
      <div id="section-legal" className="bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-dark-border scroll-mt-28">
        <a
          href="/purescan-manifesto-policy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between p-4 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-colors text-left cursor-pointer group bg-emerald-500/[0.04]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-healthy-green/15 text-healthy-green flex items-center justify-center font-bold text-sm">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-healthy-green transition-colors">
                  PureScan Story, Privacy & Security PDF
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-healthy-green/10 text-healthy-green border border-healthy-green/20 uppercase tracking-wide">
                  Ready to Print
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Indian boy's journey, 5 privacy pillars, security, copyright & disclaimer
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-healthy-green group-hover:translate-x-0.5 transition-transform shrink-0" />
        </a>
        {[
          { id: 'feedback', label: 'Share Feedback & Feature Suggestions 👋', icon: MessageSquarePlus, action: onOpenFeedback },
          { id: 'disclaimer', label: 'Medical Disclaimer', icon: Info, action: () => onOpenLegal('disclaimer') },
          { id: 'privacy', label: 'Privacy Policy', icon: Lock, action: () => onOpenLegal('privacy') },
          { id: 'terms', label: 'Terms of Service', icon: FileText, action: () => onOpenLegal('terms') },
          { id: 'support', label: 'Support PureScan Project', icon: HeartHandshake, action: onOpenSupport }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id} 
              type="button"
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-healthy-green transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center pt-2 space-y-1">
        <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
          PureScan Clinical AI • Enterprise Food Safety Model
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Certified for personal dietary assessment & toxic chemical screening
        </p>
      </div>
    </div>
  );
};

export interface IngredientItem {
  name: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
  implications: string;
}

export interface FamilyMemberProfile {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  enabled: boolean;
  allergens: string[];
  dietaryPreferences: string[];
}

export interface FamilyCompatibilityResult {
  member: FamilyMemberProfile;
  status: 'safe' | 'caution' | 'unsafe';
  badgeText: string;
  reasons: string[];
}

export const DEFAULT_FAMILY_PROFILES: FamilyMemberProfile[] = [
  {
    id: 'member-self',
    name: 'Me',
    role: 'Primary',
    avatarEmoji: '🧑',
    enabled: true,
    allergens: ['Peanuts'],
    dietaryPreferences: ['Vegetarian', 'No Artificial Dyes']
  },
  {
    id: 'member-kid',
    name: 'Kid',
    role: 'Child Safety',
    avatarEmoji: '🧒',
    enabled: true,
    allergens: ['Peanuts', 'Tree Nuts'],
    dietaryPreferences: ['No Artificial Dyes', 'Sugar-Free / Diabetic']
  },
  {
    id: 'member-parents',
    name: 'Parents',
    role: 'Senior Care',
    avatarEmoji: '🧓',
    enabled: true,
    allergens: ['Milk / Dairy'],
    dietaryPreferences: ['Sugar-Free / Diabetic', 'Low Sodium', 'Seed Oil Free']
  }
];

const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  'wheat / gluten': ['wheat', 'gluten', 'barley', 'rye', 'spelt', 'malt', 'maida', 'semolina', 'durum'],
  'milk / dairy': ['milk', 'dairy', 'whey', 'casein', 'lactose', 'butter', 'cheese', 'cream', 'ghee', 'milk solids'],
  'peanuts': ['peanut', 'groundnut', 'arachis'],
  'tree nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'],
  'soy': ['soy', 'soya', 'edamame', 'soy lecithin', 'tofu'],
  'eggs': ['egg', 'albumin', 'ovalbumin', 'mayonnaise', 'lysozyme'],
  'shellfish': ['shellfish', 'shrimp', 'prawn', 'crab', 'lobster', 'krill'],
  'fish': ['fish', 'anchovy', 'salmon', 'tuna', 'cod', 'tilapia'],
  'sesame': ['sesame', 'tahini', 'gingelly', 'til'],
  'sulfites': ['sulfite', 'sulphite', 'sulfur dioxide', 'metabisulfite', 'e220', 'e221', 'e222', 'e223', 'e224'],
  'mustard': ['mustard'],
  'corn': ['corn', 'maize', 'high fructose corn syrup', 'corn syrup', 'corn starch'],
  'barley': ['barley', 'malt'],
  'rye': ['rye']
};

const DIETARY_VIOLATION_RULES: Record<string, { keywords: string[]; label: string }> = {
  'no artificial dyes': {
    keywords: ['red 40', 'yellow 5', 'yellow 6', 'blue 1', 'blue 2', 'green 3', 'tartrazine', 'sunset yellow', 'allura red', 'brilliant blue', 'caramel color', 'titanium dioxide', 'artificial color', 'synthetic colour', 'e102', 'e110', 'e129', 'e133', 'ins 102', 'ins 110', 'ins 129'],
    label: 'Artificial Dye'
  },
  'sugar-free / diabetic': {
    keywords: ['high fructose corn syrup', 'corn syrup', 'liquid glucose', 'invert sugar', 'maltodextrin', 'dextrose', 'sucrose', 'added sugar', 'cane sugar', 'fructose', 'maltose', 'jaggery', 'honey'],
    label: 'High Glycemic / Sugar'
  },
  'low sodium': {
    keywords: ['monosodium glutamate', 'msg', 'sodium nitrite', 'sodium nitrate', 'sodium benzoate', 'disodium', 'high sodium', 'e621', 'ins 621'],
    label: 'Sodium / MSG Additive'
  },
  'seed oil free': {
    keywords: ['palm oil', 'palmolein', 'sunflower oil', 'soybean oil', 'canola oil', 'cottonseed oil', 'rapeseed oil', 'rice bran oil', 'vegetable oil', 'hydrogenated', 'interesterified'],
    label: 'Refined / Seed Oil'
  },
  'vegan': {
    keywords: ['milk', 'dairy', 'whey', 'casein', 'lactose', 'butter', 'cheese', 'ghee', 'egg', 'albumin', 'honey', 'gelatin', 'carmine', 'lard', 'tallow', 'chicken', 'beef', 'pork', 'fish', 'shellfish', 'collagen'],
    label: 'Animal-Derived Ingredient'
  },
  'vegetarian': {
    keywords: ['gelatin', 'carmine', 'lard', 'tallow', 'chicken', 'beef', 'pork', 'fish', 'shellfish', 'anchovy', 'bone', 'meat', 'rennet', 'collagen'],
    label: 'Non-Vegetarian Ingredient'
  },
  'jain (no root veggies)': {
    keywords: ['onion', 'garlic', 'potato', 'ginger', 'carrot', 'beetroot', 'radish', 'turmeric root', 'onion powder', 'garlic powder', 'dehydrated onion', 'dehydrated garlic'],
    label: 'Root Vegetable (Non-Jain)'
  },
  'gluten-free': {
    keywords: ['wheat', 'gluten', 'barley', 'rye', 'malt', 'maida', 'semolina', 'spelt', 'triticale'],
    label: 'Gluten Source'
  },
  'keto / low-carb': {
    keywords: ['sugar', 'corn syrup', 'high fructose', 'wheat flour', 'maida', 'rice flour', 'potato starch', 'maltodextrin', 'corn starch', 'dextrose', 'glucose syrup'],
    label: 'High-Carb / Keto Conflict'
  },
  'dairy-free': {
    keywords: ['milk', 'dairy', 'whey', 'casein', 'lactose', 'butter', 'cheese', 'cream', 'milk solids'],
    label: 'Dairy Ingredient'
  }
};

export function evaluateFamilyCompatibility(
  score: number,
  grade: string,
  riskyIngredients: IngredientItem[],
  rawIngredientsText: string,
  profiles: FamilyMemberProfile[]
): FamilyCompatibilityResult[] {
  const activeProfiles = profiles.filter(p => p.enabled);
  const combinedCorpus = [
    rawIngredientsText || '',
    ...riskyIngredients.map(r => `${r.name} ${r.description} ${r.implications}`)
  ]
    .join(' ')
    .toLowerCase();

  return activeProfiles.map(member => {
    const unsafeReasons: string[] = [];
    const cautionReasons: string[] = [];

    // 1. Check Member's Allergens (Strict Unsafe)
    for (const allergen of member.allergens) {
      const key = allergen.toLowerCase().trim();
      const terms = ALLERGEN_SYNONYMS[key] || key.split('/').map(s => s.trim()).filter(Boolean);
      const matchedTerm = terms.find(t => combinedCorpus.includes(t));
      if (matchedTerm) {
        unsafeReasons.push(`Contains ${allergen} (${matchedTerm})`);
      }
    }

    // 2. Check Member's Dietary Preferences
    for (const pref of member.dietaryPreferences) {
      const key = pref.toLowerCase().trim();
      const rule = DIETARY_VIOLATION_RULES[key];
      if (rule) {
        const matchedKeyword = rule.keywords.find(kw => combinedCorpus.includes(kw));
        if (matchedKeyword) {
          cautionReasons.push(`${pref}: Found "${matchedKeyword}"`);
        }
      } else if (key && combinedCorpus.includes(key)) {
        cautionReasons.push(`Conflicts with ${pref}`);
      }
    }

    // 3. Also check if product has High-Risk additives for Child / Senior roles
    const highRiskAdditives = riskyIngredients.filter(r => r.risk === 'high');
    if (
      (member.role.toLowerCase().includes('child') ||
        member.role.toLowerCase().includes('senior') ||
        member.name.toLowerCase().includes('kid') ||
        member.name.toLowerCase().includes('parent')) &&
      highRiskAdditives.length > 0
    ) {
      highRiskAdditives.slice(0, 2).forEach(h => {
        const msg = `High-Risk Additive: ${h.name}`;
        if (!cautionReasons.includes(msg) && !unsafeReasons.includes(msg)) {
          cautionReasons.push(msg);
        }
      });
    }

    if (unsafeReasons.length > 0) {
      return {
        member,
        status: 'unsafe',
        badgeText: `Unsafe for ${member.name}`,
        reasons: unsafeReasons
      };
    }

    if (cautionReasons.length > 0 || score < 45 || grade === 'D' || grade === 'F') {
      return {
        member,
        status: 'caution',
        badgeText: `Caution for ${member.name}`,
        reasons:
          cautionReasons.length > 0
            ? cautionReasons
            : [`Low overall purity score (${score}/100, Grade ${grade})`]
      };
    }

    return {
      member,
      status: 'safe',
      badgeText: `Safe for ${member.name}`,
      reasons: ['Compatible with allergen & dietary profile']
    };
  });
}

// --- FEATURE 4: One-Tap Voice Summary (Web Speech API in Native Languages) ---

const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  ur: 'ur-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  as: 'as-IN',
  mai: 'hi-IN',
  sa: 'hi-IN',
  ne: 'ne-NP',
  sd: 'hi-IN',
  kok: 'mr-IN',
  doi: 'hi-IN',
  mni: 'bn-IN',
  sat: 'hi-IN',
  ks: 'ur-IN',
  brx: 'hi-IN'
};

export function stopVoiceSummary() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function buildLocalizedVoiceScript(params: {
  productName: string;
  grade: string;
  score: number;
  riskyIngredients: IngredientItem[];
  alternative?: { name: string; reason: string };
  familyResults?: FamilyCompatibilityResult[];
  langCode: string;
  targetAudience?: string;
  demographicRiskAlert?: string;
}): string {
  const { productName, grade, score, riskyIngredients, alternative, familyResults = [], langCode, targetAudience, demographicRiskAlert } = params;
  const topRisks = riskyIngredients.slice(0, 3).map(r => r.name).join(', ');
  const unsafeMembers = familyResults.filter(f => f.status === 'unsafe');
  const cautionMembers = familyResults.filter(f => f.status === 'caution');

  const isClean = score >= 75 || grade === 'A' || grade === 'B';
  const isModerate = !isClean && (score >= 50 || grade === 'C');

  if (langCode === 'hi') {
    let script = `PureScan AI स्वास्थ्य रिपोर्ट। उत्पाद का नाम: ${productName}। स्वास्थ्य ग्रेड: ${grade}, और शुद्धता स्कोर 100 में से ${score} है। `;
    if (targetAudience) {
      script += `यह उत्पाद विशेष रूप से ${targetAudience} को लक्षित करता है। `;
    }
    if (isClean) {
      script += `यह उत्पाद स्वास्थ्य के लिए सुरक्षित और स्वच्छ श्रेणी में आता है। `;
    } else if (isModerate) {
      script += `इस उत्पाद में मध्यम जोखिम वाले तत्व पाए गए हैं, कृपया सावधानी से सेवन करें। `;
    } else {
      script += `सावधान! इस उत्पाद में हानिकारक रसायन या एलर्जी तत्व पाए गए हैं। `;
    }
    if (demographicRiskAlert) {
      script += `जनसांख्यिकीय चेतावनी: ${demographicRiskAlert}। `;
    }
    if (unsafeMembers.length > 0) {
      script += `परिवार सुरक्षा चेतावनी: यह उत्पाद ${unsafeMembers.map(u => u.member.name).join(' और ')} के लिए असुरक्षित है क्योंकि इसमें ${unsafeMembers[0].reasons[0]} है। `;
    } else if (cautionMembers.length > 0) {
      script += `परिवार के लिए सूचना: ${cautionMembers.map(u => u.member.name).join(', ')} को सावधानी बरतनी चाहिए। `;
    }
    if (riskyIngredients.length > 0) {
      script += `इसमें ${riskyIngredients.length} चिंताजनक तत्व पहचाने गए हैं, जिनमें प्रमुख हैं: ${topRisks}। `;
    } else {
      script += `इसमें कोई हानिकारक केमिकल नहीं मिला है। `;
    }
    if (alternative?.name) {
      script += `बेहतर और स्वस्थ विकल्प के रूप में आप ${alternative.name} चुन सकते हैं। ${alternative.reason}। `;
    }
    script += `अस्वीकरण: यह एआई रिपोर्ट केवल शैक्षिक जानकारी के लिए है और चिकित्सकीय सलाह का विकल्प नहीं है। गंभीर एलर्जी होने पर सेवन से पहले वास्तविक पैकेट लेबल की जांच अवश्य करें।`;
    return script;
  }

  // Default English & universal clear clinical voice readout
  let script = `PureScan A.I. Clinical Verdict for ${productName}. Health Grade ${grade}, with a purity score of ${score} out of 100. `;
  if (targetAudience) {
    script += `Marketed demographic: ${targetAudience}. `;
  }
  if (isClean) {
    script += `This product has a clean and favorable nutritional profile. `;
  } else if (isModerate) {
    script += `Exercise moderate caution. This item contains processed additives. `;
  } else {
    script += `Critical health warning! High-risk additives or allergens were detected. `;
  }
  if (demographicRiskAlert) {
    script += `Target Vulnerability Alert: ${demographicRiskAlert}. `;
  }

  if (unsafeMembers.length > 0) {
    script += `Family Guard Alert: Unsafe for ${unsafeMembers.map(u => u.member.name).join(' and ')} due to ${unsafeMembers[0].reasons[0]}. `;
  } else if (cautionMembers.length > 0) {
    script += `Family Notice: Caution advised for ${cautionMembers.map(c => c.member.name).join(' and ')}. `;
  }

  if (riskyIngredients.length > 0) {
    script += `${riskyIngredients.length} ingredient ${riskyIngredients.length === 1 ? 'concern was' : 'concerns were'} identified, including ${topRisks}. `;
  } else {
    script += `Zero harmful synthetic additives were detected. `;
  }

  if (unsafeMembers.length > 0) {
    script += `Family Guard Alert: Unsafe for ${unsafeMembers.map(u => u.member.name).join(' and ')} due to ${unsafeMembers[0].reasons[0]}. `;
  } else if (cautionMembers.length > 0) {
    script += `Family Notice: Caution advised for ${cautionMembers.map(c => c.member.name).join(' and ')}. `;
  }

  if (riskyIngredients.length > 0) {
    script += `${riskyIngredients.length} ingredient ${riskyIngredients.length === 1 ? 'concern was' : 'concerns were'} identified, including ${topRisks}. `;
  } else {
    script += `Zero harmful synthetic additives were detected. `;
  }

  if (alternative?.name) {
    script += `Recommended healthier swap: ${alternative.name}. ${alternative.reason}. `;
  }

  script += `Disclaimer: This automated analysis is for educational purposes only and is not a substitute for professional medical advice. Always verify the physical product label before consumption.`;

  return script;
}

export function speakTextWithWebSpeech(
  text: string,
  langCode: string = 'en',
  rate: number = 0.96,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (msg: string) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Voice synthesis is not supported on this browser.');
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const targetBcp = LANG_TO_BCP47[langCode] || 'en-IN';
    utterance.lang = targetBcp;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = targetBcp.split('-')[0].toLowerCase();
      const exactMatch = voices.find(v => v.lang.toLowerCase() === targetBcp.toLowerCase());
      const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      const englishFallback = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      utterance.voice = exactMatch || prefixMatch || englishFallback || voices[0];
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  } catch (err: any) {
    onEnd?.();
    onError?.(err?.message || 'Unable to play voice summary.');
  }
}

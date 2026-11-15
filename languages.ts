// Languages configuration for India's 22 Scheduled Languages + Local/Regional Languages
// Hybrid Model System: Native lexicon translations + strict clinical ontologies

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  region: string;
  isScheduled: boolean;
}

export const SCHEDULED_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'Pan-India', isScheduled: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal, Tripura', isScheduled: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra Pradesh, Telangana', isScheduled: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra, Goa', isScheduled: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu, Puducherry', isScheduled: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', region: 'Pan-India, Jammu & Kashmir', isScheduled: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat', isScheduled: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka', isScheduled: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala, Lakshadweep', isScheduled: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'Odisha', isScheduled: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'Punjab, Delhi', isScheduled: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', region: 'Assam', isScheduled: true },
  { code: 'ma', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', region: 'Bihar, Jharkhand', isScheduled: true },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', region: 'Scholarly / Classical', isScheduled: true },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', region: 'Jharkhand, Odisha, Bengal', isScheduled: true },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر / कॉशुर', script: 'Perso-Arabic / Devanagari', region: 'Jammu & Kashmir', isScheduled: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', region: 'Sikkim, West Bengal', isScheduled: true },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', region: 'Goa, Karnataka, Maharashtra', isScheduled: true },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', script: 'Perso-Arabic / Devanagari', region: 'Pan-India', isScheduled: true },
  { code: 'dog', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', region: 'Jammu & Kashmir, Himachal', isScheduled: true },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্ / ꯃꯤꯇꯩꯂꯣꯟ', script: 'Bengali / Meitei Mayek', region: 'Manipur', isScheduled: true },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', region: 'Assam, Bodoland', isScheduled: true },
];

export const REGIONAL_AND_LOCAL_LANGUAGES: LanguageOption[] = [
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', script: 'Devanagari', region: 'Bihar, Eastern UP', isScheduled: false },
  { code: 'raj', name: 'Rajasthani / Marwari', nativeName: 'राजस्थानी / मारवाड़ी', script: 'Devanagari', region: 'Rajasthan', isScheduled: false },
  { code: 'chg', name: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी', script: 'Devanagari', region: 'Chhattisgarh', isScheduled: false },
  { code: 'mag', name: 'Magahi', nativeName: 'मगही', script: 'Devanagari', region: 'Bihar, Jharkhand', isScheduled: false },
  { code: 'har', name: 'Haryanvi', nativeName: 'हरियाणवी', script: 'Devanagari', region: 'Haryana', isScheduled: false },
  { code: 'tul', name: 'Tulu', nativeName: 'ತುಳು', script: 'Kannada', region: 'Dakshina Kannada, Udupi', isScheduled: false },
  { code: 'gar', name: 'Garhwali', nativeName: 'गढ़वाली', script: 'Devanagari', region: 'Uttarakhand', isScheduled: false },
  { code: 'kum', name: 'Kumaoni', nativeName: 'कुमाऊँनी', script: 'Devanagari', region: 'Uttarakhand', isScheduled: false },
  { code: 'kok-kan', name: 'Kodava', nativeName: 'ಕೊಡವ ತಕ್ಕ್', script: 'Kannada', region: 'Kodagu (Coorg)', isScheduled: false },
  { code: 'ang', name: 'Angika', nativeName: 'अंगिका', script: 'Devanagari', region: 'Bihar, Jharkhand', isScheduled: false },
];

export const DEFAULT_REPORT_LANGUAGE = 'en';
export const DEFAULT_APP_LANGUAGE = 'en';

export const ALL_REPORT_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (Clinical Default)', nativeName: 'English', script: 'Latin', region: 'International', isScheduled: false },
  ...SCHEDULED_LANGUAGES
];

export const ALL_APP_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English (Default)', nativeName: 'English', script: 'Latin', region: 'Global', isScheduled: false },
  ...SCHEDULED_LANGUAGES,
  ...REGIONAL_AND_LOCAL_LANGUAGES
];

// Hybrid Model Linguistic Vocabulary Dictionary (Deterministic Ontology)
export interface LinguisticOntology {
  title: string;
  auditReport: string;
  impactSummary: string;
  score: string;
  grade: string;
  riskLevel: string;
  critical: string;
  moderate: string;
  low: string;
  verifiedAi: string;
  ingredientAudit: string;
  concernsIdentified: string;
  recommendedSwap: string;
  medicalContext: string;
  disclaimer: string;
  methodology: string;
  pristineProfile: string;
  favorableProfile: string;
  moderateProfile: string;
  criticalProfile: string;
  cleanBadge: string;
  cautionBadge: string;
  hazardBadge: string;
}

export const HYBRID_DICTIONARY: Record<string, LinguisticOntology> = {
  en: {
    title: "PURESCAN CLINICAL",
    auditReport: "Health Audit Report",
    impactSummary: "IMPACT SUMMARY",
    score: "SCORE",
    grade: "GRADE",
    riskLevel: "RISK LEVEL",
    critical: "CRITICAL",
    moderate: "MODERATE",
    low: "LOW RISK",
    verifiedAi: "VERIFIED CLINICAL",
    ingredientAudit: "Ingredient Audit",
    concernsIdentified: "CONCERNS IDENTIFIED",
    recommendedSwap: "RECOMMENDED SWAP",
    medicalContext: "MEDICAL CONTEXT & LIMITATIONS",
    disclaimer: "This document is an automated analysis generated by the PureScan AI audit system. Laboratory testing is the definitive method for biochemical composition.",
    methodology: "METHODOLOGY",
    pristineProfile: "Pristine biochemical profile verified. No high-risk artificial additives detected.",
    favorableProfile: "Favorable profile identified. Minor processing ingredients found but generally clean.",
    moderateProfile: "Moderate profile detected. Some concerns identified for long-term health.",
    criticalProfile: "Critical ingredients identified. Potential long-term health implications detected.",
    cleanBadge: "Nutritionally Clean",
    cautionBadge: "Moderate Caution",
    hazardBadge: "Critical Hazard"
  },
  hi: {
    title: "प्योरस्कैन क्लिनिकल",
    auditReport: "स्वास्थ्य परीक्षण रिपोर्ट",
    impactSummary: "प्रभाव सारांश",
    score: "स्कोर",
    grade: "ग्रेड",
    riskLevel: "जोखिम स्तर",
    critical: "अति गंभीर",
    moderate: "मध्यम",
    low: "सुरक्षित",
    verifiedAi: "प्रमाणित क्लिनिकल",
    ingredientAudit: "सामग्री का गहन विश्लेषण",
    concernsIdentified: "चिंताजनक तत्व पाए गए",
    recommendedSwap: "स्वास्थ्यवर्धक विकल्प",
    medicalContext: "चिकित्सीय संदर्भ एवं सीमाएं",
    disclaimer: "यह दस्तावेज प्योरस्कैन प्रणाली द्वारा स्वचालित रूप से तैयार किया गया है। गंभीर स्वास्थ्य समस्याओं के लिए विशेषज्ञ चिकित्सक से परामर्श लें।",
    methodology: "कार्यप्रणाली",
    pristineProfile: "उत्कृष्ट जैविक गुणवत्ता प्रमाणित। कोई उच्च जोखिम वाला कृत्रिम रसायन नहीं मिला।",
    favorableProfile: "सकारात्मक गुणवत्ता पाई गई। मामूली प्रसंस्कृत तत्व हैं लेकिन सामान्यतः सुरक्षित है।",
    moderateProfile: "मध्यम श्रेणी की गुणवत्ता। दीर्घकालिक स्वास्थ्य के लिए कुछ हानिकारक तत्व मौजूद हैं।",
    criticalProfile: "गंभीर जोखिम वाले तत्व पाए गए। दीर्घकालिक स्वास्थ्य के लिए हानिकारक हो सकते हैं।",
    cleanBadge: "पोषण की दृष्टि से शुद्ध",
    cautionBadge: "मध्यम सावधानी आवश्यक",
    hazardBadge: "अत्यधिक हानिकारक"
  },
  bn: {
    title: "পিওরস্ক্যান ক্লিনিকাল",
    auditReport: "স্বাস্থ্য নিরীক্ষা প্রতিবেদন",
    impactSummary: "প্রভাব সারসংক্ষেপ",
    score: "স্কোর",
    grade: "গ্রেড",
    riskLevel: "ঝুঁকির মাত্রা",
    critical: "মারাত্মক ঝুঁকি",
    moderate: "মাঝারি",
    low: "নিরাপদ",
    verifiedAi: "যাচাইকৃত ক্লিনিকাল",
    ingredientAudit: "উপাদান নিরীক্ষা",
    concernsIdentified: "উদ্বেগজনক উপাদান চিহ্নিত",
    recommendedSwap: "স্বাস্থ্যকর বিকল্প",
    medicalContext: "চিকিৎসা সংক্রান্ত সীমাবদ্ধতা",
    disclaimer: "এই প্রতিবেদনটি পিওরস্ক্যান এআই সিস্টেম দ্বারা প্রস্তুত। গুরুতর অ্যালার্জি বা স্বাস্থ্যজনিত বিষয়ে চিকিৎসকের পরামর্শ নিন।",
    methodology: "পদ্ধতি",
    pristineProfile: "বিশুদ্ধ উপাদানের প্রোফাইল নিশ্চিত। কোনো ক্ষতিকারক রাসায়নিক পাওয়া যায়নি।",
    favorableProfile: "সন্তোষজনক গুণমান। সামান্য প্রক্রিয়াজাত হলেও সামগ্রিকভাবে নিরাপদ।",
    moderateProfile: "মাঝারি মানের প্রোফাইল। দীর্ঘমেয়াদী স্বাস্থ্যের জন্য কিছু ক্ষতিকর উপাদান রয়েছে।",
    criticalProfile: "ঝুঁকিপূর্ণ উপাদান চিহ্নিত। নিয়মিত গ্রহণে স্বাস্থ্যের মারাত্মক ক্ষতি হতে পারে।",
    cleanBadge: "পুষ্টিগতভাবে বিশুদ্ধ",
    cautionBadge: "সতর্কতা প্রয়োজন",
    hazardBadge: "মারাত্মক ক্ষতিকর"
  },
  te: {
    title: "ప్యూర్ స్కాన్ క్లినికల్",
    auditReport: "ఆరోగ్య ఆడిట్ నివేదిక",
    impactSummary: "ప్రభావ సారాంశం",
    score: "స్కోర్",
    grade: "గ్రేడ్",
    riskLevel: "ప్రమాద తీవ్రత",
    critical: "తీవ్ర ప్రమాదం",
    moderate: "మధ్యస్థం",
    low: "సురక్షితం",
    verifiedAi: "ధృవీకరించబడిన క్లినికల్",
    ingredientAudit: "పదార్థాల పరిశీలన",
    concernsIdentified: "హానికర పదార్థాలు గుర్తించబడ్డాయి",
    recommendedSwap: "ఆరోగ్యకరమైన ప్రత్యామ్నాయం",
    medicalContext: "వైద్య పరిమితులు",
    disclaimer: "ఈ నివేదిక ప్యూర్ స్కాన్ సిస్టమ్ ద్వారా రూపొందించబడింది. వ్యక్తిగత అనారోగ్య సమస్యలకు వైద్యుల సలహా తప్పనిసరి.",
    methodology: "విధానం",
    pristineProfile: "స్వచ్ఛమైన పోషక ప్రమాణాలు ధృవీకరించబడ్డాయి. ఎలాంటి హానికర రసాయనాలు లేవు.",
    favorableProfile: "మంచి నాణ్యత కలిగి ఉంది. సాధారణంగా శరీరానికి ఎంతో సురక్షితం.",
    moderateProfile: "మధ్యస్థ పోషక ప్రమాణాలు. దీర్ఘకాలిక వినియోగంలో కొద్దిగా జాగ్రత్త అవసరం.",
    criticalProfile: "తీవ్రమైన ప్రమాదకర పదార్థాలు గుర్తించబడ్డాయి. శరీర ఆరోగ్యానికి హానికరం కావచ్చు.",
    cleanBadge: "పోషకపరంగా పరిశుభ్రమైనది",
    cautionBadge: "మధ్యస్థ జాగ్రత్త అవసరం",
    hazardBadge: "తీవ్రమైన ప్రమాదం"
  },
  ta: {
    title: "பியூர்ஸ்கேன் மருத்துவ ஆய்வு",
    auditReport: "உடல்நல தணிக்கை அறிக்கை",
    impactSummary: "தாக்க சுருக்கம்",
    score: "மதிப்பெண்",
    grade: "தரம்",
    riskLevel: "அபாய நிலை",
    critical: "மிக ஆபத்தானது",
    moderate: "மிதமான ஆபத்து",
    low: "பாதுகாப்பானது",
    verifiedAi: "சான்றளிக்கப்பட்ட ஆய்வு",
    ingredientAudit: "மூலப்பொருள் தணிக்கை",
    concernsIdentified: "கண்டறியப்பட்ட அபாயங்கள்",
    recommendedSwap: "ஆரோக்கியமான மாற்றுப்பொருள்",
    medicalContext: "மருத்துவ வரம்புகள்",
    disclaimer: "இந்த அறிக்கை பியூர்ஸ்கேன் அமைப்பால் தானாக உருவாக்கப்பட்டது. தீவிர ஒவ்வாமைக்கு மருத்துவ ஆலோசனை பெறவும்.",
    methodology: "முறையியல்",
    pristineProfile: "தூய ஊட்டச்சத்து விவரக்குறிப்பு. எவ்வித ஆபத்தான செயற்கை சேர்க்கைகளும் இல்லை.",
    favorableProfile: "நம்பகமான தரம். பொதுவான பயன்பாட்டிற்கு மிகவும் பாதுகாப்பானது.",
    moderateProfile: "மிதமான தரம். நீண்டகால பயன்பாட்டில் சில கவனங்கள் தேவைப்படுகின்றன.",
    criticalProfile: "ஆபத்தான ரசாயனங்கள் கண்டறியப்பட்டுள்ளன. உடல்நலத்திற்கு தீங்கானது.",
    cleanBadge: "ஊட்டச்சத்து ரீதியாக சுத்தமானது",
    cautionBadge: "மிதமான கவனம் தேவை",
    hazardBadge: "மிகவும் ஆபத்தானது"
  },
  mr: {
    title: "प्युअरस्कॅन क्लिनिकल",
    auditReport: "आरोग्य तपासणी अहवाल",
    impactSummary: "प्रभाव सारांश",
    score: "गुण",
    grade: "श्रेणी",
    riskLevel: "धोक्याची पातळी",
    critical: "अतिधोकादायक",
    moderate: "मध्यम",
    low: "सुरक्षित",
    verifiedAi: "प्रमाणित क्लिनिकल",
    ingredientAudit: "घटकांचे सखोल विश्लेषण",
    concernsIdentified: "धोकादायक घटक आढळले",
    recommendedSwap: "आरोग्यदायी पर्याय",
    medicalContext: "वैद्यकीय संदर्भ व मर्यादा",
    disclaimer: "हा अहवाल स्वयंचलित प्रणालीद्वारे तयार करण्यात आला आहे. गंभीर विकारांसाठी वैद्यकीय तज्ज्ञांचा सल्ला घ्यावा.",
    methodology: "कार्यपद्धती",
    pristineProfile: "उत्कृष्ट दर्जा प्रमाणित. कोणतीही घातक रसायने आढळली नाहीत.",
    favorableProfile: "चांगला दर्जा. काही किरकोळ प्रक्रिया घटक आहेत पण सामान्यतः सुरक्षित आहे.",
    moderateProfile: "मध्यम दर्जा. दीर्घकालीन आरोग्यासाठी काही घटक हानिकारक ठरू शकतात.",
    criticalProfile: "गंभीर घातक घटक आढळले. आरोग्यावर दुष्परिणाम होण्याची शक्यता आहे.",
    cleanBadge: "पोषणदृष्ट्या शुद्ध",
    cautionBadge: "मध्यम खबरदारी आवश्यक",
    hazardBadge: "अत्यंत घातक"
  },
  gu: {
    title: "પ્યોરસ્કેન ક્લિનિકલ",
    auditReport: "હેલ્થ ઓડિટ રિપોર્ટ",
    impactSummary: "અસર સારાંશ",
    score: "સ્કોર",
    grade: "ગ્રેડ",
    riskLevel: "જોખમનું સ્તર",
    critical: "અતિ ગંભીર",
    moderate: "મધ્યમ",
    low: "સલામત",
    verifiedAi: "પ્રમાણિત ક્લિનિકલ",
    ingredientAudit: "ઘટકોની ઊંડાણપૂર્વક ચકાસણી",
    concernsIdentified: "ચિંતાજનક ઘટકો ઓળખાયા",
    recommendedSwap: "સ્વસ્થ વિકલ્પ",
    medicalContext: "તબીબી મર્યાદાઓ",
    disclaimer: "આ રિપોર્ટ પ્યોરસ્કેન સિસ્ટમ દ્વારા આપમેળે બનાવાયો છે. ગંભીર તકલીફમાં નિષ્ણાત તબીબની સલાહ લો.",
    methodology: "પદ્ધતિ",
    pristineProfile: "શુદ્ધ પોષક તત્વો પ્રમાણિત. કોઈ હાનિકારક કૃત્રિમ રસાયણ મળ્યું નથી.",
    favorableProfile: "સારી ગુણવત્તા. સામાન્ય રીતે વપરાશ માટે એકદમ સુરક્ષિત.",
    moderateProfile: "મધ્યમ ગુણવત્તા. લાંબા ગાળે સ્વાસ્થ્ય માટે કેટલીક સાવચેતી જરૂરી.",
    criticalProfile: "ગંભીર જોખમી ઘટકો મળ્યા છે. સ્વાસ્થ્ય માટે હાનિકારક સાબિત થઈ શકે છે.",
    cleanBadge: "પોષણની દ્રષ્ટિએ શુદ્ધ",
    cautionBadge: "મધ્યમ સાવધાની જરૂરી",
    hazardBadge: "ખતરનાક જોખમ"
  },
  kn: {
    title: "ಪ್ಯೂರ್ ಸ್ಕ್ಯಾನ್ ಕ್ಲಿನಿಕಲ್",
    auditReport: "ಆರೋಗ್ಯ ಆಡಿಟ್ ವರದಿ",
    impactSummary: "ಪ್ರಭಾವದ ಸಾರಾಂಶ",
    score: "ಅಂಕ",
    grade: "ಗ್ರೇಡ್",
    riskLevel: "ಅಪಾಯದ ಮಟ್ಟ",
    critical: "ತೀವ್ರ ಅಪಾಯ",
    moderate: "ಮಧ್ಯಮ",
    low: "ಸುರಕ್ಷಿತ",
    verifiedAi: "ದೃಢೀಕೃತ ಕ್ಲಿನಿಕಲ್",
    ingredientAudit: "ಪದಾರ್ಥಗಳ ಪರಿಶೀಲನೆ",
    concernsIdentified: "ಅಪಾಯಕಾರಿ ಅಂಶಗಳು ಕಂಡುಬಂದಿವೆ",
    recommendedSwap: "ಆರೋಗ್ಯಕರ ಪರ್ಯಾಯ",
    medicalContext: "ವೈದ್ಯಕೀಯ ಮಿತಿಗಳು",
    disclaimer: "ಈ ವರದಿಯು ಪ್ಯೂರ್ ಸ್ಕ್ಯಾನ್ ಎಐ ವ್ಯವಸ್ಥೆಯಿಂದ ರಚಿಸಲ್ಪಟ್ಟಿದೆ. ಗಂಭೀರ ಸಮಸ್ಯೆಗಳಿದ್ದಲ್ಲಿ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    methodology: "ವಿಧಾನ",
    pristineProfile: "ಶುದ್ಧ ಪೌಷ್ಟಿಕ ಪ್ರೊಫೈಲ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಯಾವುದೇ ಹಾನಿಕಾರಕ ರಾಸಾಯನಿಕಗಳಿಲ್ಲ.",
    favorableProfile: "ಉತ್ತಮ ಗುಣಮಟ್ಟ. ಸಾಮಾನ್ಯವಾಗಿ ಬಳಕೆಗೆ ಅತ್ಯಂತ ಸುರಕ್ಷಿತ.",
    moderateProfile: "ಮಧ್ಯಮ ಗುಣಮಟ್ಟ. ದೀರ್ಘಕಾಲದ ಬಳಕೆಗೆ ಕೆಲವು ಎಚ್ಚರಿಕೆಗಳು ಅಗತ್ಯ.",
    criticalProfile: "ತೀವ್ರ ಅಪಾಯಕಾರಿ ಅಂಶಗಳು ಪತ್ತೆಯಾಗಿವೆ. ಆರೋಗ್ಯಕ್ಕೆ ಹಾನಿಕಾರಕವಾಗಬಹುದು.",
    cleanBadge: "ಪೌಷ್ಟಿಕಾಂಶದಲ್ಲಿ ಶುದ್ಧ",
    cautionBadge: "ಮಧ್ಯಮ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ",
    hazardBadge: "ತೀವ್ರ ಅಪಾಯ"
  },
  ml: {
    title: "പ്യുവർസ്കാൻ ക്ലിനിക്കൽ",
    auditReport: "ആരോഗ്യ ഓഡിറ്റ് റിപ്പോർട്ട്",
    impactSummary: "പ്രത്യാഘാത സംഗ്രഹം",
    score: "സ്കോർ",
    grade: "ഗ്രേഡ്",
    riskLevel: "അപകട സാധ്യത",
    critical: "ഗുരുതരമായ അപകടം",
    moderate: "മിതമായത്",
    low: "സുരക്ഷിതം",
    verifiedAi: "സാക്ഷ്യപ്പെടുത്തിയ ക്ലിനിക്കൽ",
    ingredientAudit: "ചേരുവകളുടെ പരിശോധന",
    concernsIdentified: "ആശങ്കാജനകമായ ഘടകങ്ങൾ",
    recommendedSwap: "ആരോഗ്യകരമായ ബദൽ",
    medicalContext: "വൈദ്യശാസ്ത്ര പരിമിതികൾ",
    disclaimer: "ഈ റിപ്പോർട്ട് പ്യുവർസ്കാൻ സിസ്റ്റം വഴി തയ്യാറാക്കിയതാണ്. അലർജിയോ അസുഖങ്ങളോ ഉള്ളവർ ഡോക്ടറെ കാണുക.",
    methodology: "രീതിശാസ്ത്രം",
    pristineProfile: "മികച്ച പോഷകഗുണം ഉറപ്പുവരുത്തി. അപകടകരമായ കൃത്രിമ ചേരുവകൾ ഒന്നും കണ്ടെത്തിയില്ല.",
    favorableProfile: "തൃപ്തികരമായ ഗുണനിലവാരം. സാധാരണ ഉപയോഗത്തിന് തികച്ചും സുരക്ഷിതം.",
    moderateProfile: "മിതമായ ഗുണനിലവാരം. ദീർഘകാല ആരോഗ്യത്തിന് ചില ആശങ്കകളുണ്ട്.",
    criticalProfile: "ഗുരുതരമായ അപകട ഘടകങ്ങൾ കണ്ടെത്തി. ആരോഗ്യത്തിന് ഹാനികരമായേക്കാം.",
    cleanBadge: "പോഷകസമൃദ്ധവും ശുദ്ധവും",
    cautionBadge: "മിതമായ ജാഗ്രത വേണം",
    hazardBadge: "ഗുരുതരമായ അപകടം"
  },
  pa: {
    title: "ਪਿਓਰਸਕੈਨ ਕਲੀਨਿਕਲ",
    auditReport: "ਸਿਹਤ ਆਡਿਟ ਰਿਪੋਰਟ",
    impactSummary: "ਅਸਰ ਦਾ ਸਾਰ",
    score: "ਸਕੋਰ",
    grade: "ਗ੍ਰੇਡ",
    riskLevel: "ਜੋਖਮ ਪੱਧਰ",
    critical: "ਬਹੁਤ ਗੰਭੀਰ",
    moderate: "ਦਰਮਿਆਨਾ",
    low: "ਸੁਰੱਖਿਅਤ",
    verifiedAi: "ਪ੍ਰਮਾਣਿਤ ਕਲੀਨਿਕਲ",
    ingredientAudit: "ਸਮੱਗਰੀ ਦੀ ਪੜਤਾਲ",
    concernsIdentified: "ਚਿੰਤਾਜਨਕ ਤੱਤ ਮਿਲੇ",
    recommendedSwap: "ਸਿਹਤਮੰਦ ਬਦਲ",
    medicalContext: "ਡਾਕਟਰੀ ਸੀਮਾਵਾਂ",
    disclaimer: "ਇਹ ਰਿਪੋਰਟ ਪਿਓਰਸਕੈਨ ਪ੍ਰਣਾਲੀ ਦੁਆਰਾ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ। ਗੰਭੀਰ ਸਿਹਤ ਸਮੱਸਿਆਵਾਂ ਲਈ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਲਓ।",
    methodology: "ਵਿਧੀ",
    pristineProfile: "ਸ਼ੁੱਧ ਕੁਦਰਤੀ ਪ੍ਰੋਫਾਈਲ ਪ੍ਰਮਾਣਿਤ। ਕੋਈ ਨੁਕਸਾਨਦੇਹ ਰਸਾਇਣ ਨਹੀਂ ਮਿਲਿਆ।",
    favorableProfile: "ਚੰਗੀ ਗੁਣਵੱਤਾ। ਆਮ ਤੌਰ 'ਤੇ ਖਾਣ ਲਈ ਸੁਰੱਖਿਅਤ ਹੈ।",
    moderateProfile: "ਦਰਮਿਆਨੀ ਗੁਣਵੱਤਾ। ਲੰਬੇ ਸਮੇਂ ਲਈ ਕੁਝ ਸਾਵਧਾਨੀ ਜ਼ਰੂਰੀ ਹੈ।",
    criticalProfile: "ਗੰਭੀਰ ਨੁਕਸਾਨਦੇਹ ਤੱਤ ਮਿਲੇ ਹਨ। ਸਿਹਤ ਲਈ ਹਾਨੀਕਾਰਕ ਹੋ ਸਕਦੇ ਹਨ।",
    cleanBadge: "ਪੌਸ਼ਟਿਕ ਪੱਖੋਂ ਸ਼ੁੱਧ",
    cautionBadge: "ਦਰਮਿਆਨੀ ਸਾਵਧਾਨੀ",
    hazardBadge: "ਬਹੁਤ ਨੁਕਸਾਨਦੇਹ"
  },
  or: {
    title: "ପ୍ୟୋରସ୍କାନ କ୍ଲିନିକାଲ",
    auditReport: "ସ୍ୱାସ୍ଥ୍ୟ ଅଡିଟ ରିପୋର୍ଟ",
    impactSummary: "ପ୍ରଭାବ ସାରାଂଶ",
    score: "ସ୍କୋର",
    grade: "ଗ୍ରେଡ",
    riskLevel: "ବିପଦ ସ୍ତର",
    critical: "ଅତ୍ୟନ୍ତ ଗୁରୁତର",
    moderate: "ମଧ୍ୟମ",
    low: "ସୁରକ୍ଷିତ",
    verifiedAi: "ପ୍ରମାଣିତ କ୍ଲିନିକାଲ",
    ingredientAudit: "ଉପାଦାନ ପରୀକ୍ଷଣ",
    concernsIdentified: "କ୍ଷତିକାରକ ତତ୍ତ୍ୱ ଚିହ୍ନଟ",
    recommendedSwap: "ଉତ୍ତମ ବିକଳ୍ପ",
    medicalContext: "ଡାକ୍ତରୀ ସୀମା",
    disclaimer: "ଏହି ରିପୋର୍ଟ ପ୍ୟୋରସ୍କାନ ସିଷ୍ଟମ ଦ୍ୱାରା ପ୍ରସ୍ତୁତ। ସ୍ୱାସ୍ଥ୍ୟ ସମସ୍ୟା ଥିଲେ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।",
    methodology: "କାର୍ଯ୍ୟପଦ୍ଧତି",
    pristineProfile: "ପରିଷ୍କାର ପୋଷକ ତତ୍ତ୍ୱ ପ୍ରମାଣିତ। କୌଣସି କ୍ଷତିକାରକ ରାସାୟନିକ ମିଳିନାହିଁ।",
    favorableProfile: "ଉତ୍ତମ ଗୁଣବତ୍ତା। ସାଧାରଣ ବ୍ୟବହାର ପାଇଁ ସୁରକ୍ଷିତ।",
    moderateProfile: "ମଧ୍ୟମ ଗୁଣବତ୍ତା। ଦୀର୍ଘକାଳୀନ ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ କିଛି ସତର୍କତା ଆବଶ୍ୟକ।",
    criticalProfile: "ଗୁରୁତର କ୍ଷତିକାରକ ଉପାଦାନ ମିଳିଛି। ସ୍ୱାସ୍ଥ୍ୟ ପାଇଁ କ୍ଷତିକାରକ ହୋଇପାରେ।",
    cleanBadge: "ପୋଷଣ ଦୃଷ୍ଟିରୁ ଶୁଦ୍ଧ",
    cautionBadge: "ସତର୍କତା ଆବଶ୍ୟକ",
    hazardBadge: "ଅତ୍ୟନ୍ତ ବିପଦଜନକ"
  },
  ur: {
    title: "پیور اسکین کلینیکل",
    auditReport: "ہیلتھ آڈٹ رپورٹ",
    impactSummary: "اثرات کا خلاصہ",
    score: "اسکور",
    grade: "گریڈ",
    riskLevel: "خطرے کی سطح",
    critical: "انتہائی خطرناک",
    moderate: "معتدل",
    low: "محفوظ",
    verifiedAi: "تصدیق شدہ کلینیکل",
    ingredientAudit: "اجزاء کا تجزیہ",
    concernsIdentified: "نقصان دہ اجزاء کی نشاندہی",
    recommendedSwap: "صحت مند متبادل",
    medicalContext: "طبی حدود",
    disclaimer: "یہ رپورٹ پیور اسکین سسٹم کی جانب سے تیار کی گئی ہے۔ شدید الرجیز کے لیے ڈاکٹر سے رجوع کریں۔",
    methodology: "طریقہ کار",
    pristineProfile: "مکمل طور پر محفوظ اور قدرتی۔ کوئی نقصان دہ کیمیکل نہیں پایا گیا۔",
    favorableProfile: "بہترین معیار۔ عمومی استعمال کے لیے بالکل محفوظ۔",
    moderateProfile: "معتدل معیار۔ طویل مدتی صحت کے لیے کچھ احتیاط ضروری ہے۔",
    criticalProfile: "انتہائی خطرناک اجزاء پائے گئے۔ صحت کے لیے نقصان دہ ہو سکتے ہیں۔",
    cleanBadge: "غذائیت کے لحاظ سے خالص",
    cautionBadge: "معتدل احتیاط درکار",
    hazardBadge: "انتہائی نقصان دہ"
  }
};

export function getReportOntology(langCode: string): LinguisticOntology {
  if (HYBRID_DICTIONARY[langCode]) {
    return HYBRID_DICTIONARY[langCode];
  }
  // Fallback to English dictionary for other Indian languages, keeping 100% deterministic fidelity
  return HYBRID_DICTIONARY['en'];
}

export interface AppUiDictionary {
  scanButton: string;
  historyTab: string;
  settingsTab: string;
  detectingArea: string;
  readingIngredients: string;
  evaluatingRisks: string;
  reviewTitle: string;
  exportPdf: string;
  gotIt: string;
  edit: string;
}

export const APP_UI_STRINGS: Record<string, AppUiDictionary> = {
  en: {
    scanButton: "Scan Label",
    historyTab: "History",
    settingsTab: "Settings",
    detectingArea: "Detecting Label Area...",
    readingIngredients: "Reading Ingredients...",
    evaluatingRisks: "Evaluating Health Risks...",
    reviewTitle: "Review Extracted Text",
    exportPdf: "EXPORT AS PDF",
    gotIt: "GOT IT",
    edit: "EDIT"
  },
  hi: {
    scanButton: "लेबल स्कैन करें",
    historyTab: "इतिहास",
    settingsTab: "सेटिंग्स",
    detectingArea: "लेबल क्षेत्र की पहचान...",
    readingIngredients: "सामग्री पढ़ी जा रही है...",
    evaluatingRisks: "स्वास्थ्य जोखिम विश्लेषण...",
    reviewTitle: "प्राप्त सामग्री की जांच करें",
    exportPdf: "पीडीएफ निर्यात करें",
    gotIt: "समझ गया",
    edit: "संशोधित करें"
  },
  bn: {
    scanButton: "লেবেল স্ক্যান করুন",
    historyTab: "ইতিহাস",
    settingsTab: "সেটিংস",
    detectingArea: "লেবেল অংশ সনাক্ত করা হচ্ছে...",
    readingIngredients: "উপাদান পড়া হচ্ছে...",
    evaluatingRisks: "স্বাস্থ্য ঝুঁকি মূল্যায়ন...",
    reviewTitle: "উপাদান পরীক্ষা করুন",
    exportPdf: "পিডিএফ ডাউনলোড করুন",
    gotIt: "বুঝেছি",
    edit: "সম্পাদনা"
  },
  te: {
    scanButton: "లేబుల్ స్కాన్ చేయండి",
    historyTab: "చరిత్ర",
    settingsTab: "సెట్టింగ్‌లు",
    detectingArea: "లేబుల్ గుర్తించబడుతోంది...",
    readingIngredients: "పదార్థాలు చదవబడుతున్నాయి...",
    evaluatingRisks: "ఆరోగ్య ప్రమాదాల లెక్కింపు...",
    reviewTitle: "పదార్థాల సమీక్ష",
    exportPdf: "పిడిఎఫ్ డౌన్‌లోడ్",
    gotIt: "అర్థమైంది",
    edit: "సవరించు"
  },
  ta: {
    scanButton: "லேபிளை ஸ்கேன் செய்க",
    historyTab: "வரலாறு",
    settingsTab: "அமைப்புகள்",
    detectingArea: "லேபிள் பகுதி கண்டறியப்படுகிறது...",
    readingIngredients: "பொருட்கள் படிக்கப்படுகின்றன...",
    evaluatingRisks: "ஆரோக்கிய ஆபத்து பகுப்பாய்வு...",
    reviewTitle: "பொருட்களை மதிப்பாய்வு செய்",
    exportPdf: "பிடிஎஃப் பதிவிறக்கு",
    gotIt: "புரிந்தது",
    edit: "திருத்து"
  },
  mr: {
    scanButton: "लेबल स्कॅन करा",
    historyTab: "इतिहास",
    settingsTab: "सेटिंग्ज",
    detectingArea: "लेबल क्षेत्र शोधत आहे...",
    readingIngredients: "घटक वाचत आहे...",
    evaluatingRisks: "आरोग्य धोका मूल्यमापन...",
    reviewTitle: "घटकांची तपासणी करा",
    exportPdf: "पीडीएफ डाउनलोड करा",
    gotIt: "समजले",
    edit: "संपादित करा"
  },
  gu: {
    scanButton: "લેબલ સ્કેન કરો",
    historyTab: "ઇતિહાસ",
    settingsTab: "સેટિંગ્સ",
    detectingArea: "લેબલ વિસ્તાર ઓળખી રહ્યું છે...",
    readingIngredients: "ઘટકો વાંચી રહ્યા છીએ...",
    evaluatingRisks: "સ્વાસ્થ્ય જોખમ મૂલ્યાંકન...",
    reviewTitle: "ઘટકોની સમીક્ષા કરો",
    exportPdf: "પીડીએફ ડાઉનલોડ",
    gotIt: "સમજાયું",
    edit: "ફેરફાર કરો"
  }
};

export function getAppUiStrings(langCode: string): AppUiDictionary {
  if (APP_UI_STRINGS[langCode]) {
    return APP_UI_STRINGS[langCode];
  }
  return APP_UI_STRINGS['en'];
}

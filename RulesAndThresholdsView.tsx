import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  AlertCircle, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  Scale, 
  Sparkles, 
  Search, 
  Activity, 
  Cpu, 
  Zap, 
  Info,
  ExternalLink,
  Layers,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';

interface RulesAndThresholdsViewProps {
  onClose: () => void;
}

export const RulesAndThresholdsView: React.FC<RulesAndThresholdsViewProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'scale' | 'penalties' | 'matrix'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const gradeThresholds = [
    {
      grade: 'A',
      range: '80 – 100',
      status: 'Pristine Profile • Zero hazardous chemicals',
      color: 'emerald',
      bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-500 text-white',
      desc: 'Whole, natural ingredients with zero toxic chemicals. Certified minimally processed.',
      rules: [
        'Zero high-risk chemical preservatives (BHA, BHT, Nitrates)',
        'Zero synthetic petroleum food dyes (Red 40, Yellow 5)',
        'Zero artificial sweeteners or endocrine disruptors',
        'Low sodium (< 140 mg per serving)',
        'Low added sugar (< 5 g per serving)',
        'Wholesome healthy fats (Extra virgin olive, avocado, coconut)'
      ],
      lifeImpact: 'Supports gut barrier integrity, mitochondrial energy production, and metabolic longevity.'
    },
    {
      grade: 'B',
      range: '60 – 79',
      status: 'Favorable Profile • Minor processing / low additive load',
      color: 'lime',
      bgClass: 'bg-lime-500/10 border-lime-500/30 text-lime-700 dark:text-lime-400',
      badgeClass: 'bg-lime-500 text-white',
      desc: 'Nutritionally sound with minor culinary processing or safe natural additives.',
      rules: [
        'Contains only safe natural preservatives (tocopherols, citric acid)',
        'No known carcinogens or banned chemical agents',
        'Moderate sodium (140 – 400 mg per serving)',
        'Moderate natural or added sugars (5 – 10 g per serving)',
        'Acceptable for regular everyday consumption'
      ],
      lifeImpact: 'Safe everyday baseline with conscious portion management.'
    },
    {
      grade: 'C',
      range: '40 – 59',
      status: 'Moderate Profile • Moderate synthetic additives / caution',
      color: 'amber',
      bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-500 text-white',
      desc: 'Contains inflammatory industrial oils, refined starches, or excessive sodium/sugar.',
      rules: [
        'Contains oxidized industrial seed oils (canola, soybean, corn oil)',
        'Added sugars exceeding 10 – 20 g per serving',
        'Excessive sodium (> 480 mg per serving)',
        'Mild synthetic stabilizers or flavor enhancers',
        'Frequent consumption promotes low-grade chronic inflammation'
      ],
      lifeImpact: 'May trigger glucose volatility, sluggish digestion, and arterial stress if consumed daily.'
    },
    {
      grade: 'D',
      range: '20 – 39',
      status: 'Cautionary Profile • High processing / multiple risky agents',
      color: 'orange',
      bgClass: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400',
      badgeClass: 'bg-orange-500 text-white',
      desc: 'Formulated with ultra-processed ingredients, elevated sodium/sugars, and multiple synthetic agents.',
      rules: [
        'Flagged with multiple synthetic preservatives or additives',
        'Artificial sweeteners or flavor enhancers present',
        'High sodium and added refined sugar content',
        'Industrial ultra-processing markers present',
        'Regular consumption discouraged'
      ],
      lifeImpact: 'Correlates with metabolic dysfunction, insulin spikes, and systemic inflammation.'
    },
    {
      grade: 'F',
      range: '0 – 19',
      status: 'Critical Hazard • Heavily ultra-processed / dangerous toxins',
      color: 'red',
      bgClass: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
      badgeClass: 'bg-red-500 text-white',
      desc: 'Immediate warning. Formulated with known chemical toxins, carcinogens, or trans fats.',
      rules: [
        'Flagged with confirmed endocrine disruptors or suspected carcinogens',
        'Contains neuro-disruptive artificial sweeteners (aspartame, sucralose)',
        'Contains petroleum-based food colorings (Red 40, Yellow 6)',
        'Contains partially hydrogenated oils (trans fats) or High Fructose Corn Syrup',
        'Severe chemical load triggers strict safety warnings'
      ],
      lifeImpact: 'High clinical correlation with intestinal barrier degradation, insulin resistance, and cellular damage.'
    }
  ];

  const penaltyRules = [
    {
      title: 'Carcinogenic Preservatives',
      penalty: '-25 to -35 pts',
      severity: 'Critical',
      icon: ShieldAlert,
      compounds: ['BHA (E320)', 'BHT (E321)', 'Potassium Bromate (E924)', 'Sodium Nitrite/Nitrate (E250/251)', 'Propyl Gallate (E310)'],
      threshold: 'Any detected concentration triggers maximum deduction & hazard flag',
      rationale: 'Classified by international toxicological bodies (IARC, EFSA) as suspected carcinogens and endocrine disruptors linked to organ toxicity.'
    },
    {
      title: 'Petroleum Synthetic Dyes',
      penalty: '-20 to -30 pts',
      severity: 'High',
      icon: Flame,
      compounds: ['Red 40 (Allura Red)', 'Yellow 5 (Tartrazine)', 'Yellow 6 (Sunset Yellow)', 'Blue 1 (Brilliant Blue)'],
      threshold: 'Deducted per synthetic dye found in ingredient manifest',
      rationale: 'Derived from coal tar/petroleum; associated with neurobehavioral disruption in children, allergic sensitization, and genotoxic benzidine contamination.'
    },
    {
      title: 'Artificial Sweeteners',
      penalty: '-15 to -25 pts',
      severity: 'High',
      icon: Zap,
      compounds: ['Aspartame (E951)', 'Sucralose (E955)', 'Acesulfame Potassium (Ace-K, E950)', 'Saccharin (E954)'],
      threshold: 'Applied when non-nutritive chemical sweeteners replace natural carbohydrates',
      rationale: 'Depletes beneficial gut commensals (Akkermansia muciniphila), blunts GLP-1 and insulin sensitivity, and promotes metabolic dysregulation.'
    },
    {
      title: 'Trans Fats & Oxidized Seed Oils',
      penalty: '-15 to -25 pts',
      severity: 'Critical',
      icon: Scale,
      compounds: ['Partially Hydrogenated Oils', 'Refined Palm Olein', 'Oxidized Canola/Soybean/Cottonseed Oils'],
      threshold: 'Partial hydrogenation triggers automatic Grade D override (-25 pts); refined seed oils (-10 to -15 pts)',
      rationale: 'High omega-6 linoleic acid oxidation products (OXLAMs) foster cardiovascular endothelial inflammation and cellular lipid peroxidation.'
    },
    {
      title: 'Metabolic Sugar Spikes & HFCS',
      penalty: '-10 to -20 pts',
      severity: 'Moderate',
      icon: Activity,
      compounds: ['High-Fructose Corn Syrup (HFCS 55/42)', 'Added Cane Sugars > 15g', 'Dextrose/Maltodextrin spikes'],
      threshold: '> 15g added sugar (-10 pts); > 25g added sugar or HFCS (-20 pts)',
      rationale: 'Direct driver of rapid hepatic de novo lipogenesis, non-alcoholic fatty liver disease (NAFLD), and advanced glycation end-products (AGEs).'
    },
    {
      title: 'Gut Barrier Disruptors (Emulsifiers)',
      penalty: '-10 to -15 pts',
      severity: 'Moderate',
      icon: Layers,
      compounds: ['Polysorbate 80', 'Carboxymethylcellulose (CMC)', 'Carrageenan (E407)'],
      threshold: 'Flagged when synthetic surfactants are used to artificially stabilize industrial textures',
      rationale: 'Dissolves the protective mucosal lining of the gastrointestinal tract, enabling bacterial translocation and systemic low-grade inflammation.'
    }
  ];

  const hazardMatrix = [
    { name: 'Potassium Bromate', type: 'Dough Conditioner', hazard: 'Critical', penalty: '-35 pts', reason: 'Banned in EU & Canada; classified as 2B probable human carcinogen.' },
    { name: 'BHA & BHT', type: 'Synthetic Antioxidant', hazard: 'Critical', penalty: '-30 pts', reason: 'Endocrine disruptor linked to thyroid and reproductive gland interference.' },
    { name: 'Sodium Nitrite / Nitrate', type: 'Curing Preservative', hazard: 'Critical', penalty: '-25 pts', reason: 'Forms carcinogenic nitrosamines in the stomach under acidic digestion.' },
    { name: 'Partially Hydrogenated Oil', type: 'Industrial Fat (Trans Fat)', hazard: 'Critical', penalty: '-25 pts', reason: 'Elevates LDL, destroys HDL, and promotes systemic vascular calcification.' },
    { name: 'Red 40 & Yellow 5', type: 'Artificial Coal-Tar Dye', hazard: 'High', penalty: '-20 pts', reason: 'Immune hyper-reactivity, ADHD exacerbation, and genotoxic impurities.' },
    { name: 'Sucralose & Aspartame', type: 'Non-Nutritive Sweetener', hazard: 'High', penalty: '-20 pts', reason: 'Kills protective gut microbiome colonies and impairs insulin signaling.' },
    { name: 'High-Fructose Corn Syrup', type: 'Refined Sweetener', hazard: 'High', penalty: '-20 pts', reason: 'Bypasses normal glycolysis, causing direct hepatic visceral fat deposition.' },
    { name: 'Refined Soybean / Canola Oil', type: 'Industrial Seed Oil', hazard: 'Moderate', penalty: '-12 pts', reason: 'High omega-6 to omega-3 ratio drives systemic eicosanoid inflammation.' },
    { name: 'Polysorbate 80 & CMC', type: 'Synthetic Emulsifier', hazard: 'Moderate', penalty: '-10 pts', reason: 'Degrades intestinal epithelial mucus layer ("leaky gut" biomarker).' },
    { name: 'Natural Tocopherols (Vit E)', type: 'Natural Preservative', hazard: 'Clean', penalty: '0 pts', reason: 'Safe, wholesome antioxidant that protects oil stability naturally.' },
    { name: 'Extra Virgin Olive Oil', type: 'Healthy Fat', hazard: 'Clean', penalty: '0 pts', reason: 'High in oleic acid and polyphenols; protects cardiovascular health.' }
  ];

  const filteredMatrix = hazardMatrix.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hazard.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      key="rules-thresholds-overlay"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%', transition: { duration: 0.18, ease: [0.32, 0, 0.67, 0] } }}
      transition={{ type: 'spring', damping: 32, stiffness: 380, mass: 0.65 }}
      style={{ willChange: 'transform' }}
      className="fixed inset-0 z-[110] bg-slate-50 dark:bg-dark-bg flex flex-col overflow-hidden text-gray-900 dark:text-gray-100 transform-gpu"
    >
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Return"
          >
            <ChevronDown className="w-6 h-6 rotate-90 text-gray-700 dark:text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-healthy-green uppercase tracking-widest bg-healthy-green/10 dark:bg-healthy-green/20 px-2 py-0.5 rounded-full">
                Clinical AI Engine
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                v3.6 Standards
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
              What rule we use to make your life improved
            </h2>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
        
        {/* Life Improvement Mission Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0E14] via-[#151921] to-[#0B0E14] border border-[#222832] text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-healthy-green/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-healthy-green/20 backdrop-blur-md rounded-2xl">
                <Heart className="w-6 h-6 text-healthy-green" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Our Life-Improvement Promise
              </h3>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Industrial food engineering often prioritizes infinite shelf life and corporate profits over human biology—masking carcinogenic preservatives, neurotoxic sweeteners, and inflammatory seed oils behind obscure chemical codes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-healthy-green uppercase tracking-wider mb-1">1. Gut Immunity</p>
                <p className="text-xs text-white/90 leading-snug">Eliminate synthetic emulsifiers that strip protective intestinal mucus.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-healthy-green uppercase tracking-wider mb-1">2. Cellular Health</p>
                <p className="text-xs text-white/90 leading-snug">Identify genotoxic synthetic dyes and suspected hormonal disruptors.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
                <p className="text-xs font-bold text-healthy-green uppercase tracking-wider mb-1">3. Clean Metabolism</p>
                <p className="text-xs text-white/90 leading-snug">Flag oxidized trans fats and rapid-fructose liver overloads before you eat.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'all', label: 'All Standards' },
            { id: 'scale', label: '100-Point Score Scale' },
            { id: 'penalties', label: 'AI Penalty Rules' },
            { id: 'matrix', label: 'Chemical Hazard Matrix' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                activeCategory === tab.id
                  ? 'bg-healthy-green text-white shadow-md shadow-healthy-green/25'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-border hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: 100-Point Score Scale (Grades A-D) */}
        {(activeCategory === 'all' || activeCategory === 'scale') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-healthy-green" />
                  The 100-Point Scoring Hierarchy
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  How PureScan categorizes every food product from pristine nutrition to toxic hazards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gradeThresholds.map((t) => (
                <div 
                  key={t.grade}
                  className="bg-white dark:bg-dark-card rounded-3xl p-5 border border-gray-200/80 dark:border-dark-border shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl font-black text-2xl flex items-center justify-center shadow-md ${t.badgeClass}`}>
                        {t.grade}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                            Score: {t.range}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                          {t.status}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t.desc}
                  </p>

                  <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-dark-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Scoring Criteria & Thresholds</p>
                    <ul className="space-y-1.5">
                      {t.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-healthy-green shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60">
                    <p className="text-[11px] font-bold text-gray-900 dark:text-gray-200">
                      🧬 Life Impact: <span className="font-normal text-gray-600 dark:text-gray-400">{t.lifeImpact}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: AI Penalty Rules & Deductions */}
        {(activeCategory === 'all' || activeCategory === 'penalties') && (
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-critical-red" />
                The 6 AI Penalty Threshold Rules
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Exact point deductions applied dynamically when hazardous ingredients are detected.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {penaltyRules.map((rule, idx) => {
                const IconComponent = rule.icon;
                const isCritical = rule.severity === 'Critical';
                return (
                  <div 
                    key={idx}
                    className={`bg-white dark:bg-dark-card rounded-3xl p-5 border shadow-sm space-y-4 ${
                      isCritical 
                        ? 'border-red-200 dark:border-red-900/40' 
                        : 'border-gray-200/80 dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${
                          isCritical 
                            ? 'bg-red-500/10 text-critical-red' 
                            : 'bg-amber-500/10 text-warning-amber'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isCritical 
                                ? 'bg-critical-red text-white' 
                                : 'bg-warning-amber text-white'
                            }`}>
                              {rule.severity} Risk
                            </span>
                            <span className="font-mono text-xs font-black text-critical-red">
                              {rule.penalty}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                            {rule.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Targeted Compounds & Additives
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {rule.compounds.map((c, i) => (
                          <span 
                            key={i}
                            className="text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-xl"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">Detection Trigger: </span>
                        <span className="text-gray-600 dark:text-gray-400">{rule.threshold}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300">Clinical Rationale: </span>
                        <span className="text-gray-600 dark:text-gray-400">{rule.rationale}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 3: Searchable Chemical Hazard Matrix */}
        {(activeCategory === 'all' || activeCategory === 'matrix') && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-warning-amber" />
                  Clinical Additive & Chemical Hazard Matrix
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Direct look-up of the toxicological database used to evaluate food items.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ingredient or risk..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-xs focus:ring-2 focus:ring-healthy-green/20 focus:border-healthy-green outline-none"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-3xl border border-gray-200/80 dark:border-dark-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-slate-800/70 border-b border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Ingredient / Compound</th>
                      <th className="py-3 px-4">Functional Category</th>
                      <th className="py-3 px-4">Hazard Level</th>
                      <th className="py-3 px-4">Score Impact</th>
                      <th className="py-3 px-4">Clinical Finding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {filteredMatrix.map((item, index) => {
                      const isCrit = item.hazard === 'Critical';
                      const isHigh = item.hazard === 'High';
                      const isMod = item.hazard === 'Moderate';
                      return (
                        <tr key={index} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                            {item.type}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              isCrit ? 'bg-red-500/10 text-critical-red border border-red-500/30' :
                              isHigh ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30' :
                              isMod ? 'bg-amber-500/15 text-warning-amber border border-amber-500/30' :
                              'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {item.hazard}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-700 dark:text-gray-300">
                            {item.penalty}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                            {item.reason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredMatrix.length === 0 && (
                <div className="py-10 text-center text-xs text-gray-500">
                  No ingredients match "{searchQuery}".
                </div>
              )}
            </div>
          </section>
        )}

        {/* Scientific Independence & Standards Note */}
        <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-gray-900 dark:text-white">
            <ShieldCheck className="w-5 h-5 shrink-0 text-healthy-green" />
            <h4 className="font-extrabold text-sm">Strict Algorithmic Independence</h4>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            PureScan accepts zero advertising sponsorships, corporate partnerships, or food manufacturer funding. Our algorithmic thresholds are derived strictly from peer-reviewed clinical research published by the World Health Organization (WHO), International Agency for Research on Cancer (IARC), European Food Safety Authority (EFSA), and the NOVA Ultra-Processing Framework.
          </p>
        </div>

      </div>
    </motion.div>
  );
};

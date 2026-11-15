export type JurisdictionStatusLevel = 'banned' | 'warning' | 'restricted' | 'monitored';

export interface JurisdictionRuling {
  agency: 'FSSAI (India)' | 'EU EFSA' | 'US FDA';
  flag: string;
  level: JurisdictionStatusLevel;
  badge: string;
  detail: string;
  shortReason: string;
  law: string;
  lawRef: string;
}

export interface AdditiveRegulatoryInfo {
  matchedRuleName: string;
  code?: string;
  shortReason: string;
  primaryLaw: string;
  rulings: JurisdictionRuling[];
  regulatorySummary: string;
}

export const REGULATORY_DISCRIMINATION_DISCLAIMER = 
  "⚖️ Disclaimer & Non-Discrimination Notice: Regulatory classifications reflect published statutory standards of official food authorities; this automated audit does not imply unlawful manufacture or commercial discrimination.";

interface RegulatoryRule {
  id: string;
  displayName: string;
  code?: string;
  shortReason: string;
  primaryLaw: string;
  keywords: string[];
  rulings: JurisdictionRuling[];
  summary: string;
}

const REGULATORY_RULES: RegulatoryRule[] = [
  {
    id: 'titanium-dioxide',
    displayName: 'Titanium Dioxide',
    code: 'E171 / INS 171',
    shortReason: 'Prohibited due to potential genotoxicity (DNA damage) and nanoparticle cellular accumulation.',
    primaryLaw: 'Regulation (EU) 2022/63 & FSS (Food Products Standards) Reg. 2011',
    keywords: ['titanium dioxide', 'e171', 'ins 171', 'ci 77891'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'banned',
        badge: 'BANNED IN EU',
        shortReason: 'Genotoxicity & DNA strand breaks; cannot be considered safe as a food additive.',
        law: 'Commission Regulation (EU) 2022/63 amending Annexes II & III to Reg (EC) No 1333/2008',
        lawRef: 'Regulation (EU) 2022/63',
        detail: 'Banned as a food additive across the European Union since 2022 due to potential genotoxicity (DNA damage) concerns.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'restricted',
        badge: 'UNDER REVIEW (<1%)',
        shortReason: 'Restricted to maximum 1% by food weight; subject to active citizen bans & review.',
        law: 'FDA 21 CFR § 73.575 (Color Additives Exempt from Certification)',
        lawRef: '21 CFR § 73.575',
        detail: 'Permitted up to 1% by weight in the US, though subject to active safety petitions and state-level phase-out reviews.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'restricted',
        badge: 'RESTRICTED GMP',
        shortReason: 'Restricted exclusively to select designated items under strict GMP limits.',
        law: 'Food Safety and Standards (Food Products Standards and Food Additives) Regulations 2011, Item 13.0',
        lawRef: 'FSSAI Additives Reg 2011',
        detail: 'Permitted only in select food categories (chewing gum, confectionery coatings) under strict GMP limits.'
      }
    ],
    summary: 'Banned in the European Union (EFSA) over nanoparticle DNA-damage concerns.'
  },
  {
    id: 'potassium-bromate',
    displayName: 'Potassium Bromate',
    code: 'E924 / INS 924',
    shortReason: 'Classified as a Group 2B probable human carcinogen with renal and thyroid toxicity.',
    primaryLaw: 'FSSAI Notification F.No. 1-94/FSSAI/SP (2016) & Cal. Health & Safety Code § 114377',
    keywords: ['potassium bromate', 'bromate', 'e924', 'ins 924', 'bromated flour'],
    rulings: [
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'banned',
        badge: 'BANNED IN INDIA',
        shortReason: 'Strictly prohibited across all bakery products as a dangerous human carcinogen.',
        law: 'FSSAI Notification F.No. 1-94/FSSAI/SP (2016) removing potassium bromate from permitted list',
        lawRef: 'FSSAI Gaz. Notif. 2016',
        detail: 'Strictly banned by FSSAI in India since 2016 as a Group 2B probable human carcinogen.'
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'banned',
        badge: 'BANNED IN EU',
        shortReason: 'Prohibited across 27 EU member states as an unauthorized carcinogenic flour improver.',
        law: 'Council Directive 89/107/EEC & Regulation (EC) No 1333/2008 Annex II',
        lawRef: 'Reg (EC) No 1333/2008',
        detail: 'Prohibited across all European Union member states as a carcinogenic flour improver.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'warning',
        badge: 'CA BANNED (2027)',
        shortReason: 'Outlawed in California by statute; FDA requests voluntary manufacturer discontinuation.',
        law: 'California Food Safety Act (AB 418 / Cal. Health & Safety Code § 114377)',
        lawRef: 'Cal. AB 418',
        detail: 'Banned under the California Food Safety Act; FDA urges voluntary phase-out by manufacturers.'
      }
    ],
    summary: 'Banned in India (FSSAI), the EU (EFSA), UK, and California as a probable human carcinogen.'
  },
  {
    id: 'red-3',
    displayName: 'Red 3 (Erythrosine)',
    code: 'E127 / INS 127',
    shortReason: 'Induces thyroid follicular cell tumors in animal studies; neurological sensitivity in children.',
    primaryLaw: 'FD&C Act Sec. 706 (Delaney Clause 21 U.S.C. 379e) & EU Regulation 1129/2011',
    keywords: ['red 3', 'red no. 3', 'fd&c red 3', 'erythrosine', 'e127', 'ins 127'],
    rulings: [
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'banned',
        badge: 'FDA BANNED (DELANEY)',
        shortReason: 'Subject to Delaney Clause cancer ban and California Food Safety Act prohibition.',
        law: 'Federal Food, Drug, and Cosmetic Act Section 706 (21 U.S.C. 379e) & Cal. Health & Safety Code § 114377',
        lawRef: 'Delaney Clause / AB 418',
        detail: 'Revoked by the US FDA and banned under the California Food Safety Act due to thyroid tumor findings.'
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'banned',
        badge: 'SEVERELY RESTRICTED',
        shortReason: 'Prohibited across virtually all processed food categories except maraschino cherries.',
        law: 'Commission Regulation (EU) No 1129/2011 amending Annex II to Regulation (EC) No 1333/2008',
        lawRef: 'Reg (EU) 1129/2011',
        detail: 'Banned in general food items across the EU except candied cocktail cherries.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'restricted',
        badge: 'STRICT 100 PPM CAP',
        shortReason: 'Restricted under a mandatory 100 mg/kg threshold with statutory synthetic color declaration.',
        law: 'FSS (Food Products Standards and Food Additives) Regulations 2011, Regulation 3.2.1',
        lawRef: 'FSSAI Reg 3.2.1',
        detail: 'Subject to strict maximum synthetic colour limits and mandatory label declaration.'
      }
    ],
    summary: 'Revoked by US FDA and severely restricted in the EU due to thyroid carcinogenicity studies.'
  },
  {
    id: 'southampton-dyes',
    displayName: 'Synthetic Azo Dyes (Red 40 / Yellow 5 / Yellow 6)',
    code: 'E102 / E110 / E129',
    shortReason: 'Proven correlation with childhood hyperactivity, attention deficits, and behavioral disruption.',
    primaryLaw: 'Regulation (EC) No 1333/2008 Article 24 & FSSAI Packaging & Labelling Reg 2.4.4',
    keywords: [
      'red 40', 'allura red', 'e129', 'ins 129',
      'yellow 5', 'tartrazine', 'e102', 'ins 102',
      'yellow 6', 'sunset yellow', 'e110', 'ins 110',
      'carmoisine', 'e122', 'ins 122',
      'ponceau 4r', 'e124', 'ins 124',
      'quinoline yellow', 'e104', 'ins 104',
      'blue 1', 'brilliant blue', 'e133', 'ins 133',
      'artificial color', 'synthetic food colour'
    ],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'warning',
        badge: 'MANDATORY CHILD WARNING',
        shortReason: 'Statutory mandate requiring conspicuous child hyperactivity warning box on packaging.',
        law: 'Regulation (EC) No 1333/2008 Article 24 & Annex V (Southampton Dyes Directive)',
        lawRef: 'Reg (EC) 1333/2008 Art 24',
        detail: 'Requires mandatory EU warning label: "May have an adverse effect on activity and attention in children."'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'warning',
        badge: 'DECLARED SYNTHETIC COLOUR',
        shortReason: 'Mandatory prominent capital letter label declaration: "CONTAINS PERMITTED SYNTHETIC FOOD COLOUR(S)".',
        law: 'FSSAI Packaging and Labelling Regulations 2011, Regulation 2.4.4(24)',
        lawRef: 'FSSAI Reg 2.4.4',
        detail: 'Must carry mandatory "CONTAINS PERMITTED SYNTHETIC FOOD COLOUR(S)" box and stay below 100 ppm.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'restricted',
        badge: 'CA SCHOOL BAN / CERTIFIED',
        shortReason: 'Mandates chemical batch certification by FDA; prohibited in California public school nutrition.',
        law: 'FDA 21 CFR Part 74 & California Assembly Bill 2316 (School Food Safety Act)',
        lawRef: '21 CFR Part 74 / AB 2316',
        detail: 'Requires batch certification by FDA; banned in California public school meals.'
      }
    ],
    summary: 'Requires a mandatory child hyperactivity warning label across the European Union (EFSA).'
  },
  {
    id: 'bvo',
    displayName: 'Brominated Vegetable Oil (BVO)',
    code: 'E443',
    shortReason: 'Accumulates toxic bromine in human tissues, provoking thyroid gland and neurological toxicity.',
    primaryLaw: 'FDA Final Rule 89 FR 55041 (2024) & FSSAI Prohibition Reg 2.3.15',
    keywords: ['brominated vegetable oil', 'bvo', 'e443'],
    rulings: [
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'banned',
        badge: 'BANNED BY US FDA',
        shortReason: 'Authorization revoked after bioaccumulation and organ pathology studies.',
        law: 'US FDA Final Rule 89 FR 55041 (Revocation of Authorization for BVO in Food, 21 CFR § 180.30)',
        lawRef: '89 FR 55041 / 21 CFR § 180.30',
        detail: 'Officially banned by the US FDA (2024) due to bromine accumulation and thyroid toxicity.'
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'banned',
        badge: 'BANNED IN EU',
        shortReason: 'Completely unapproved and prohibited as a food additive in EU member nations.',
        law: 'Regulation (EC) No 1333/2008 Annex II (Negative list of unauthorized additives)',
        lawRef: 'Reg (EC) 1333/2008',
        detail: 'Prohibited as a food emulsifier/clouding agent across the European Union.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'banned',
        badge: 'BANNED IN INDIA',
        shortReason: 'Prohibited across commercial beverages and soft drinks under statutory standards.',
        law: 'FSSAI Food Safety and Standards (Prohibition and Restrictions on Sales) Regulations 2011, Reg 2.3.15',
        lawRef: 'FSSAI Reg 2.3.15',
        detail: 'Prohibited in soft drinks and beverages under FSSAI food safety standards.'
      }
    ],
    summary: 'Banned globally across India (FSSAI), the US (FDA), and the European Union (EFSA).'
  },
  {
    id: 'azodicarbonamide',
    displayName: 'Azodicarbonamide (ADA)',
    code: 'E927a / INS 927a',
    shortReason: 'Thermal degradation generates semicarbazide (SEM) and ethyl carbamate (known mutagens/carcinogens).',
    primaryLaw: 'Directive 2004/1/EC & FSSAI Bakery Standards',
    keywords: ['azodicarbonamide', 'e927a', 'ins 927a'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'banned',
        badge: 'BANNED IN EU',
        shortReason: 'Banned due to toxic breakdown products (urethane/semicarbazide) and occupational asthma.',
        law: 'Commission Directive 2004/1/EC & Regulation (EC) No 1333/2008',
        lawRef: 'Directive 2004/1/EC',
        detail: 'Banned in the European Union as a dough conditioner due to respiratory sensitization and urethane byproducts.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'banned',
        badge: 'NOT PERMITTED',
        shortReason: 'Excluded from authorized flour treatment and dough conditioner lists.',
        law: 'FSS (Food Products Standards and Food Additives) Regulations 2011',
        lawRef: 'FSSAI Additive Rules',
        detail: 'Not permitted as a flour treatment agent in Indian bakery standards.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'restricted',
        badge: 'LIMITED (<45 PPM)',
        shortReason: 'Permitted up to 45 ppm ceiling in enriched flour; phased out by consumer demand.',
        law: 'FDA 21 CFR § 172.806 (Azodicarbonamide in cereal flours)',
        lawRef: '21 CFR § 172.806',
        detail: 'Permitted up to 45 ppm in bread flour in the US, though phased out by major chains.'
      }
    ],
    summary: 'Banned in the European Union (EFSA) and Australia; restricted in the US.'
  },
  {
    id: 'bha-bht',
    displayName: 'BHA / BHT (Synthetic Antioxidants)',
    code: 'E320 / E321',
    shortReason: 'Endocrine disruption concerns and listed as a reasonably anticipated human carcinogen.',
    primaryLaw: 'California Proposition 65 & EU Infant Nutrition Directives',
    keywords: ['butylated hydroxyanisole', 'butylated hydroxytoluene', 'bha', 'bht', 'e320', 'e321', 'ins 320', 'ins 321', 'tbhq', 'e319', 'ins 319'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'STRICT EU ADI CAP',
        shortReason: 'Strict acceptable daily intake limits; barred from all infant and young child foods.',
        law: 'EFSA ANS Panel Scientific Re-evaluation (EFSA Journal 2011;9(10):2418) & Reg (EC) No 1333/2008',
        lawRef: 'EFSA Journal 2011;9(10)',
        detail: 'Restricted in the EU and banned in infant/young child foods due to endocrine disruption concerns.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'warning',
        badge: 'CA PROP 65 LISTED',
        shortReason: 'Statutorily identified under Proposition 65 as a chemical known to cause cancer.',
        law: 'Safe Drinking Water and Toxic Enforcement Act of 1986 (California Prop 65) & 21 CFR § 182.3169',
        lawRef: 'Cal. Prop 65 / 21 CFR § 182',
        detail: 'BHA is listed under California Proposition 65 as a known carcinogen; NIH classifies as reasonably anticipated carcinogen.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'restricted',
        badge: 'MAX 100-200 PPM',
        shortReason: 'Strictly capped at 0.02% in fats and oils; expressly forbidden in baby foods.',
        law: 'FSS (Food Products Standards and Food Additives) Regulations 2011, Table 1.1',
        lawRef: 'FSSAI Table 1.1',
        detail: 'Strictly capped in fats and oils (max 0.02%); prohibited in infant nutrition.'
      }
    ],
    summary: 'Listed under California Prop 65 (BHA) and barred from infant foods in the EU & India.'
  },
  {
    id: 'trans-fat',
    displayName: 'Partially Hydrogenated Oils / Industrial Trans Fats',
    code: 'PHO / Trans Fat',
    shortReason: 'Drives coronary artery disease, elevated LDL cholesterol, and systemic vascular inflammation.',
    primaryLaw: 'FDA Revocation 80 FR 34650 & FSSAI Trans Fat Regulations 2020',
    keywords: ['partially hydrogenated', 'hydrogenated vegetable oil', 'trans fat', 'vanaspati', 'dalda', 'shortening'],
    rulings: [
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'banned',
        badge: 'GRAS REVOKED (BANNED)',
        shortReason: 'Determined no longer Generally Recognized as Safe (GRAS) due to heart disease deaths.',
        law: 'FDA Final Determination Regarding Partially Hydrogenated Oils (80 FR 34650)',
        lawRef: '80 FR 34650',
        detail: 'US FDA revoked GRAS status for Partially Hydrogenated Oils due to coronary heart disease risk.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'restricted',
        badge: 'CAPPED AT <2%',
        shortReason: 'Statutory mandate limiting industrial trans fatty acids strictly to below 2% of total fat.',
        law: 'FSS (Food Products Standards and Food Additives) Tenth Amendment Regulations, 2020',
        lawRef: 'FSSAI 10th Amendment 2020',
        detail: 'FSSAI mandates industrial trans fatty acids must not exceed 2% by weight of total oils/fats.'
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'STRICT <2% LIMIT',
        shortReason: 'Maximum legal limit of 2g industrial trans fat per 100g fat in food intended for consumers.',
        law: 'Commission Regulation (EU) 2019/649 amending Annex III to Regulation (EC) No 1925/2006',
        lawRef: 'Reg (EU) 2019/649',
        detail: 'Strictly capped at 2g per 100g of fat across the European Union.'
      }
    ],
    summary: 'Partially Hydrogenated Oils are banned by the US FDA and capped under <2% by FSSAI & EU EFSA.'
  },
  {
    id: 'artificial-sweeteners',
    displayName: 'Non-Nutritive Synthetic Sweeteners (Aspartame / Sucralose / Ace-K)',
    code: 'E950 / E951 / E955',
    shortReason: 'WHO IARC Group 2B classification, phenylketonuria hazard, and metabolic disruption in children.',
    primaryLaw: 'FSSAI Packaging Reg 2.4.5 & Regulation (EU) No 1169/2011',
    keywords: ['aspartame', 'sucralose', 'acesulfame', 'ace-k', 'saccharin', 'neotame', 'e950', 'e951', 'e954', 'e955', 'ins 950', 'ins 951', 'ins 955'],
    rulings: [
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'warning',
        badge: 'NOT FOR CHILDREN WARNING',
        shortReason: 'Statutory boxed packaging warning mandated by law: "NOT RECOMMENDED FOR CHILDREN".',
        law: 'FSSAI Packaging and Labelling Regulations 2011, Regulations 2.4.5 (34-39)',
        lawRef: 'FSSAI Reg 2.4.5 (34)',
        detail: 'FSSAI mandates statutory boxed warning: "NOT RECOMMENDED FOR CHILDREN" & "CONTAINS ARTIFICIAL SWEETENER".'
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'warning',
        badge: 'PHENYLALANINE WARNING',
        shortReason: 'Mandatory label statement for genetic PKU patients; WHO IARC Group 2B cancer review.',
        law: 'Regulation (EU) No 1169/2011 Annex III point 2.3 & EFSA Scientific Opinion',
        lawRef: 'Reg (EU) 1169/2011 Annex III',
        detail: 'Aspartame requires mandatory EU phenylketonuria (PKU) warning; WHO IARC classified Aspartame as Group 2B.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'monitored',
        badge: 'ADI MONITORED',
        shortReason: 'Permitted within strict Acceptable Daily Intake (ADI) with mandatory PKU disclosure.',
        law: 'FDA 21 CFR § 172.804 (Aspartame advisory statement)',
        lawRef: '21 CFR § 172.804',
        detail: 'Permitted within Acceptable Daily Intake (ADI) thresholds with mandatory PKU disclosure for Aspartame.'
      }
    ],
    summary: 'Carries a mandatory FSSAI statutory warning in India: "Not Recommended for Children".'
  },
  {
    id: 'sodium-nitrite',
    displayName: 'Sodium Nitrite / Nitrate',
    code: 'E250 / E251',
    shortReason: 'Reacts with amines under heat to form carcinogenic N-nitrosamines; methemoglobinemia risk.',
    primaryLaw: 'Commission Regulation (EU) 2023/2108 & FDA 21 CFR § 172.175',
    keywords: ['sodium nitrite', 'sodium nitrate', 'potassium nitrite', 'e249', 'e250', 'e251', 'ins 250', 'ins 251'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'LOWERED EU LIMITS (2023)',
        shortReason: 'European Commission slashed permitted nitrite thresholds in 2023 due to nitrosamine cancer link.',
        law: 'Commission Regulation (EU) 2023/2108 amending Annex II to Regulation (EC) No 1333/2008',
        lawRef: 'Reg (EU) 2023/2108',
        detail: 'European Commission significantly slashed permitted nitrite levels in 2023 due to carcinogenic nitrosamine formation.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'restricted',
        badge: 'STRICT PPM CAP',
        shortReason: 'Capped at 200 ppm in cured meats with mandatory sodium ascorbate/erythorbate antioxidant pairing.',
        law: 'FDA 21 CFR § 172.175 (Sodium Nitrite in meat curing)',
        lawRef: '21 CFR § 172.175',
        detail: 'Capped at 200 ppm in cured meats due to methemoglobinemia and nitrosamine risks.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'restricted',
        badge: 'CURED MEAT CAP',
        shortReason: 'Restricted strictly to processed meats with rigorous residual chemical limit testing.',
        law: 'FSS (Food Products Standards and Food Additives) Regulations 2011, Table 1.1',
        lawRef: 'FSSAI Additives Table 1.1',
        detail: 'Restricted strictly to processed meat products under residual ppm limits.'
      }
    ],
    summary: 'EU EFSA slashed maximum legal limits in 2023 over carcinogenic nitrosamine risks.'
  },
  {
    id: 'msg',
    displayName: 'Monosodium Glutamate (MSG)',
    code: 'E621 / INS 621',
    shortReason: 'Excitotoxic glutamate spikes, neuro-sensitivities, and banned in infant foods.',
    primaryLaw: 'FSSAI Packaging Reg 2.4.5(18) & EFSA Glutamate ADI 2017',
    keywords: ['monosodium glutamate', 'msg', 'e621', 'ins 621', 'flavour enhancer 621', 'disodium guanylate', 'disodium inosinate', 'e627', 'e631', 'ins 627', 'ins 631'],
    rulings: [
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'warning',
        badge: 'INFANT BAN WARNING',
        shortReason: 'Mandatory statutory package notice: "NOT RECOMMENDED FOR INFANTS BELOW 12 MONTHS".',
        law: 'FSSAI Packaging and Labelling Regulations 2011, Regulation 2.4.5(18)',
        lawRef: 'FSSAI Reg 2.4.5(18)',
        detail: 'FSSAI requires mandatory label notice: "NOT RECOMMENDED FOR INFANTS BELOW 12 MONTHS" and bans MSG in 50+ food categories.'
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'GROUP ADI CAP (30mg/kg)',
        shortReason: 'Established group acceptable daily intake (ADI) cap of 30 mg/kg bw/day to safeguard brain health.',
        law: 'EFSA Panel on Food Additives (EFSA Journal 2017;15(7):4911) & Reg (EC) No 1333/2008',
        lawRef: 'EFSA Journal 2017;15(7)',
        detail: 'EFSA established a strict group ADI of 30 mg/kg bw/day for glutamic acid and glutamates.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'monitored',
        badge: 'MANDATORY DISCLOSURE',
        shortReason: 'Must be explicitly listed by its common chemical name in ingredient declarations.',
        law: 'FDA 21 CFR § 182.1 (Generally Recognized as Safe) & 21 CFR § 101.22',
        lawRef: '21 CFR § 101.22',
        detail: 'Must be explicitly declared by common name when added directly.'
      }
    ],
    summary: 'Requires mandatory FSSAI label warning in India: "Not recommended for infants below 12 months".'
  },
  {
    id: 'sodium-benzoate',
    displayName: 'Sodium Benzoate / Potassium Sorbate',
    code: 'E211 / E202',
    shortReason: 'Combines with Vitamin C (Ascorbic Acid) under heat/light to form carcinogenic Benzene.',
    primaryLaw: 'FDA CFSAN Beverage Survey & EU Propylparaben Ban (Directive 2006/52/EC)',
    keywords: ['sodium benzoate', 'benzoate', 'e211', 'ins 211', 'potassium benzoate', 'e212', 'propylparaben', 'e216'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'BENZENE RISK MONITORED',
        shortReason: 'Propylparaben banned; sodium benzoate monitored for benzene synthesis when paired with ascorbic acid.',
        law: 'European Parliament Directive 2006/52/EC amending Directive 95/2/EC & Reg (EC) No 1333/2008',
        lawRef: 'Directive 2006/52/EC',
        detail: 'Propylparaben (E216) is banned in the EU; Sodium Benzoate (E211) is monitored for benzene formation when combined with Vitamin C.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'restricted',
        badge: '0.1% MAX LIMIT',
        shortReason: 'Capped at 0.1% concentration; FDA continuously surveys soft drinks for benzene contamination.',
        law: 'FDA 21 CFR § 184.1733 (Sodium Benzoate direct food substance)',
        lawRef: '21 CFR § 184.1733',
        detail: 'Capped at 0.1% in beverages; FDA tests soft drinks for carcinogenic benzene when combined with ascorbic acid.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'restricted',
        badge: 'CLASS II PRESERVATIVE',
        shortReason: 'Restricted under Class II chemical preservative standards with stringent category-specific ppm caps.',
        law: 'FSS (Food Products Standards and Food Additives) Regulations 2011, Regulation 3.1.4',
        lawRef: 'FSSAI Reg 3.1.4',
        detail: 'Regulated as a Class II chemical preservative with category-specific ppm limits.'
      }
    ],
    summary: 'Monitored by US FDA & EU EFSA for carcinogenic benzene formation when combined with Vitamin C (Ascorbic Acid).'
  },
  {
    id: 'hfcs-maltodextrin',
    displayName: 'High Fructose Corn Syrup / Maltodextrin / Refined Syrup',
    code: 'HFCS / DE-20',
    shortReason: 'High glycemic index drives rapid insulin resistance, hepatic steatosis, and metabolic syndrome.',
    primaryLaw: 'FSSAI High Fat, Sugar & Salt (HFSS) Guidelines & FDA Added Sugars Rule 21 CFR § 101.9',
    keywords: ['high fructose corn syrup', 'hfcs', 'liquid glucose', 'corn syrup', 'maltodextrin', 'invert sugar syrup'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'ISOGLUCOSE QUOTA HISTORY',
        shortReason: 'Mandatory explicit disclosure as "glucose-fructose syrup" or "fructose-glucose syrup" on packaging.',
        law: 'Regulation (EU) No 1169/2011 Annex VII on Food Information to Consumers',
        lawRef: 'Reg (EU) 1169/2011',
        detail: 'Must be explicitly declared as "glucose-fructose syrup" or "fructose-glucose syrup" on EU packaging.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'monitored',
        badge: 'HIGH HFSS THRESHOLD',
        shortReason: 'Flagged under proposed front-of-pack warning labels for products exceeding sugar thresholds.',
        law: 'FSSAI Draft Food Safety and Standards (Labelling and Display) Regulations',
        lawRef: 'FSSAI HFSS Framework',
        detail: 'Flagged under FSSAI High Fat, Sugar & Salt (HFSS) front-of-pack warning regulations.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'monitored',
        badge: 'ADDED SUGAR CAP (<10% DV)',
        shortReason: 'Mandates prominent "Includes Xg Added Sugars (%DV)" listing on Nutrition Facts labels.',
        law: 'FDA Final Rule 81 FR 33741 (Revision of Nutrition and Supplement Facts Panels, 21 CFR § 101.9)',
        lawRef: '21 CFR § 101.9',
        detail: 'Subject to mandatory "Includes Xg Added Sugars" %DV line on US Nutrition Facts panels.'
      }
    ],
    summary: 'Targeted under FSSAI High-Fat-Sugar-Salt (HFSS) and FDA Added Sugar regulatory alerts.'
  },
  {
    id: 'palm-oil',
    displayName: 'Refined Palm Oil / Palmolein',
    code: '3-MCPD / GE Risk',
    shortReason: 'High thermal refining produces genotoxic Glycidyl Esters (GE) and kidney-toxic 3-MCPD contaminants.',
    primaryLaw: 'Commission Regulation (EU) 2018/290 & FSSAI Labelling Reg 2011',
    keywords: ['palm oil', 'palmolein', 'palm kernel oil', 'edible vegetable oil (palm)', 'fractionated palm'],
    rulings: [
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: 'restricted',
        badge: 'STRICT 3-MCPD / GE CAP',
        shortReason: 'Enforces statutory maximum legal caps on Glycidyl Esters and 3-MCPD process contaminants.',
        law: 'Commission Regulation (EU) 2018/290 establishing maximum levels for glycidyl fatty acid esters in vegetable oils',
        lawRef: 'Reg (EU) 2018/290',
        detail: 'EU enforces strict legal maximums on Glycidyl Esters (GE) and 3-MCPD process contaminants formed in refined palm oil.'
      },
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: 'monitored',
        badge: 'SATURATED FAT DISCLOSURE',
        shortReason: 'Mandatory declaration of exact botanical source ("Palmolein / Palm Oil") and total saturated fat.',
        law: 'FSSAI Packaging and Labelling Regulations 2011, Regulation 2.4.2(1)',
        lawRef: 'FSSAI Reg 2.4.2',
        detail: 'Requires specific botanical source declaration ("Palmolein / Palm Oil") and saturated fat reporting.'
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: 'monitored',
        badge: 'SATURATED FAT ALERT',
        shortReason: 'Subject to saturated fat %DV disclosure and CFSAN monitoring for process contaminants.',
        law: 'FDA CFSAN Chemical Contaminants Guidance & 21 CFR § 101.9',
        lawRef: '21 CFR § 101.9 / CFSAN',
        detail: 'Monitored for high palmitic saturated fat content and process ester contaminants.'
      }
    ],
    summary: 'Strictly regulated in the European Union (EFSA) for 3-MCPD and Glycidyl Ester (GE) heat-processing contaminants.'
  }
];

export function getAdditiveRegulatoryStatus(
  ingredientName: string,
  description: string = ''
): AdditiveRegulatoryInfo | null {
  const haystack = `${ingredientName} ${description}`.toLowerCase();

  for (const rule of REGULATORY_RULES) {
    if (rule.keywords.some(kw => haystack.includes(kw))) {
      return {
        matchedRuleName: rule.displayName,
        code: rule.code,
        shortReason: rule.shortReason,
        primaryLaw: rule.primaryLaw,
        rulings: rule.rulings,
        regulatorySummary: rule.summary
      };
    }
  }

  return null;
}

export function createFallbackRegulatoryInfo(
  ingredientName: string,
  description: string = '',
  riskLevel: 'high' | 'medium' | 'low' = 'medium'
): AdditiveRegulatoryInfo {
  const isHigh = riskLevel === 'high';
  const shortReason = isHigh
    ? `Identified as a high-concern chemical additive with documented industrial processing risks.`
    : `Identified as a food additive subject to standard regulatory compliance and usage restrictions.`;

  return {
    matchedRuleName: ingredientName,
    code: 'STATUTORY AUDIT',
    shortReason,
    primaryLaw: 'Food Safety and Standards Act (2006) & Regulation (EC) No 1333/2008',
    regulatorySummary: `Subject to statutory purity criteria and authorized maximum limits across jurisdictions.`,
    rulings: [
      {
        agency: 'FSSAI (India)',
        flag: '🇮🇳',
        level: isHigh ? 'warning' : 'restricted',
        badge: isHigh ? 'FSSAI CAUTION' : 'FSSAI MONITORED',
        shortReason: isHigh ? 'Exceeds standard safe baseline for everyday staple products.' : 'Requires compliance with standard Indian additive schedules.',
        law: 'Food Safety and Standards Act 2006 & Additive Regulations 2011',
        lawRef: 'FSS Act Sec 16',
        detail: `${ingredientName} must adhere to statutory Good Manufacturing Practice (GMP) or designated ppm thresholds under Indian law.`
      },
      {
        agency: 'EU EFSA',
        flag: '🇪🇺',
        level: isHigh ? 'warning' : 'monitored',
        badge: isHigh ? 'EFSA RESTRICTED' : 'EFSA AUTHORIZED',
        shortReason: isHigh ? 'Monitored under European precautionary food safety principles.' : 'Permitted under standard European Community purity criteria.',
        law: 'Regulation (EC) No 1333/2008 of the European Parliament and of the Council on Food Additives',
        lawRef: 'Reg (EC) 1333/2008',
        detail: `Regulated under European Union safety schedules with Acceptable Daily Intake (ADI) limitations.`
      },
      {
        agency: 'US FDA',
        flag: '🇺🇸',
        level: isHigh ? 'warning' : 'monitored',
        badge: isHigh ? 'FDA SCRUTINY' : 'FDA COMPLIANT',
        shortReason: isHigh ? 'Active citizen or scientific petitions questioning safe tolerance limits.' : 'Regulated under FDA Code of Federal Regulations title 21.',
        law: 'Federal Food, Drug, and Cosmetic Act (21 U.S.C. 348 / Title 21 CFR)',
        lawRef: '21 U.S.C. 348',
        detail: `Subject to compliance under US Code of Federal Regulations Title 21 food additive regulations.`
      }
    ]
  };
}

export interface ProductRegulatoryOverview {
  matchedAdditives: {
    ingredientName: string;
    info: AdditiveRegulatoryInfo;
  }[];
  euBannedOrWarnedCount: number;
  fssaiBannedOrWarnedCount: number;
  fdaBannedOrWarnedCount: number;
  hasAnyBanned: boolean;
  hasAnyWarning: boolean;
}

export function analyzeProductRegulatoryProfile(
  riskyIngredients: { name: string; description?: string; implications?: string }[],
  rawIngredientsText: string = ''
): ProductRegulatoryOverview {
  const matchedAdditives: { ingredientName: string; info: AdditiveRegulatoryInfo }[] = [];
  const seenRuleIds = new Set<string>();

  // 1. Check each flagged riskyIngredient
  for (const item of riskyIngredients) {
    const info = getAdditiveRegulatoryStatus(
      item.name,
      `${item.description || ''} ${item.implications || ''}`
    );
    if (info && !seenRuleIds.has(info.matchedRuleName)) {
      seenRuleIds.add(info.matchedRuleName);
      matchedAdditives.push({
        ingredientName: item.name,
        info
      });
    }
  }

  // 2. Also scan rawIngredientsText for any regulatory rule not yet matched
  const lowerRaw = (rawIngredientsText || '').toLowerCase();
  if (lowerRaw) {
    for (const rule of REGULATORY_RULES) {
      if (!seenRuleIds.has(rule.displayName)) {
        const matchedKw = rule.keywords.find(kw => lowerRaw.includes(kw));
        if (matchedKw) {
          seenRuleIds.add(rule.displayName);
          matchedAdditives.push({
            ingredientName: rule.displayName,
            info: {
              matchedRuleName: rule.displayName,
              code: rule.code,
              shortReason: rule.shortReason,
              primaryLaw: rule.primaryLaw,
              rulings: rule.rulings,
              regulatorySummary: rule.summary
            }
          });
        }
      }
    }
  }

  let euBannedOrWarnedCount = 0;
  let fssaiBannedOrWarnedCount = 0;
  let fdaBannedOrWarnedCount = 0;
  let hasAnyBanned = false;
  let hasAnyWarning = false;

  matchedAdditives.forEach(({ info }) => {
    info.rulings.forEach(r => {
      if (r.level === 'banned') hasAnyBanned = true;
      if (r.level === 'warning') hasAnyWarning = true;
      if (r.level === 'banned' || r.level === 'warning' || r.level === 'restricted') {
        if (r.agency === 'EU EFSA') euBannedOrWarnedCount++;
        if (r.agency === 'FSSAI (India)') fssaiBannedOrWarnedCount++;
        if (r.agency === 'US FDA') fdaBannedOrWarnedCount++;
      }
    });
  });

  return {
    matchedAdditives,
    euBannedOrWarnedCount,
    fssaiBannedOrWarnedCount,
    fdaBannedOrWarnedCount,
    hasAnyBanned,
    hasAnyWarning
  };
}

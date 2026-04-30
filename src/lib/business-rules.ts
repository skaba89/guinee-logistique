/**
 * Business Rules Engine — LogisWay
 * Moteur de règles métier avancé pour la validation, la conformité,
 * les approbations, les transitions de statut et la tarification dynamique.
 *
 * V2 — 25+ règles couvrant: validation, pricing, conformité, douanes,
 * sécurité, crédit client, conteneurs, température, conducteurs,
 * multi-devises, taxes, pénalités, ristournes, et plus.
 */

import { parcelFormats, type ParcelFormat } from './label-config';

// ─── Types fondamentaux ────────────────────────────────────────

export type Severity = 'critical' | 'warning' | 'info';
export type RuleCategory = 'validation' | 'compliance' | 'pricing' | 'workflow' | 'safety' | 'customs' | 'credit' | 'operational' | 'environmental';

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  enabled: boolean;
  /** Règle applicable à quels modules */
  appliesTo: string[];
  /** Tags pour le filtrage */
  tags?: string[];
  /** Version de la règle */
  version?: string;
  /** Fonction d'évaluation de la règle */
  evaluate: (context: RuleContext) => RuleResult;
}

export interface RuleContext {
  /** Données du colis/expédition */
  data: Record<string, unknown>;
  /** Rôle de l'utilisateur */
  userRole: string;
  /** Module concerné */
  module: string;
  /** Action en cours (create, update, delete, print, approve) */
  action: string;
  /** Métadonnées additionnelles */
  metadata?: Record<string, unknown>;
}

export interface RuleResult {
  passed: boolean;
  ruleId: string;
  message: string;
  severity: Severity;
  /** Suggestions de correction */
  suggestions?: string[];
  /** Valeur corrigée automatiquement si possible */
  autoFix?: Record<string, unknown>;
  /** Données supplémentaires retournées */
  extraData?: Record<string, unknown>;
}

export interface RuleEvaluationSummary {
  totalRules: number;
  passed: number;
  failed: number;
  critical: number;
  warnings: number;
  info: number;
  results: RuleResult[];
  canProceed: boolean;
  /** Score de conformité (0-100) */
  complianceScore: number;
}

// ─── Constantes métier ─────────────────────────────────────────

const DANGEROUS_GOODS_CODES = [
  'UN0012', 'UN0014', 'UN0027', 'UN0042', 'UN0044',
  'UN0160', 'UN0161', 'UN0245', 'UN0246', 'UN0255',
  'UN0323', 'UN0335', 'UN0357', 'UN0380', 'UN0381',
  'UN0447', 'UN0448', 'UN0449', 'UN0450', 'UN0451',
  'UN1263', 'UN1866', 'UN1993', 'UN3065', 'UN3175',
  'UN3480', 'UN3481', 'UN3090', 'UN3091', // Lithium batteries
  'UN1950', 'UN2037', // Aerosols
  'UN1267', 'UN1863', // Petroleum products
];

const EMBARGOED_COUNTRIES = ['KP', 'IR', 'SY', 'CU'];

/** Pays nécessitant un certificat d'origine */
const COUNTRIES_REQUIRING_ORIGIN = ['CN', 'TR', 'IN', 'AE', 'SA', 'US', 'BR', 'RU'];

/** Pays à haut risque de fraude */
const HIGH_RISK_COUNTRIES = ['NG', 'GH', 'CI', 'SN', 'ML'];

/** Limites transporteurs */
const CARRIER_LIMITS: Record<string, { maxWeight: number; maxLength: number; maxWidth: number; maxHeight: number; maxGirth: number }> = {
  'DHL Express': { maxWeight: 70, maxLength: 120, maxWidth: 80, maxHeight: 80, maxGirth: 300 },
  'FedEx': { maxWeight: 68, maxLength: 274, maxWidth: 274, maxHeight: 274, maxGirth: 330 },
  'UPS': { maxWeight: 70, maxLength: 274, maxWidth: 274, maxHeight: 274, maxGirth: 330 },
  'Aramex': { maxWeight: 30, maxLength: 150, maxWidth: 100, maxHeight: 100, maxGirth: 260 },
  'Yalidine': { maxWeight: 25, maxLength: 100, maxWidth: 80, maxHeight: 60, maxGirth: 200 },
  'ZR Express': { maxWeight: 20, maxLength: 80, maxWidth: 60, maxHeight: 50, maxGirth: 180 },
  'EMS Algérie': { maxWeight: 30, maxLength: 105, maxWidth: 75, maxHeight: 75, maxGirth: 300 },
};

/** Plafonds de crédit par catégorie client (DZD) */
const CREDIT_LIMITS: Record<string, number> = {
  standard: 500000,
  silver: 1500000,
  gold: 5000000,
  platinum: 15000000,
  vip: 50000000,
};

/** Seuils TVA Algérie */
const TAX_CONFIG = {
  tvaStandard: 19, // 19% standard
  tvaReduced: 9,   // 9% réduit
  tap: 1,          // 1% Taxe sur l'Activité Professionnelle
  droitDouaneMin: 5,
  droitDouaneMax: 30,
};

/** Dimensions conteneurs standard */
const CONTAINER_SPECS: Record<string, { lengthM: number; widthM: number; heightM: number; maxWeightKg: number; volumeM3: number }> = {
  '20DV': { lengthM: 5.9, widthM: 2.35, heightM: 2.39, maxWeightKg: 28200, volumeM3: 33.2 },
  '40DV': { lengthM: 12.03, widthM: 2.35, heightM: 2.39, maxWeightKg: 28750, volumeM3: 67.7 },
  '40HC': { lengthM: 12.03, widthM: 2.35, heightM: 2.69, maxWeightKg: 28580, volumeM3: 76.3 },
  '45HC': { lengthM: 13.56, widthM: 2.35, heightM: 2.70, maxWeightKg: 27600, volumeM3: 86.1 },
  '20RF': { lengthM: 5.44, widthM: 2.29, heightM: 2.27, maxWeightKg: 27400, volumeM3: 28.3 },
  '40RF': { lengthM: 11.58, widthM: 2.29, heightM: 2.55, maxWeightKg: 29520, volumeM3: 67.5 },
  '20OT': { lengthM: 5.89, widthM: 2.35, heightM: 2.35, maxWeightKg: 28130, volumeM3: 32.5 },
  '40OT': { lengthM: 12.03, widthM: 2.35, heightM: 2.35, maxWeightKg: 28570, volumeM3: 66.0 },
};

// ─── 1. Règles de validation dimensionnelle ────────────────────

const validateDimensions: BusinessRule = {
  id: 'rule-dim-001',
  name: 'Validation dimensionnelle du colis',
  description: 'Vérifie que les dimensions du colis correspondent au format sélectionné et respectent les limites transporteur',
  category: 'validation',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels'],
  tags: ['dimensions', 'format', 'transporteur'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const formatId = data.format as string;
    const lengthCm = data.lengthCm as number;
    const widthCm = data.widthCm as number;
    const heightCm = data.heightCm as number;
    const weight = data.weightKg as number;

    const fmt = parcelFormats.find(f => f.id === formatId);
    if (!fmt) {
      return {
        passed: false,
        ruleId: 'rule-dim-001',
        message: `Format de colis inconnu: ${formatId}`,
        severity: 'critical',
        suggestions: ['Sélectionnez un format valide (XS, S, M, L, XL, XXL ou Personnalisé)'],
      };
    }

    const errors: string[] = [];
    const fixes: Record<string, unknown> = {};

    if (lengthCm > fmt.maxLength) {
      errors.push(`Longueur ${lengthCm}cm dépasse la limite ${fmt.maxLength}cm pour le format ${fmt.name}`);
      fixes.lengthCm = fmt.maxLength;
    }
    if (widthCm > fmt.maxWidth) {
      errors.push(`Largeur ${widthCm}cm dépasse la limite ${fmt.maxWidth}cm pour le format ${fmt.name}`);
      fixes.widthCm = fmt.maxWidth;
    }
    if (heightCm > fmt.maxHeight) {
      errors.push(`Hauteur ${heightCm}cm dépasse la limite ${fmt.maxHeight}cm pour le format ${fmt.name}`);
      fixes.heightCm = fmt.maxHeight;
    }
    if (weight > fmt.maxWeight) {
      errors.push(`Poids ${weight}kg dépasse la limite ${fmt.maxWeight}kg pour le format ${fmt.name}`);
      fixes.weightKg = fmt.maxWeight;
    }

    // Vérifier le rapport dimensions/poids (densité)
    const volumeL = (lengthCm * widthCm * heightCm) / 1000;
    const density = weight / Math.max(volumeL, 0.001);
    if (density < 0.05 && weight > 0) {
      errors.push(`Colis très peu dense (${density.toFixed(3)} kg/L) — le transporteur peut facturer au volume`);
    }

    if (errors.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-dim-001',
        message: errors.join(' | '),
        severity: 'critical',
        suggestions: errors.length > 1
          ? ['Ajustez les dimensions ou changez de format', 'Utilisez le format Personnalisé pour les dimensions non standard']
          : ['Ajustez la valeur ou changez de format'],
        autoFix: Object.keys(fixes).length > 0 ? fixes : undefined,
      };
    }

    return {
      passed: true,
      ruleId: 'rule-dim-001',
      message: 'Dimensions valides pour le format sélectionné',
      severity: 'info',
    };
  },
};

// ─── 2. Règle de poids volumétrique ────────────────────────────

const validateVolumetricWeight: BusinessRule = {
  id: 'rule-vol-001',
  name: 'Poids volumétrique (aérien)',
  description: 'Calcule le poids volumétrique selon la formule IATA (L×l×h/6000) et compare au poids réel',
  category: 'pricing',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'air-freight'],
  tags: ['volumétrique', 'IATA', 'aérien'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const lengthCm = data.lengthCm as number;
    const widthCm = data.widthCm as number;
    const heightCm = data.heightCm as number;
    const actualWeight = data.weightKg as number;
    const isInternational = data.isInternational as boolean;

    if (!lengthCm || !widthCm || !heightCm) {
      return { passed: true, ruleId: 'rule-vol-001', message: 'Dimensions non spécifiées', severity: 'info' };
    }

    const volumetricWeight = (lengthCm * widthCm * heightCm) / 6000;
    const chargeableWeight = Math.max(actualWeight, volumetricWeight);
    const isVolumetric = volumetricWeight > actualWeight;

    if (isVolumetric && isInternational) {
      const surcharge = Math.round((chargeableWeight - actualWeight) * (data.pricePerKg as number || 800));
      return {
        passed: false,
        ruleId: 'rule-vol-001',
        message: `Poids volumétrique (${volumetricWeight.toFixed(1)} kg) > poids réel (${actualWeight} kg). Le transporteur facturera ${chargeableWeight.toFixed(1)} kg.`,
        severity: 'warning',
        suggestions: [
          `Surcharge estimée: ~${surcharge} DZD`,
          'Compacter le colis si possible pour réduire le volume',
          'Le prix sera calculé sur la base du poids volumétrique',
        ],
        autoFix: { chargeableWeight, isVolumetricPricing: true },
        extraData: { volumetricWeight, chargeableWeight, surcharge },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-vol-001',
      message: `Poids chargeable: ${chargeableWeight.toFixed(1)} kg (réel: ${actualWeight}, vol: ${volumetricWeight.toFixed(1)})`,
      severity: 'info',
    };
  },
};

// ─── 3. Règle de marchandises dangereuses ──────────────────────

const validateDangerousGoods: BusinessRule = {
  id: 'rule-dg-001',
  name: 'Contrôle marchandises dangereuses',
  description: 'Vérifie si le colis contient des marchandises dangereuses nécessitant une déclaration UN et un emballage certifié',
  category: 'safety',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
  tags: ['danger', 'UN', 'OACI', 'IATA', 'ADR'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const description = ((data.description as string) || '').toUpperCase();
    const hsCode = (data.hsCode as string) || '';
    const unCode = (data.unCode as string) || '';
    const hasDgDeclaration = data.dgDeclaration as boolean;
    const transportMode = (data.transportMode as string) || 'parcel';

    const dgKeywords = [
      'EXPLOSIF', 'INFLAMMABLE', 'COMBUSTIBLE', 'OXYDANT', 'CORROSIF',
      'TOXIQUE', 'RADIOACTIF', 'GAZ', 'AEROSOL', 'BATTERIE LITHIUM',
      'LI-ION', 'ACIDE', 'BASE', 'SOLVANT', 'PEINTURE', 'CARBURANT',
      'ESSENCE', 'DIESEL', 'ALCOOL', 'PEROXYDE', 'MATIERE DANGEREUSE',
      'LITHIUM', 'ION-LITHIUM', 'PYROTECHNIQUE', 'ASBESTE', 'CMR',
    ];

    const foundKeywords = dgKeywords.filter(kw => description.includes(kw));
    const isUNDangerous = DANGEROUS_GOODS_CODES.some(code => unCode.toUpperCase().startsWith(code.substring(0, 4)));

    if (foundKeywords.length > 0 || isUNDangerous) {
      const issues: string[] = [];
      const modeRestrictions: string[] = [];

      if (foundKeywords.length > 0) {
        issues.push(`Mots-clés détectés: ${foundKeywords.join(', ')}`);
      }
      if (isUNDangerous) {
        issues.push(`Code UN dangereux détecté: ${unCode}`);
      }
      if (!hasDgDeclaration) {
        issues.push('Déclaration de marchandises dangereuses manquante');
      }

      // Restrictions par mode de transport
      if (transportMode === 'air' || transportMode === 'air-freight') {
        const airForbidden = ['EXPLOSIF', 'PYROTECHNIQUE', 'RADIOACTIF'];
        const airFound = airForbidden.filter(kw => foundKeywords.includes(kw));
        if (airFound.length > 0) {
          modeRestrictions.push(`INTERDIT par voie aérienne: ${airFound.join(', ')}`);
        }
      }

      if (transportMode === 'parcel' && foundKeywords.some(k => ['EXPLOSIF', 'RADIOACTIF', 'GAZ'].includes(k))) {
        modeRestrictions.push('INTERDIT en envoi de colis standard');
      }

      return {
        passed: hasDgDeclaration && !!unCode && modeRestrictions.length === 0,
        ruleId: 'rule-dg-001',
        message: `MARCHANDISES DANGEREUSES — ${[...issues, ...modeRestrictions].join(' | ')}`,
        severity: modeRestrictions.length > 0 ? 'critical' : 'warning',
        suggestions: [
          'Remplir la déclaration de marchandises dangereuses (DGD)',
          'Indiquer le code UN approprié',
          'Utiliser un emballage certifié OACI/IATA/ADR',
          'Vérifier les restrictions du transporteur',
          'Joindre la fiche de données de sécurité (FDS/MSDS)',
          ...modeRestrictions.map(r => `Changer de mode de transport: ${r}`),
        ],
        extraData: { foundKeywords, unCode, modeRestrictions, isUNDangerous },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-dg-001',
      message: 'Aucune marchandise dangereuse détectée',
      severity: 'info',
    };
  },
};

// ─── 4. Règle de conformité douanière ──────────────────────────

const validateCustomsCompliance: BusinessRule = {
  id: 'rule-customs-001',
  name: 'Conformité douanière',
  description: 'Vérifie que les documents douaniers obligatoires sont présents pour les expéditions internationales',
  category: 'customs',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
  tags: ['douanes', 'documents', 'import', 'export'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const isInternational = data.isInternational as boolean;
    const action = ctx.action;

    if (!isInternational) {
      return { passed: true, ruleId: 'rule-customs-001', message: 'Expédition domestique — pas de formalités douanières', severity: 'info' };
    }

    const missingDocs: string[] = [];
    const hasInvoice = data.commercialInvoice as boolean;
    const hasPackingList = data.packingList as boolean;
    const hasCertificateOrigin = data.certificateOfOrigin as boolean;
    const hasHsCode = !!(data.hsCode as string);
    const hasDeclaredValue = (data.declaredValue as number) > 0;
    const destinationCountry = (data.destinationCountry as string) || '';

    if (!hasInvoice) missingDocs.push('Facture commerciale');
    if (!hasPackingList) missingDocs.push('Liste de colisage');
    if (!hasHsCode) missingDocs.push('Code HS/SHS');
    if (!hasDeclaredValue) missingDocs.push('Valeur déclarée');

    if (COUNTRIES_REQUIRING_ORIGIN.some(c => destinationCountry.includes(c)) && !hasCertificateOrigin) {
      missingDocs.push('Certificat d\'origine');
    }

    if (missingDocs.length > 0 && (action === 'create' || action === 'update')) {
      return {
        passed: false,
        ruleId: 'rule-customs-001',
        message: `Documents douaniers manquants: ${missingDocs.join(', ')}`,
        severity: 'critical',
        suggestions: missingDocs.map(d => `Ajouter: ${d}`),
        extraData: { missingDocs },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-customs-001',
      message: missingDocs.length > 0
        ? `Documents optionnels manquants: ${missingDocs.join(', ')}`
        : 'Conformité douanière OK',
      severity: missingDocs.length > 0 ? 'warning' : 'info',
    };
  },
};

// ─── 5. Règle de valeur déclarée / assurance ───────────────────

const validateInsurance: BusinessRule = {
  id: 'rule-ins-001',
  name: 'Valeur déclarée et assurance',
  description: 'Vérifie que la valeur déclarée est couverte par une assurance appropriée, surtout pour les colis de valeur',
  category: 'compliance',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime'],
  tags: ['assurance', 'valeur', 'couverture'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const declaredValue = (data.declaredValue as number) || 0;
    const insuranceAmount = (data.insuranceAmount as number) || 0;
    const isInternational = data.isInternational as boolean;

    const THRESHOLD_MANDATORY_INSURANCE = 50000;
    const THRESHOLD_HIGH_VALUE = 200000;

    if (declaredValue >= THRESHOLD_MANDATORY_INSURANCE && insuranceAmount === 0) {
      return {
        passed: false,
        ruleId: 'rule-ins-001',
        message: `Valeur déclarée ${declaredValue} DZD — assurance fortement recommandée (seuil: ${THRESHOLD_MANDATORY_INSURANCE} DZD)`,
        severity: 'warning',
        suggestions: [
          'Ajouter une assurance cargo (2% de la valeur déclarée)',
          isInternational ? 'En international, l\'assurance est quasi-obligatoire' : 'Considérer l\'assurance pour les colis de valeur',
        ],
        autoFix: { insuranceAmount: Math.round(declaredValue * 0.02) },
      };
    }

    if (declaredValue >= THRESHOLD_HIGH_VALUE && insuranceAmount < declaredValue) {
      return {
        passed: false,
        ruleId: 'rule-ins-001',
        message: `Haute valeur (${declaredValue} DZD) — assurance insuffisante (${insuranceAmount} DZD)`,
        severity: 'warning',
        suggestions: [
          'Couvrir la totalité de la valeur déclarée',
          'Considérer une assurance tous risques',
          'Vérifier les plafonds du transporteur',
        ],
        autoFix: { insuranceAmount: declaredValue },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-ins-001',
      message: insuranceAmount > 0
        ? `Assurance ${insuranceAmount} DZD couvrant ${declaredValue} DZD`
        : declaredValue > 0 ? `Valeur déclarée: ${declaredValue} DZD sans assurance` : 'Pas de valeur déclarée',
      severity: 'info',
    };
  },
};

// ─── 6. Règle de restriction transporteur ──────────────────────

const validateCarrierRestrictions: BusinessRule = {
  id: 'rule-carrier-001',
  name: 'Restrictions transporteur',
  description: 'Vérifie les restrictions spécifiques aux transporteurs (poids max, dimensions, pays, girth)',
  category: 'validation',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels'],
  tags: ['transporteur', 'limites', 'girth'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const carrier = (data.carrier as string) || '';
    const weight = (data.weightKg as number) || 0;
    const isInternational = data.isInternational as boolean;
    const lengthCm = data.lengthCm as number;
    const widthCm = data.widthCm as number;
    const heightCm = data.heightCm as number;

    const limits = CARRIER_LIMITS[carrier];
    if (!limits) {
      return { passed: true, ruleId: 'rule-carrier-001', message: 'Pas de restrictions connues pour ce transporteur', severity: 'info' };
    }

    const errors: string[] = [];

    if (weight > limits.maxWeight) errors.push(`Poids ${weight}kg > limite ${limits.maxWeight}kg`);
    if (lengthCm > limits.maxLength) errors.push(`Longueur ${lengthCm}cm > limite ${limits.maxLength}cm`);
    if (widthCm > limits.maxWidth) errors.push(`Largeur ${widthCm}cm > limite ${limits.maxWidth}cm`);
    if (heightCm > limits.maxHeight) errors.push(`Hauteur ${heightCm}cm > limite ${limits.maxHeight}cm`);

    const girth = 2 * (widthCm + heightCm);
    const combinedLength = lengthCm + girth;
    if (combinedLength > limits.maxGirth && isInternational) {
      errors.push(`Dimension combinée (${combinedLength}cm) > ${limits.maxGirth}cm — surcharge grand format applicable`);
    }

    if (errors.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-carrier-001',
        message: `${carrier}: ${errors.join(' | ')}`,
        severity: 'critical',
        suggestions: [
          'Réduire les dimensions ou le poids',
          'Choisir un autre transporteur',
          'Diviser en plusieurs colis',
        ],
        extraData: { carrier, girth, combinedLength, limits },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-carrier-001',
      message: `${carrier}: colis conforme aux restrictions`,
      severity: 'info',
    };
  },
};

// ─── 7. Règle SLA ──────────────────────────────────────────────

const validateSLA: BusinessRule = {
  id: 'rule-sla-001',
  name: 'Respect des SLA',
  description: 'Vérifie que le délai de livraison estimé respecte les engagements de service',
  category: 'compliance',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'shipments'],
  tags: ['SLA', 'délai', 'livraison'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const serviceLevel = data.serviceLevel as string;
    const estimatedDelivery = data.estimatedDelivery as string;
    const createdAt = data.createdAt as string;

    if (!estimatedDelivery || !createdAt) {
      return { passed: true, ruleId: 'rule-sla-001', message: 'Dates non spécifiées', severity: 'info' };
    }

    const created = new Date(createdAt);
    const delivery = new Date(estimatedDelivery);
    const diffHours = (delivery.getTime() - created.getTime()) / (1000 * 60 * 60);

    const slaTargets: Record<string, { maxHours: number; label: string }> = {
      express: { maxHours: 48, label: 'Express (48h)' },
      standard: { maxHours: 120, label: 'Standard (5 jours)' },
      economy: { maxHours: 240, label: 'Économique (10 jours)' },
      same_day: { maxHours: 12, label: 'Jour même (12h)' },
      next_day: { maxHours: 24, label: 'Lendemain (24h)' },
    };

    const target = slaTargets[serviceLevel];
    if (!target) {
      return { passed: true, ruleId: 'rule-sla-001', message: 'Niveau de service non spécifié', severity: 'info' };
    }

    if (diffHours > target.maxHours) {
      return {
        passed: false,
        ruleId: 'rule-sla-001',
        message: `Délai estimé (${Math.round(diffHours)}h) dépasse le SLA ${target.label}`,
        severity: 'warning',
        suggestions: [
          'Ajuster la date de livraison estimée',
          'Changer de niveau de service',
          'Notifier le client du retard potentiel',
        ],
        extraData: { diffHours, maxHours: target.maxHours, overrun: diffHours - target.maxHours },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-sla-001',
      message: `SLA ${target.label} respecté (${Math.round(diffHours)}h / ${target.maxHours}h)`,
      severity: 'info',
    };
  },
};

// ─── 8. Règle de douane Algérie spécifique ─────────────────────

const validateAlgerianCustoms: BusinessRule = {
  id: 'rule-customs-dz-001',
  name: 'Conformité douanière algérienne',
  description: 'Vérifie les exigences spécifiques aux douanes algériennes pour les importations/exportations',
  category: 'customs',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
  tags: ['Algérie', 'NIF', 'NIS', 'SHS'],
  version: '2.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const destinationCountry = ((data.destinationCountry as string) || '').toUpperCase();
    const originCountry = ((data.originCountry as string) || '').toUpperCase();
    const isToAlgeria = destinationCountry.includes('DZ') || destinationCountry.includes('ALGERIA') || destinationCountry.includes('ALGER');
    const isFromAlgeria = originCountry.includes('DZ') || originCountry.includes('ALGERIA') || originCountry.includes('ALGER');

    if (!isToAlgeria && !isFromAlgeria) {
      return { passed: true, ruleId: 'rule-customs-dz-001', message: 'Pas de flux algérien', severity: 'info' };
    }

    const missing: string[] = [];
    const hasNIF = data.nif as string;
    const hasNIS = data.nis as string;
    const hasAI = data.ai as string;

    if (isToAlgeria) {
      if (!hasNIF) missing.push('NIF (Numéro d\'Identification Fiscale) du destinataire');
      if (!data.hsCode) missing.push('Code SHS (Système Harmonisé algérien)');
      if (!hasAI && (data.declaredValue as number) > 100000) missing.push('Autorisation d\'Importation (AI) pour valeur > 100 000 DZD');
    }

    if (isFromAlgeria) {
      if (!hasNIS) missing.push('NIS (Numéro d\'Identification Statistique) de l\'expéditeur');
      if (!data.exportLicense && (data.declaredValue as number) > 500000) missing.push('Licence d\'exportation pour valeur > 500 000 DZD');
    }

    if (missing.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-customs-dz-001',
        message: `Documents réglementaires algériens manquants: ${missing.join(', ')}`,
        severity: 'critical',
        suggestions: missing.map(m => `Fournir: ${m}`),
      };
    }

    return {
      passed: true,
      ruleId: 'rule-customs-dz-001',
      message: 'Conformité douanière algérienne OK',
      severity: 'info',
    };
  },
};

// ─── 9. Règle de limitation d'impression ───────────────────────

const validatePrintLimit: BusinessRule = {
  id: 'rule-print-001',
  name: 'Limitation d\'impression étiquettes',
  description: 'Vérifie les limites d\'impression et la cohérence du nombre de copies',
  category: 'validation',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels'],
  tags: ['impression', 'étiquette', 'Zebra'],
  evaluate: (ctx) => {
    const copies = (ctx.data.copies as number) || 1;
    const printerStatus = ctx.data.printerStatus as string;
    const maxCopies = 20;

    if (copies > maxCopies) {
      return {
        passed: false,
        ruleId: 'rule-print-001',
        message: `Nombre de copies (${copies}) dépasse la limite (${maxCopies})`,
        severity: 'warning',
        suggestions: ['Réduisez le nombre de copies', 'Utilisez l\'impression par lots pour les grands volumes'],
        autoFix: { copies: maxCopies },
      };
    }

    if (printerStatus === 'offline' || printerStatus === 'error') {
      return {
        passed: false,
        ruleId: 'rule-print-001',
        message: `Imprimante ${printerStatus} — impossible d'imprimer`,
        severity: 'critical',
        suggestions: ['Vérifiez la connexion de l\'imprimante', 'Sélectionnez une autre imprimante'],
      };
    }

    return {
      passed: true,
      ruleId: 'rule-print-001',
      message: `Impression de ${copies} copie(s) autorisée`,
      severity: 'info',
    };
  },
};

// ─── 10. Règle de preuve photo obligatoire ─────────────────────

const validateProofPhoto: BusinessRule = {
  id: 'rule-photo-001',
  name: 'Preuve photo obligatoire',
  description: 'Vérifie la présence de preuves photo pour les colis livrés ou les colis de valeur',
  category: 'compliance',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels'],
  tags: ['photo', 'preuve', 'livraison'],
  evaluate: (ctx) => {
    const data = ctx.data;
    const status = data.status as string;
    const hasProofPhoto = !!(data.proofPhoto as string);
    const hasDeliveryPhoto = !!(data.deliveryProofPhoto as string);
    const declaredValue = (data.declaredValue as number) || 0;
    const action = ctx.action;

    if (status === 'delivered' && !hasDeliveryPhoto && action === 'update') {
      return {
        passed: false,
        ruleId: 'rule-photo-001',
        message: 'Photo de preuve de livraison manquante pour un colis livré',
        severity: 'warning',
        suggestions: [
          'Prendre une photo du colis livré comme preuve',
          'La photo est obligatoire pour confirmer la livraison',
        ],
      };
    }

    if (declaredValue >= 50000 && !hasProofPhoto && (action === 'create' || action === 'update')) {
      return {
        passed: false,
        ruleId: 'rule-photo-001',
        message: `Photo de preuve recommandée pour colis de valeur (${declaredValue} DZD)`,
        severity: 'warning',
        suggestions: ['Photographier le colis avant l\'expédition comme preuve d\'état'],
      };
    }

    return {
      passed: true,
      ruleId: 'rule-photo-001',
      message: hasProofPhoto ? 'Preuve photo présente' : 'Pas de preuve photo (non requise)',
      severity: 'info',
    };
  },
};

// ─── 11. Règle de restrictions d'embargo ───────────────────────

const validateEmbargo: BusinessRule = {
  id: 'rule-embargo-001',
  name: 'Contrôle embargo',
  description: 'Vérifie que la destination n\'est pas sous embargo ou soumise à des sanctions',
  category: 'compliance',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
  tags: ['embargo', 'sanctions', 'ONU'],
  evaluate: (ctx) => {
    const data = ctx.data;
    const destination = ((data.destinationCountry as string) || '').toUpperCase();
    const origin = ((data.originCountry as string) || '').toUpperCase();

    const isEmbargoed = EMBARGOED_COUNTRIES.some(c => destination.includes(c) || origin.includes(c));

    if (isEmbargoed) {
      return {
        passed: false,
        ruleId: 'rule-embargo-001',
        message: `ALERTE: Destination/origine potentiellement sous embargo — ${destination || origin}`,
        severity: 'critical',
        suggestions: [
          'Vérifier les sanctions en vigueur',
          'Consulter le service juridique',
          'Ne pas expédier sans validation conforme',
        ],
      };
    }

    return {
      passed: true,
      ruleId: 'rule-embargo-001',
      message: 'Aucune restriction d\'embargo détectée',
      severity: 'info',
    };
  },
};

// ═══════════════════════════════════════════════════════════════
// NOUVELLES RÈGLES V2
// ═══════════════════════════════════════════════════════════════

// ─── 12. Règle de crédit client ────────────────────────────────

const validateClientCredit: BusinessRule = {
  id: 'rule-credit-001',
  name: 'Limite de crédit client',
  description: 'Vérifie que le client n\'a pas dépassé sa limite de crédit et que les factures en retard sont dans les tolérances',
  category: 'credit',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'shipments', 'billing', 'quotations'],
  tags: ['crédit', 'client', 'facturation', 'risque'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const clientCategory = (data.clientCategory as string) || 'standard';
    const currentOutstanding = (data.currentOutstanding as number) || 0;
    const overdueAmount = (data.overdueAmount as number) || 0;
    const orderAmount = (data.orderAmount as number) || 0;
    const overdueInvoices = (data.overdueInvoices as number) || 0;

    const creditLimit = CREDIT_LIMITS[clientCategory] || CREDIT_LIMITS.standard;
    const totalExposure = currentOutstanding + orderAmount;
    const utilizationRate = totalExposure / creditLimit;

    // Client au-delà de la limite de crédit
    if (totalExposure > creditLimit) {
      return {
        passed: false,
        ruleId: 'rule-credit-001',
        message: `Limite de crédit dépassée: ${totalExposure.toLocaleString()} DZD / ${creditLimit.toLocaleString()} DZD (${(utilizationRate * 100).toFixed(0)}%)`,
        severity: 'critical',
        suggestions: [
          'Bloquer la commande jusqu\'au paiement des factures en attente',
          'Demander un paiement anticipé avant expédition',
          'Demander une augmentation de limite de crédit au manager',
          'Passer en mode prépayé pour ce client',
        ],
        extraData: { creditLimit, currentOutstanding, orderAmount, utilizationRate, clientCategory },
      };
    }

    // Factures en retard
    if (overdueInvoices >= 3 || overdueAmount > creditLimit * 0.3) {
      return {
        passed: false,
        ruleId: 'rule-credit-001',
        message: `Client à risque: ${overdueInvoices} facture(s) en retard (${overdueAmount.toLocaleString()} DZD)`,
        severity: 'critical',
        suggestions: [
          'Exiger un paiement avant toute nouvelle expédition',
          'Mettre le client en mode prépayé',
          'Contacter le service recouvrement',
        ],
        extraData: { creditLimit, overdueInvoices, overdueAmount, clientCategory },
      };
    }

    // Taux d'utilisation élevé
    if (utilizationRate > 0.8) {
      return {
        passed: false,
        ruleId: 'rule-credit-001',
        message: `Crédit élevé: ${(utilizationRate * 100).toFixed(0)}% de la limite utilisée (${totalExposure.toLocaleString()} / ${creditLimit.toLocaleString()} DZD)`,
        severity: 'warning',
        suggestions: [
          'Surveiller le compte client',
          'Envoyer un rappel de paiement',
          'Envisager une augmentation de limite',
        ],
        extraData: { creditLimit, utilizationRate, clientCategory },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-credit-001',
      message: `Crédit client OK: ${(utilizationRate * 100).toFixed(0)}% utilisé (${totalExposure.toLocaleString()} / ${creditLimit.toLocaleString()} DZD)`,
      severity: 'info',
      extraData: { creditLimit, utilizationRate, clientCategory },
    };
  },
};

// ─── 13. Règle de pénalité retard de livraison ─────────────────

const validateLateDeliveryPenalty: BusinessRule = {
  id: 'rule-late-001',
  name: 'Pénalité retard de livraison',
  description: 'Calcule les pénalités applicables en cas de retard de livraison selon les conditions contractuelles',
  category: 'pricing',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'shipments', 'billing'],
  tags: ['retard', 'pénalité', 'SLA', 'indemnisation'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const serviceLevel = data.serviceLevel as string;
    const estimatedDelivery = data.estimatedDelivery as string;
    const actualDelivery = data.actualDelivery as string;
    const shipmentValue = (data.shipmentValue as number) || 0;
    const status = data.status as string;

    if (status !== 'delivered' || !estimatedDelivery || !actualDelivery) {
      return { passed: true, ruleId: 'rule-late-001', message: 'Pas de données de livraison pour évaluer le retard', severity: 'info' };
    }

    const estimated = new Date(estimatedDelivery);
    const actual = new Date(actualDelivery);
    const diffHours = (actual.getTime() - estimated.getTime()) / (1000 * 60 * 60);

    if (diffHours <= 0) {
      return { passed: true, ruleId: 'rule-late-001', message: `Livraison dans les délais (${Math.abs(Math.round(diffHours))}h d'avance)`, severity: 'info' };
    }

    // Calcul pénalité: 0.5% par jour de retard, max 15% de la valeur
    const delayDays = Math.ceil(diffHours / 24);
    const penaltyRate = Math.min(delayDays * 0.005, 0.15);
    const penaltyAmount = Math.round(shipmentValue * penaltyRate);

    // Express a une pénalité majorée
    const isExpress = serviceLevel === 'express' || serviceLevel === 'same_day';
    const expressMultiplier = isExpress ? 2 : 1;
    const finalPenalty = Math.round(penaltyAmount * expressMultiplier);

    return {
      passed: false,
      ruleId: 'rule-late-001',
      message: `Retard de ${delayDays} jour(s) — pénalité: ${finalPenalty.toLocaleString()} DZD (${(penaltyRate * 100 * expressMultiplier).toFixed(1)}% de la valeur)`,
      severity: delayDays > 3 ? 'critical' : 'warning',
      suggestions: [
        'Appliquer la pénalité contractuelle',
        'Informer le client du retard et de l\'indemnisation',
        isExpress ? 'Le service Express implique une pénalité doublée' : 'Envisager un geste commercial',
        'Documenter les causes du retard',
      ],
      extraData: { delayDays, penaltyRate, penaltyAmount: finalPenalty, isExpress, diffHours },
    };
  },
};

// ─── 14. Règle de gestion conteneur ────────────────────────────

const validateContainer: BusinessRule = {
  id: 'rule-container-001',
  name: 'Limites conteneur maritime',
  description: 'Vérifie que le poids et le volume des marchandises ne dépassent pas la capacité du conteneur assigné',
  category: 'operational',
  severity: 'critical',
  enabled: true,
  appliesTo: ['maritime', 'warehouse'],
  tags: ['conteneur', 'maritime', 'poids', 'volume'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const containerType = (data.containerType as string) || '20DV';
    const totalWeight = (data.totalWeightKg as number) || 0;
    const totalVolume = (data.totalVolumeM3 as number) || 0;

    const spec = CONTAINER_SPECS[containerType];
    if (!spec) {
      return { passed: true, ruleId: 'rule-container-001', message: `Type de conteneur ${containerType} non reconnu`, severity: 'info' };
    }

    const errors: string[] = [];
    const weightUtilization = totalWeight / spec.maxWeightKg;
    const volumeUtilization = totalVolume / spec.volumeM3;

    if (totalWeight > spec.maxWeightKg) {
      errors.push(`Poids total ${totalWeight.toLocaleString()} kg > capacité ${spec.maxWeightKg.toLocaleString()} kg`);
    }
    if (totalVolume > spec.volumeM3) {
      errors.push(`Volume total ${totalVolume.toFixed(1)} m3 > capacité ${spec.volumeM3} m3`);
    }

    // Alerte si le conteneur est sous-utilisé
    const underUtilization = weightUtilization < 0.3 && volumeUtilization < 0.3;
    if (underUtilization && errors.length === 0) {
      return {
        passed: true,
        ruleId: 'rule-container-001',
        message: `Conteneur ${containerType} sous-utilisé: poids ${(weightUtilization * 100).toFixed(0)}%, volume ${(volumeUtilization * 100).toFixed(0)}% — envisager un plus petit conteneur`,
        severity: 'info',
        suggestions: [
          `Envisager un conteneur plus petit (ex: 20DV au lieu de 40DV)`,
          'Combiner avec d\'autres envois (LCL/Groupage)',
          'Consolider les expéditions',
        ],
        extraData: { containerType, weightUtilization, volumeUtilization },
      };
    }

    if (errors.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-container-001',
        message: `Conteneur ${containerType} en surcharge: ${errors.join(' | ')}`,
        severity: 'critical',
        suggestions: [
          'Réduire le chargement',
          'Passer à un conteneur plus grand',
          'Diviser en plusieurs conteneurs',
          `Options: ${Object.entries(CONTAINER_SPECS).filter(([, s]) => s.maxWeightKg >= totalWeight && s.volumeM3 >= totalVolume).map(([k]) => k).join(', ') || 'Aucune — diviser le chargement'}`,
        ],
        extraData: { containerType, spec, weightUtilization, volumeUtilization },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-container-001',
      message: `Conteneur ${containerType}: poids ${(weightUtilization * 100).toFixed(0)}%, volume ${(volumeUtilization * 100).toFixed(0)}%`,
      severity: 'info',
      extraData: { containerType, weightUtilization, volumeUtilization },
    };
  },
};

// ─── 15. Règle de contrôle température ─────────────────────────

const validateTemperatureControl: BusinessRule = {
  id: 'rule-temp-001',
  name: 'Contrôle température (périssables)',
  description: 'Vérifie que les marchandises périssables sont correctement emballées avec la chaîne du froid respectée',
  category: 'safety',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'warehouse'],
  tags: ['température', 'périssable', 'chaîne du froid', 'réfrigéré'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const description = ((data.description as string) || '').toUpperCase();
    const isTemperatureControlled = data.isTemperatureControlled as boolean;
    const requiredTemp = data.requiredTemperature as number;
    const actualTemp = data.actualTemperature as number;
    const containerType = (data.containerType as string) || '';

    const perishableKeywords = [
      'ALIMENT', 'NOURRITURE', 'PRODUIT FRAIS', 'VIANDE', 'POISSON',
      'PRODUIT LAITIER', 'FROMAGE', 'LAIT', 'YAHOURT', 'FRUIT',
      'LEGUME', 'MEDICAMENT', 'VACCIN', 'PHARMACEUTIQUE', 'BIOLOGIQUE',
      'FLEUR', 'PLANTE', 'CHIMIQUE', 'COSMETIQUE', 'CONGELÉ', 'SURGELÉ',
    ];

    const isPerishable = perishableKeywords.some(kw => description.includes(kw));
    const isRefrigeratedContainer = containerType.includes('RF');

    if (!isPerishable && !isTemperatureControlled) {
      return { passed: true, ruleId: 'rule-temp-001', message: 'Pas de marchandise périssable détectée', severity: 'info' };
    }

    const issues: string[] = [];

    if (isPerishable && !isTemperatureControlled) {
      issues.push('Marchandise périssable sans contrôle de température');
    }

    if (isPerishable && containerType && !isRefrigeratedContainer) {
      issues.push(`Conteneur ${containerType} non réfrigéré pour marchandise périssable`);
    }

    if (requiredTemp !== undefined && actualTemp !== undefined) {
      const tempDiff = Math.abs(actualTemp - requiredTemp);
      if (tempDiff > 3) {
        issues.push(`Écart de température: ${actualTemp}°C vs requis ${requiredTemp}°C (écart: ${tempDiff}°C)`);
      }
    }

    if (isPerishable && !data.tempLoggerId) {
      issues.push('Enregistreur de température manquant (data logger)');
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-temp-001',
        message: `CHAÎNE DU FROID — ${issues.join(' | ')}`,
        severity: 'critical',
        suggestions: [
          'Utiliser un conteneur réfrigéré (RF)',
          'Installer un enregistreur de température (data logger)',
          'Vérifier la chaîne du froid avant et après transport',
          'Former le personnel aux procédures périssables',
          'Prévoir un plan B en cas de panne de réfrigération',
        ],
        extraData: { isPerishable, isTemperatureControlled, requiredTemp, actualTemp },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-temp-001',
      message: isPerishable ? 'Chaîne du froid respectée' : 'Pas de contrainte de température',
      severity: 'info',
    };
  },
};

// ─── 16. Règle de conformité conducteur ────────────────────────

const validateDriverCompliance: BusinessRule = {
  id: 'rule-driver-001',
  name: 'Conformité conducteur (heures de conduite)',
  description: 'Vérifie que le conducteur respecte les réglementations sur les temps de conduite et de repos (règlement AETR/UE)',
  category: 'compliance',
  severity: 'critical',
  enabled: true,
  appliesTo: ['ground-transport', 'drivers', 'fleet'],
  tags: ['conducteur', 'AETR', 'temps de conduite', 'réglementation'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const drivingTimeToday = (data.drivingTimeTodayMinutes as number) || 0;
    const continuousDrivingTime = (data.continuousDrivingMinutes as number) || 0;
    const weeklyDrivingTime = (data.weeklyDrivingMinutes as number) || 0;
    const restTimeSinceBreak = (data.restTimeSinceBreakMinutes as number) || 0;
    const licenseExpiry = data.licenseExpiry as string;
    const driverTraining = data.driverTraining as boolean;
    const isHazardous = data.isHazardousGoodsDriver as boolean;
    const hasADRTraining = data.hasADRTraining as boolean;

    const errors: string[] = [];

    // Temps de conduite continue max: 4h30 sans pause
    if (continuousDrivingTime > 270) {
      errors.push(`Conduite continue: ${Math.floor(continuousDrivingTime / 60)}h${continuousDrivingTime % 60}m — limite 4h30`);
    }

    // Temps de conduite journalier max: 9h (extensible à 10h 2x/semaine)
    if (drivingTimeToday > 540) {
      errors.push(`Conduite journalière: ${Math.floor(drivingTimeToday / 60)}h${drivingTimeToday % 60}m — limite 9h`);
    } else if (drivingTimeToday > 600) {
      errors.push(`Conduite journalière: ${Math.floor(drivingTimeToday / 60)}h${drivingTimeToday % 60}m — DÉPASSEMENT CRITIQUE`);
    }

    // Temps de conduite hebdomadaire max: 56h
    if (weeklyDrivingTime > 3360) {
      errors.push(`Conduite hebdomadaire: ${Math.floor(weeklyDrivingTime / 60)}h — limite 56h`);
    }

    // Vérification permis
    if (licenseExpiry) {
      const expiry = new Date(licenseExpiry);
      const now = new Date();
      const daysToExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysToExpiry < 0) {
        errors.push('PERMIS EXPIRÉ — conduite illégale');
      } else if (daysToExpiry < 30) {
        errors.push(`Permis expire dans ${Math.floor(daysToExpiry)} jours`);
      }
    }

    // Formation ADR pour marchandises dangereuses
    if (isHazardous && !hasADRTraining) {
      errors.push('Formation ADR manquante pour le transport de marchandises dangereuses');
    }

    // Formation obligatoire
    if (!driverTraining) {
      errors.push('Formation initiale obligatoire non validée');
    }

    if (errors.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-driver-001',
        message: `CONFORMITÉ CONDUCTEUR — ${errors.join(' | ')}`,
        severity: errors.some(e => e.includes('EXPIRÉ') || e.includes('CRITIQUE') || e.includes('ADR')) ? 'critical' : 'warning',
        suggestions: [
          'Planifier une pause obligatoire de 45 minutes',
          'Respecter les temps de repos réglementaires',
          isHazardous ? 'Assurer la formation ADR du conducteur' : 'Vérifier les certifications du conducteur',
          'Mettre à jour le chronotachygraphe',
        ],
        extraData: { drivingTimeToday, continuousDrivingTime, weeklyDrivingTime },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-driver-001',
      message: `Conducteur conforme — conduite: ${Math.floor(drivingTimeToday / 60)}h${drivingTimeToday % 60}m aujourd'hui`,
      severity: 'info',
    };
  },
};

// ─── 17. Règle de validation multi-devises ─────────────────────

const validateCurrency: BusinessRule = {
  id: 'rule-currency-001',
  name: 'Validation multi-devises',
  description: 'Vérifie la cohérence des devises et calcule les conversions selon les taux en vigueur',
  category: 'pricing',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'billing', 'quotations', 'rates'],
  tags: ['devise', 'change', 'conversion', 'multi-devises'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const sourceCurrency = (data.sourceCurrency as string) || 'DZD';
    const targetCurrency = (data.targetCurrency as string) || 'DZD';
    const amount = (data.amount as number) || 0;
    const exchangeRate = data.exchangeRate as number;
    const isInternational = data.isInternational as boolean;

    if (!isInternational || sourceCurrency === targetCurrency) {
      return { passed: true, ruleId: 'rule-currency-001', message: `Devise unique: ${sourceCurrency}`, severity: 'info' };
    }

    const supportedCurrencies = ['DZD', 'EUR', 'USD', 'GBP', 'CNY', 'AED', 'SAR', 'TRY', 'MAD', 'TND'];
    if (!supportedCurrencies.includes(sourceCurrency) || !supportedCurrencies.includes(targetCurrency)) {
      return {
        passed: false,
        ruleId: 'rule-currency-001',
        message: `Devise non supportée: ${sourceCurrency} → ${targetCurrency}`,
        severity: 'critical',
        suggestions: [`Devises supportées: ${supportedCurrencies.join(', ')}`],
      };
    }

    if (!exchangeRate || exchangeRate <= 0) {
      return {
        passed: false,
        ruleId: 'rule-currency-001',
        message: `Taux de change manquant ou invalide pour ${sourceCurrency} → ${targetCurrency}`,
        severity: 'warning',
        suggestions: [
          'Renseigner le taux de change du jour',
          'Utiliser le taux de référence de la Banque d\'Algérie',
        ],
      };
    }

    // Vérifier que le taux est dans une plage raisonnable (±30% du taux approximatif)
    const approxRates: Record<string, number> = { DZD: 1, EUR: 145, USD: 135, GBP: 170, CNY: 19, AED: 37, SAR: 36, TRY: 4, MAD: 14, TND: 44 };
    const approxCrossRate = (approxCurrencies[targetCurrency] || 1) / (approxCurrencies[sourceCurrency] || 1);

    if (Math.abs(exchangeRate - approxCrossRate) / approxCrossRate > 0.3) {
      return {
        passed: false,
        ruleId: 'rule-currency-001',
        message: `Taux de change suspect: 1 ${sourceCurrency} = ${exchangeRate} ${targetCurrency} (taux approximatif: ${approxCrossRate.toFixed(4)})`,
        severity: 'warning',
        suggestions: [
          'Vérifier le taux de change auprès de la Banque d\'Algérie',
          'Confirmer le taux avec le service financier',
        ],
        extraData: { sourceCurrency, targetCurrency, exchangeRate, approxCrossRate },
      };
    }

    const convertedAmount = Math.round(amount * exchangeRate);
    return {
      passed: true,
      ruleId: 'rule-currency-001',
      message: `Conversion: ${amount.toLocaleString()} ${sourceCurrency} = ${convertedAmount.toLocaleString()} ${targetCurrency} (taux: ${exchangeRate})`,
      severity: 'info',
      extraData: { sourceCurrency, targetCurrency, exchangeRate, convertedAmount },
    };
  },
};

// Approximate currency rates (helper - in a real app, this would be API-driven)
const approxCurrencies: Record<string, number> = { DZD: 1, EUR: 145, USD: 135, GBP: 170, CNY: 19, AED: 37, SAR: 36, TRY: 4, MAD: 14, TND: 44 };

// ─── 18. Règle de taxe algérienne (TVA + TAP) ─────────────────

const validateAlgerianTax: BusinessRule = {
  id: 'rule-tax-001',
  name: 'Conformité fiscale algérienne (TVA/TAP)',
  description: 'Calcule et vérifie la TVA (19% ou 9%) et la TAP (1%) applicables selon la nature de l\'opération',
  category: 'pricing',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'billing', 'quotations', 'invoices'],
  tags: ['TVA', 'TAP', 'fiscalité', 'Algérie'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const amountHT = (data.amountHT as number) || 0;
    const isExport = data.isExport as boolean;
    const isImport = data.isImport as boolean;
    const serviceType = (data.serviceType as string) || 'transport';
    const hasTVA = data.hasTVA as boolean;
    const hasTAP = data.hasTAP as boolean;

    // Exportations sont exonérées de TVA
    if (isExport) {
      return {
        passed: true,
        ruleId: 'rule-tax-001',
        message: 'Exportation — TVA exonérée (régime exportateur)',
        severity: 'info',
        extraData: { amountHT, tvaRate: 0, tapRate: 0, amountTTC: amountHT },
      };
    }

    // Détermination du taux de TVA
    const reducedTVAServices = ['transport_passager', 'livraison_livre', 'produit_alimentaire_premiere_necessite'];
    const tvaRate = reducedTVAServices.includes(serviceType) ? TAX_CONFIG.tvaReduced : TAX_CONFIG.tvaStandard;
    const tapRate = TAX_CONFIG.tap;
    const tvaAmount = Math.round(amountHT * tvaRate / 100);
    const tapAmount = Math.round(amountHT * tapRate / 100);
    const amountTTC = amountHT + tvaAmount + tapAmount;

    const issues: string[] = [];
    if (!hasTVA && !isExport) issues.push('TVA non appliquée sur une opération imposable');
    if (!hasTAP && !isExport) issues.push('TAP non appliquée');

    if (issues.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-tax-001',
        message: `Anomalie fiscale: ${issues.join(', ')} — TVA ${tvaRate}% + TAP ${tapRate}% attendues`,
        severity: 'warning',
        suggestions: [
          `Appliquer la TVA à ${tvaRate}%`,
          `Appliquer la TAP à ${tapRate}%`,
          'Vérifier le régime fiscal du client',
          isImport ? 'Les importations sont soumises à TVA à l\'import' : '',
        ].filter(Boolean),
        autoFix: { tvaRate, tvaAmount, tapRate, tapAmount, amountTTC },
        extraData: { amountHT, tvaRate, tvaAmount, tapRate, tapAmount, amountTTC },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-tax-001',
      message: `Fiscalité OK: HT ${amountHT.toLocaleString()} + TVA ${tvaRate}% (${tvaAmount.toLocaleString()}) + TAP ${tapRate}% (${tapAmount.toLocaleString()}) = TTC ${amountTTC.toLocaleString()} DZD`,
      severity: 'info',
      extraData: { amountHT, tvaRate, tvaAmount, tapRate, tapAmount, amountTTC },
    };
  },
};

// ─── 19. Règle de ristourne volume ─────────────────────────────

const validateVolumeDiscount: BusinessRule = {
  id: 'rule-discount-001',
  name: 'Éligibilité ristourne volume',
  description: 'Vérifie l\'éligibilité aux remises en fonction du volume d\'expéditions mensuel et du CA cumulé',
  category: 'pricing',
  severity: 'info',
  enabled: true,
  appliesTo: ['parcels', 'billing', 'quotations', 'clients'],
  tags: ['ristourne', 'remise', 'volume', 'fidélité'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const monthlyShipments = (data.monthlyShipments as number) || 0;
    const monthlyRevenue = (data.monthlyRevenue as number) || 0;
    const currentDiscount = (data.currentDiscount as number) || 0;
    const contractType = (data.contractType as string) || 'standard';

    // Barèmes de ristournes
    const discountTiers: Array<{ minShipments: number; minRevenue: number; discount: number; tier: string }> = [
      { minShipments: 100, minRevenue: 500000, discount: 3, tier: 'Bronze' },
      { minShipments: 300, minRevenue: 1500000, discount: 5, tier: 'Argent' },
      { minShipments: 500, minRevenue: 3000000, discount: 8, tier: 'Or' },
      { minShipments: 1000, minRevenue: 7000000, discount: 12, tier: 'Platine' },
      { minShipments: 2000, minRevenue: 15000000, discount: 15, tier: 'Diamant' },
    ];

    // Trouver le meilleur palier applicable
    const applicableTier = [...discountTiers].reverse().find(t =>
      monthlyShipments >= t.minShipments && monthlyRevenue >= t.minRevenue
    );

    if (!applicableTier) {
      if (currentDiscount > 0) {
        return {
          passed: false,
          ruleId: 'rule-discount-001',
          message: `Remise ${currentDiscount}% appliquée mais le client n'est plus éligible (seuil minimum: 100 expéditions/mois et 500 000 DZD/mois)`,
          severity: 'warning',
          suggestions: ['Réévaluer la remise', 'Négocier de nouvelles conditions'],
          autoFix: { currentDiscount: 0 },
        };
      }
      return {
        passed: true,
        ruleId: 'rule-discount-001',
        message: `Pas de ristourne applicable (${monthlyShipments} expéditions, ${monthlyRevenue.toLocaleString()} DZD/mois)`,
        severity: 'info',
      };
    }

    const eligibleDiscount = applicableTier.discount;
    if (currentDiscount !== eligibleDiscount) {
      return {
        passed: false,
        ruleId: 'rule-discount-001',
        message: `Palier ${applicableTier.tier}: remise éligible ${eligibleDiscount}% vs remise actuelle ${currentDiscount}%`,
        severity: currentDiscount > eligibleDiscount ? 'warning' : 'info',
        suggestions: currentDiscount > eligibleDiscount
          ? ['La remise actuelle dépasse l\'éligibilité — ajuster']
          : [`Augmenter la remise à ${eligibleDiscount}% (palier ${applicableTier.tier})`],
        autoFix: { currentDiscount: eligibleDiscount },
        extraData: { tier: applicableTier.tier, eligibleDiscount, monthlyShipments, monthlyRevenue },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-discount-001',
      message: `Palier ${applicableTier.tier} — remise ${eligibleDiscount}% correcte (${monthlyShipments} expéditions, ${monthlyRevenue.toLocaleString()} DZD/mois)`,
      severity: 'info',
      extraData: { tier: applicableTier.tier, eligibleDiscount },
    };
  },
};

// ─── 20. Règle de détection doublon ────────────────────────────

const validateDuplicate: BusinessRule = {
  id: 'rule-duplicate-001',
  name: 'Détection de doublon',
  description: 'Détecte les expéditions en double basées sur les données d\'expédition similaires',
  category: 'validation',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'shipments'],
  tags: ['doublon', 'détection', 'qualité'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const senderName = ((data.senderName as string) || '').toLowerCase().trim();
    const receiverName = ((data.receiverName as string) || '').toLowerCase().trim();
    const weight = (data.weightKg as number) || 0;
    const destinationCity = ((data.destinationCity as string) || '').toLowerCase().trim();
    const action = ctx.action;

    // Only check on create
    if (action !== 'create') {
      return { passed: true, ruleId: 'rule-duplicate-001', message: 'Vérification doublon non applicable', severity: 'info' };
    }

    // Check for existing parcels with same sender+receiver+weight+destination within last 24h
    const existingParcels = (ctx.metadata?.recentParcels as Array<Record<string, unknown>>) || [];
    const now = new Date();
    const duplicates = existingParcels.filter(p => {
      const pDate = new Date((p.createdAt as string) || '');
      const hoursDiff = (now.getTime() - pDate.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) return false;

      const pSender = ((p.senderName as string) || '').toLowerCase().trim();
      const pReceiver = ((p.receiverName as string) || '').toLowerCase().trim();
      const pWeight = (p.weightKg as number) || 0;
      const pDest = ((p.destinationCity as string) || '').toLowerCase().trim();

      return pSender === senderName && pReceiver === receiverName && pWeight === weight && pDest === destinationCity;
    });

    if (duplicates.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-duplicate-001',
        message: `Doublon potentiel détecté: ${duplicates.length} expédition(s) similaire(s) dans les dernières 24h`,
        severity: 'warning',
        suggestions: [
          'Vérifier qu\'il ne s\'agit pas d\'un doublon accidentel',
          'Confirmer l\'expédition si elle est intentionnelle',
          `Références similaires: ${duplicates.map(p => p.trackingNumber || p.id).join(', ')}`,
        ],
        extraData: { duplicateCount: duplicates.length, duplicateIds: duplicates.map(p => p.id) },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-duplicate-001',
      message: 'Aucun doublon détecté',
      severity: 'info',
    };
  },
};

// ─── 21. Règle de liste noire client/transporteur ──────────────

const validateBlacklist: BusinessRule = {
  id: 'rule-blacklist-001',
  name: 'Vérification liste noire',
  description: 'Vérifie que le client et le transporteur ne sont pas sur la liste noire (fraude, non-paiement, sanctions)',
  category: 'compliance',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'shipments', 'billing', 'clients'],
  tags: ['liste noire', 'fraude', 'sanctions', 'risque'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const clientId = data.clientId as string;
    const clientName = (data.clientName as string) || '';
    const carrierId = data.carrierId as string;
    const carrierName = (data.carrier as string) || '';
    const isClientBlacklisted = data.isClientBlacklisted as boolean;
    const isCarrierBlacklisted = data.isCarrierBlacklisted as boolean;
    const clientFraudScore = (data.clientFraudScore as number) || 0;
    const destinationCountry = ((data.destinationCountry as string) || '').toUpperCase();

    const issues: string[] = [];

    if (isClientBlacklisted) {
      issues.push(`Client "${clientName}" sur liste noire`);
    }

    if (isCarrierBlacklisted) {
      issues.push(`Transporteur "${carrierName}" sur liste noire`);
    }

    if (clientFraudScore >= 80) {
      issues.push(`Score de fraude élevé: ${clientFraudScore}/100`);
    }

    // Vérification pays à haut risque
    if (HIGH_RISK_COUNTRIES.some(c => destinationCountry.includes(c)) && (data.orderAmount as number) > 200000) {
      issues.push(`Destination haute risque + montant élevé — vérification renforcée requise`);
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-blacklist-001',
        message: `ALERTE LISTE NOIRE — ${issues.join(' | ')}`,
        severity: 'critical',
        suggestions: [
          'Bloquer la commande jusqu\'à vérification',
          'Contacter le service juridique/conformité',
          'Exiger un paiement garanti (caution, LC)',
          'Appliquer les procédures KYC (Know Your Customer)',
        ],
        extraData: { isClientBlacklisted, isCarrierBlacklisted, clientFraudScore },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-blacklist-001',
      message: 'Client et transporteur non listés sur liste noire',
      severity: 'info',
    };
  },
};

// ─── 22. Règle de charge minimale ──────────────────────────────

const validateMinimumCharge: BusinessRule = {
  id: 'rule-min-charge-001',
  name: 'Charge minimale applicable',
  description: 'Vérifie que le prix facturé n\'est pas inférieur à la charge minimale applicable par service et par route',
  category: 'pricing',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'billing', 'quotations'],
  tags: ['prix minimum', 'charge', 'tarification'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const calculatedPrice = (data.calculatedPrice as number) || 0;
    const serviceLevel = (data.serviceLevel as string) || 'standard';
    const isInternational = data.isInternational as boolean;

    const minimumCharges: Record<string, { domestic: number; international: number }> = {
      economy: { domestic: 300, international: 2000 },
      standard: { domestic: 500, international: 3500 },
      express: { domestic: 800, international: 6000 },
      same_day: { domestic: 1500, international: 12000 },
      next_day: { domestic: 1000, international: 8000 },
    };

    const charge = minimumCharges[serviceLevel];
    if (!charge) {
      return { passed: true, ruleId: 'rule-min-charge-001', message: 'Pas de charge minimale définie pour ce service', severity: 'info' };
    }

    const minCharge = isInternational ? charge.international : charge.domestic;

    if (calculatedPrice < minCharge) {
      return {
        passed: false,
        ruleId: 'rule-min-charge-001',
        message: `Prix ${calculatedPrice.toLocaleString()} DZD inférieur à la charge minimale ${minCharge.toLocaleString()} DZD (${serviceLevel}, ${isInternational ? 'international' : 'domestique'})`,
        severity: 'warning',
        suggestions: [
          `Appliquer la charge minimale de ${minCharge.toLocaleString()} DZD`,
          'Vérifier le calcul de prix',
          'Envisager un autre niveau de service',
        ],
        autoFix: { calculatedPrice: minCharge },
        extraData: { minCharge, serviceLevel, isInternational },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-min-charge-001',
      message: `Prix ${calculatedPrice.toLocaleString()} DZD >= charge minimale ${minCharge.toLocaleString()} DZD`,
      severity: 'info',
    };
  },
};

// ─── 23. Règle d'expiration des documents ──────────────────────

const validateDocumentExpiry: BusinessRule = {
  id: 'rule-doc-expiry-001',
  name: 'Expiration des documents',
  description: 'Vérifie que les documents réglementaires (permis, licences, certificats) ne sont pas expirés ou proches de l\'expiration',
  category: 'compliance',
  severity: 'critical',
  enabled: true,
  appliesTo: ['ground-transport', 'fleet', 'drivers', 'maritime', 'customs'],
  tags: ['document', 'expiration', 'permis', 'licence'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const documents = (data.documents as Array<{ name: string; expiryDate: string; type: string }>) || [];
    const now = new Date();

    const expired: string[] = [];
    const expiringSoon: string[] = []; // < 30 jours
    const expiringWarning: string[] = []; // < 90 jours

    documents.forEach(doc => {
      if (!doc.expiryDate) return;
      const expiry = new Date(doc.expiryDate);
      const daysToExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      if (daysToExpiry < 0) {
        expired.push(`${doc.name} (expiré depuis ${Math.abs(Math.round(daysToExpiry))} jour(s))`);
      } else if (daysToExpiry < 30) {
        expiringSoon.push(`${doc.name} (expire dans ${Math.round(daysToExpiry)} jour(s))`);
      } else if (daysToExpiry < 90) {
        expiringWarning.push(`${doc.name} (expire dans ${Math.round(daysToExpiry)} jour(s))`);
      }
    });

    if (expired.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-doc-expiry-001',
        message: `DOCUMENTS EXPIRÉS: ${expired.join(', ')}`,
        severity: 'critical',
        suggestions: [
          'Renouveler immédiatement les documents expirés',
          'Suspendre les opérations nécessitant ces documents',
          'Contacter l\'autorité compétente pour le renouvellement',
        ],
        extraData: { expired, expiringSoon, expiringWarning },
      };
    }

    if (expiringSoon.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-doc-expiry-001',
        message: `DOCUMENTS PROCHES DE L'EXPIRATION: ${expiringSoon.join(', ')}`,
        severity: 'warning',
        suggestions: [
          'Lancer la procédure de renouvellement',
          'Planifier les visites médicales/techniques si nécessaires',
        ],
        extraData: { expiringSoon, expiringWarning },
      };
    }

    if (expiringWarning.length > 0) {
      return {
        passed: true,
        ruleId: 'rule-doc-expiry-001',
        message: `Documents à surveiller: ${expiringWarning.join(', ')}`,
        severity: 'info',
        suggestions: ['Prévoir le renouvellement dans les 90 jours'],
        extraData: { expiringWarning },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-doc-expiry-001',
      message: 'Tous les documents sont à jour',
      severity: 'info',
    };
  },
};

// ─── 24. Règle de performance transporteur ─────────────────────

const validateCarrierPerformance: BusinessRule = {
  id: 'rule-carrier-perf-001',
  name: 'Score de performance transporteur',
  description: 'Évalue la performance du transporteur basée sur les retards, les dommages, les réclamations et la qualité de service',
  category: 'operational',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'shipments', 'partners'],
  tags: ['transporteur', 'performance', 'KPI', 'qualité'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const carrierName = (data.carrier as string) || '';
    const onTimeRate = (data.onTimeDeliveryRate as number) || 100;
    const damageRate = (data.damageRate as number) || 0;
    const claimsRate = (data.claimsRate as number) || 0;
    const avgTransitTime = (data.avgTransitTimeHours as number) || 0;
    const slaComplianceRate = (data.slaComplianceRate as number) || 100;

    // Score composite (0-100)
    const onTimeScore = onTimeRate * 0.35;
    const damageScore = Math.max(0, 100 - damageRate * 10) * 0.25;
    const claimsScore = Math.max(0, 100 - claimsRate * 5) * 0.2;
    const slaScore = slaComplianceRate * 0.2;
    const performanceScore = Math.round(onTimeScore + damageScore + claimsScore + slaScore);

    let rating: string;
    let ratingColor: string;
    if (performanceScore >= 90) { rating = 'A — Excellent'; ratingColor = 'green'; }
    else if (performanceScore >= 75) { rating = 'B — Bon'; ratingColor = 'blue'; }
    else if (performanceScore >= 60) { rating = 'C — Moyen'; ratingColor = 'amber'; }
    else if (performanceScore >= 40) { rating = 'D — Faible'; ratingColor = 'orange'; }
    else { rating = 'F — Critique'; ratingColor = 'red'; }

    const issues: string[] = [];
    if (onTimeRate < 85) issues.push(`Taux à l'heure faible: ${onTimeRate}%`);
    if (damageRate > 2) issues.push(`Taux de dommage élevé: ${damageRate}%`);
    if (claimsRate > 5) issues.push(`Taux de réclamation élevé: ${claimsRate}%`);
    if (slaComplianceRate < 80) issues.push(`Conformité SLA faible: ${slaComplianceRate}%`);

    if (performanceScore < 60) {
      return {
        passed: false,
        ruleId: 'rule-carrier-perf-001',
        message: `Transporteur "${carrierName}" — Score ${performanceScore}/100 (${rating}): ${issues.join(', ')}`,
        severity: performanceScore < 40 ? 'critical' : 'warning',
        suggestions: [
          'Envisager un changement de transporteur',
          'Négocier des conditions améliorées',
          'Mettre en place un plan d\'amélioration',
          'Diversifier les partenaires logistiques',
        ],
        extraData: { performanceScore, rating, onTimeRate, damageRate, claimsRate, slaComplianceRate },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-carrier-perf-001',
      message: `Transporteur "${carrierName}" — Score ${performanceScore}/100 (${rating})`,
      severity: 'info',
      extraData: { performanceScore, rating, onTimeRate, damageRate, claimsRate },
    };
  },
};

// ─── 25. Règle de capacité entrepôt ────────────────────────────

const validateWarehouseCapacity: BusinessRule = {
  id: 'rule-warehouse-001',
  name: 'Capacité entrepôt',
  description: 'Vérifie que la capacité de l\'entrepôt n\'est pas dépassée et que les zones sont correctement utilisées',
  category: 'operational',
  severity: 'warning',
  enabled: true,
  appliesTo: ['warehouse', 'parcels'],
  tags: ['entrepôt', 'capacité', 'zone', 'stockage'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const currentOccupancy = (data.currentOccupancy as number) || 0;
    const maxCapacity = (data.maxCapacity as number) || 100;
    const zoneOccupancy = data.zoneOccupancy as Record<string, number>;
    const pendingInbound = (data.pendingInbound as number) || 0;

    const occupancyRate = currentOccupancy / maxCapacity;
    const projectedOccupancy = (currentOccupancy + pendingInbound) / maxCapacity;

    if (projectedOccupancy > 1) {
      return {
        passed: false,
        ruleId: 'rule-warehouse-001',
        message: `SURCAPACITÉ PROJETÉE: ${(projectedOccupancy * 100).toFixed(0)}% avec ${pendingInbound} arrivées en attente (capacité max: ${maxCapacity})`,
        severity: 'critical',
        suggestions: [
          'Réorganiser l\'entrepôt pour optimiser l\'espace',
          'Reporter les arrivées non urgentes',
          'Trouver un espace de stockage temporaire',
          'Prioriser les expéditions sortantes',
        ],
        extraData: { occupancyRate, projectedOccupancy, currentOccupancy, maxCapacity, pendingInbound },
      };
    }

    if (occupancyRate > 0.85) {
      return {
        passed: false,
        ruleId: 'rule-warehouse-001',
        message: `Capacité élevée: ${(occupancyRate * 100).toFixed(0)}% (${currentOccupancy}/${maxCapacity}) — zone critique si arrivées en attente`,
        severity: 'warning',
        suggestions: [
          'Accélérer les expéditions sortantes',
          'Planifier les arrivées futures',
          'Vérifier les zones sous-utilisées',
        ],
        extraData: { occupancyRate, projectedOccupancy },
      };
    }

    // Vérifier les zones individuelles
    if (zoneOccupancy) {
      const overloadedZones = Object.entries(zoneOccupancy)
        .filter(([, rate]) => rate > 0.9)
        .map(([zone, rate]) => `${zone}: ${(rate * 100).toFixed(0)}%`);
      if (overloadedZones.length > 0) {
        return {
          passed: false,
          ruleId: 'rule-warehouse-001',
          message: `Zones surchargées: ${overloadedZones.join(', ')}`,
          severity: 'warning',
          suggestions: ['Redistribuer les stocks vers des zones moins occupées'],
          extraData: { zoneOccupancy, overloadedZones },
        };
      }
    }

    return {
      passed: true,
      ruleId: 'rule-warehouse-001',
      message: `Capacité entrepôt OK: ${(occupancyRate * 100).toFixed(0)}% (${currentOccupancy}/${maxCapacity})`,
      severity: 'info',
    };
  },
};

// ─── 26. Règle de batterie lithium ─────────────────────────────

const validateLithiumBattery: BusinessRule = {
  id: 'rule-battery-001',
  name: 'Restrictions batteries lithium',
  description: 'Vérifie la conformité des expéditions contenant des batteries lithium (UN3480, UN3481, UN3090, UN3091) selon les réglementations IATA/ADR',
  category: 'safety',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'ground-transport'],
  tags: ['batterie', 'lithium', 'IATA', 'UN3480'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const description = ((data.description as string) || '').toUpperCase();
    const unCode = ((data.unCode as string) || '').toUpperCase();
    const transportMode = (data.transportMode as string) || 'parcel';
    const batteryWh = (data.batteryWattHours as number) || 0;
    const batteryCount = (data.batteryCount as number) || 0;
    const hasUN3480Label = data.hasUN3480Label as boolean;
    const hasUN3481Label = data.hasUN3481Label as boolean;
    const isPI966 = data.isPI966 as boolean; // Contained in equipment
    const isPI967 = data.isPI967 as boolean; // Packed with equipment

    const lithiumKeywords = ['LITHIUM', 'LI-ION', 'LI-PO', 'BATTERIE', 'ACCUMULATEUR', 'POWER BANK', 'PHONE', 'TABLETTE', 'ORDINATEUR PORTABLE', 'PC PORTABLE'];
    const isLithiumBattery = lithiumKeywords.some(kw => description.includes(kw))
      || ['UN3480', 'UN3481', 'UN3090', 'UN3091'].some(code => unCode.includes(code));

    if (!isLithiumBattery) {
      return { passed: true, ruleId: 'rule-battery-001', message: 'Pas de batterie lithium détectée', severity: 'info' };
    }

    const issues: string[] = [];

    // Restrictions par mode
    if (transportMode === 'air' || transportMode === 'air-freight') {
      // UN3480 (batteries seules) interdit en cargo passager
      if (unCode.includes('UN3480') && batteryWh > 100) {
        issues.push('Batteries lithium seules > 100Wh INTERDITES en fret aérien passager');
      }
      if (batteryWh > 160) {
        issues.push('Batteries > 160Wh interdites en fret aérien (sauf dérogation)');
      }
    }

    // Quantité limite par colis
    if (transportMode === 'parcel') {
      if (batteryCount > 2 && !isPI966 && !isPI967) {
        issues.push(`Max 2 batteries lithium seules par colis (${batteryCount} détectées)`);
      }
      if (batteryWh > 100 && !isPI966 && !isPI967) {
        issues.push(`Batterie ${batteryWh}Wh — limite 100Wh pour envoi colis standard`);
      }
    }

    // Étiquetage
    if (!hasUN3480Label && unCode.includes('UN3480')) {
      issues.push('Étiquette UN3480 manquante');
    }
    if (!hasUN3481Label && unCode.includes('UN3481')) {
      issues.push('Étiquette UN3481 manquante');
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-battery-001',
        message: `BATTERIES LITHIUM — ${issues.join(' | ')}`,
        severity: 'critical',
        suggestions: [
          'Vérifier la conformité IATA PI966/PI967',
          'Apposer les étiquettes UN3480/UN3481',
          'Limiter à 2 batteries par colis',
          'Utiliser un emballage conforme Section II IATA',
          'Pour batteries > 100Wh: utiliser le fret cargo uniquement',
        ],
        extraData: { batteryWh, batteryCount, isPI966, isPI967, transportMode },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-battery-001',
      message: `Batteries lithium conformes (${batteryWh}Wh, ${batteryCount} unité(s))`,
      severity: 'info',
    };
  },
};

// ─── 27. Règle de surcharge haute saison ───────────────────────

const validatePeakSeasonSurcharge: BusinessRule = {
  id: 'rule-peak-001',
  name: 'Surcharge haute saison',
  description: 'Applique les surcharges saisonnières (Ramadan, Aïd, fin d\'année, Soldes) automatiquement',
  category: 'pricing',
  severity: 'info',
  enabled: true,
  appliesTo: ['parcels', 'shipments', 'billing', 'quotations', 'rates'],
  tags: ['saison', 'Ramadan', 'surcharge', 'tarification'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const shipmentDate = (data.shipmentDate as string) || new Date().toISOString();
    const destinationRegion = (data.destinationRegion as string) || 'national';
    const currentSurcharges = data.peakSurcharges as boolean;

    const date = new Date(shipmentDate);
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Périodes de haute saison en Algérie
    const peakPeriods: Array<{ name: string; startMonth: number; startDay: number; endMonth: number; endDay: number; surcharge: number; regions: string[] }> = [
      { name: 'Ramadan', startMonth: 3, startDay: 1, endMonth: 4, endDay: 15, surcharge: 15, regions: ['national', 'maghreb'] },
      { name: 'Aïd al-Fitr', startMonth: 4, startDay: 10, endMonth: 4, endDay: 25, surcharge: 20, regions: ['national', 'maghreb'] },
      { name: 'Aïd al-Adha', startMonth: 6, startDay: 10, endMonth: 6, endDay: 25, surcharge: 25, regions: ['national', 'maghreb'] },
      { name: 'Rentrée scolaire', startMonth: 8, startDay: 20, endMonth: 9, endDay: 15, surcharge: 10, regions: ['national'] },
      { name: 'Fin d\'année / Fêtes', startMonth: 12, startDay: 10, endMonth: 12, endDay: 31, surcharge: 18, regions: ['national', 'international', 'europe'] },
      { name: 'Black Friday / Soldes', startMonth: 11, startDay: 20, endMonth: 11, endDay: 30, surcharge: 12, regions: ['national', 'international'] },
    ];

    const applicablePeriods = peakPeriods.filter(period => {
      const isAfterStart = month > period.startMonth || (month === period.startMonth && day >= period.startDay);
      const isBeforeEnd = month < period.endMonth || (month === period.endMonth && day <= period.endDay);
      const isRegionMatch = period.regions.includes(destinationRegion) || period.regions.includes('all');
      return isAfterStart && isBeforeEnd && isRegionMatch;
    });

    if (applicablePeriods.length === 0) {
      return {
        passed: true,
        ruleId: 'rule-peak-001',
        message: 'Pas de surcharge saisonnière applicable',
        severity: 'info',
      };
    }

    const maxSurcharge = Math.max(...applicablePeriods.map(p => p.surcharge));
    const periodNames = applicablePeriods.map(p => p.name).join(', ');

    return {
      passed: true,
      ruleId: 'rule-peak-001',
      message: `SURCHAISON SAISONNIÈRE: +${maxSurcharge}% (${periodNames})`,
      severity: 'info',
      suggestions: [
        `Appliquer la surcharge de ${maxSurcharge}% pour la période ${periodNames}`,
        'Informer le client de la surcharge saisonnière',
        'Proposer un report si possible pour éviter la surcharge',
      ],
      autoFix: { peakSurchargeRate: maxSurcharge, peakPeriodName: periodNames },
      extraData: { peakPeriods: applicablePeriods, maxSurcharge, periodNames },
    };
  },
};

// ─── 28. Règle de consolidation ────────────────────────────────

const validateConsolidation: BusinessRule = {
  id: 'rule-consolidation-001',
  name: 'Opportunité de consolidation',
  description: 'Détecte les opportunités de regrouper des expéditions vers la même destination pour optimiser les coûts',
  category: 'operational',
  severity: 'info',
  enabled: true,
  appliesTo: ['shipments', 'parcels', 'warehouse'],
  tags: ['consolidation', 'groupage', 'optimisation'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const destinationCity = (data.destinationCity as string) || '';
    const destinationCountry = (data.destinationCountry as string) || '';
    const serviceLevel = (data.serviceLevel as string) || 'standard';
    const scheduledDate = data.scheduledDate as string;

    // Check for other shipments going to same destination
    const pendingShipments = (ctx.metadata?.pendingShipments as Array<Record<string, unknown>>) || [];
    const candidates = pendingShipments.filter(s => {
      const sDestCity = (s.destinationCity as string) || '';
      const sDestCountry = (s.destinationCountry as string) || '';
      const sService = (s.serviceLevel as string) || '';
      const sDate = s.scheduledDate as string;

      return (
        (sDestCity === destinationCity || sDestCountry === destinationCountry)
        && sService === serviceLevel
        && sDate === scheduledDate
      );
    });

    if (candidates.length >= 2) {
      const estimatedSaving = Math.round(candidates.length * 0.15 * ((data.orderAmount as number) || 5000));

      return {
        passed: true,
        ruleId: 'rule-consolidation-001',
        message: `CONSOLIDATION POSSIBLE: ${candidates.length + 1} expéditions vers ${destinationCity || destinationCountry} — économie estimée ~${estimatedSaving.toLocaleString()} DZD`,
        severity: 'info',
        suggestions: [
          'Regrouper les expéditions dans un même envoi',
          `Économie estimée: ~${(candidates.length * 15)}% sur les coûts de transport`,
          'Vérifier la compatibilité des marchandises',
          'Planifier un ramassage groupé',
        ],
        extraData: { candidateCount: candidates.length, estimatedSaving, destination: destinationCity || destinationCountry },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-consolidation-001',
      message: 'Pas d\'opportunité de consolidation détectée',
      severity: 'info',
    };
  },
};

// ─── 29. Règle d'emballage requis ──────────────────────────────

const validatePackaging: BusinessRule = {
  id: 'rule-packaging-001',
  name: 'Exigences d\'emballage',
  description: 'Vérifie que l\'emballage est adapté au type de marchandise et au mode de transport',
  category: 'validation',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'shipments', 'warehouse'],
  tags: ['emballage', 'conditionnement', 'norme'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const description = ((data.description as string) || '').toUpperCase();
    const packagingType = (data.packagingType as string) || '';
    const isFragile = data.isFragile as boolean;
    const isHeavy = (data.weightKg as number) > 20;
    const isInternational = data.isInternational as boolean;
    const transportMode = (data.transportMode as string) || 'parcel';

    const issues: string[] = [];

    // Détection de fragilité
    const fragileKeywords = ['VERRE', 'CERAMIQUE', 'FRAGILE', 'ÉCRAN', 'MONITEUR', 'MIROIR', 'PORCELAINE', 'OPTIQUE', 'INSTRUMENT'];
    const isDetectedFragile = fragileKeywords.some(kw => description.includes(kw));

    if ((isFragile || isDetectedFragile) && !packagingType.includes('renforce') && !packagingType.includes('bulle') && !packagingType.includes('mousse')) {
      issues.push('Article fragile sans emballage renforcé détecté');
    }

    // Articles lourds nécessitant une palette
    if (isHeavy && !packagingType.includes('palette') && !packagingType.includes('caisse')) {
      issues.push(`Article lourd (${data.weightKg}kg) — palette ou caisse recommandée`);
    }

    // International nécessite emballage renforcé
    if (isInternational && (!packagingType || packagingType.includes('souple') || packagingType.includes('sac'))) {
      issues.push('Emballage insuffisant pour transport international');
    }

    // Maritime nécessite protection humidité
    if (transportMode === 'maritime' && !packagingType.includes('étanche') && !packagingType.includes('humidité')) {
      issues.push('Protection contre l\'humidité recommandée pour le transport maritime');
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-packaging-001',
        message: `EMBALLAGE — ${issues.join(' | ')}`,
        severity: 'warning',
        suggestions: [
          isFragile || isDetectedFragile ? 'Utiliser un emballage bulle + carton double cannelure' : '',
          isHeavy ? 'Utiliser une palette avec arrimage' : '',
          isInternational ? 'Double emballage pour résister aux manipulations multiples' : '',
          transportMode === 'maritime' ? 'Ajouter un sachet déshydratant et film étirable' : '',
        ].filter(Boolean),
        extraData: { packagingType, isFragile: isFragile || isDetectedFragile, isHeavy, isInternational, transportMode },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-packaging-001',
      message: `Emballage adapté: ${packagingType || 'standard'}`,
      severity: 'info',
    };
  },
};

// ─── 30. Règle de fenêtre de livraison ─────────────────────────

const validateDeliveryWindow: BusinessRule = {
  id: 'rule-delivery-window-001',
  name: 'Fenêtre de livraison',
  description: 'Vérifie que la livraison est planifiée dans la fenêtre horaire autorisée (heures ouvrables, restrictions urbaines)',
  category: 'operational',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'ground-transport', 'shipments'],
  tags: ['livraison', 'fenêtre', 'horaire', 'restriction'],
  version: '1.0',
  evaluate: (ctx) => {
    const data = ctx.data;
    const plannedDeliveryDate = data.plannedDeliveryDate as string;
    const deliveryTimeSlot = data.deliveryTimeSlot as string;
    const destinationCity = ((data.destinationCity as string) || '').toUpperCase();
    const isInternational = data.isInternational as boolean;

    if (!plannedDeliveryDate) {
      return { passed: true, ruleId: 'rule-delivery-window-001', message: 'Pas de date de livraison planifiée', severity: 'info' };
    }

    const deliveryDate = new Date(plannedDeliveryDate);
    const dayOfWeek = deliveryDate.getDay(); // 0=dimanche
    const hour = deliveryDate.getHours();

    const issues: string[] = [];

    // Vendredi en Algérie: jour férié (repos hebdomadaire)
    if (dayOfWeek === 5) {
      issues.push('Vendredi — jour férié en Algérie, livraison limitée');
    }

    // Heures ouvrables: 8h-17h
    if (hour < 8 || hour >= 17) {
      issues.push(`Heure de livraison ${hour}h en dehors des heures ouvrables (8h-17h)`);
    }

    // Restrictions centre-ville Alger
    if (destinationCity.includes('ALGER') || destinationCity.includes('ALGIERS')) {
      if (dayOfWeek !== 0 && dayOfWeek !== 5 && hour >= 7 && hour <= 9) {
        issues.push('Restriction circulation Alger centre: 7h-9h en semaine');
      }
    }

    // Dimanche: livraison possible mais surcharge
    if (dayOfWeek === 0) {
      issues.push('Dimanche — livraison possible avec surcharge weekend');
    }

    if (issues.length > 0) {
      return {
        passed: false,
        ruleId: 'rule-delivery-window-001',
        message: `FENÊTRE DE LIVRAISON — ${issues.join(' | ')}`,
        severity: 'warning',
        suggestions: [
          'Replanifier la livraison en heures ouvrables',
          dayOfWeek === 5 ? 'Reporter au samedi ou lundi' : '',
          destinationCity.includes('ALGER') ? 'Éviter les heures de pointe (7h-9h) à Alger' : '',
          dayOfWeek === 0 ? 'Appliquer la surcharge weekend si applicable' : '',
        ].filter(Boolean),
        extraData: { dayOfWeek, hour, isFriday: dayOfWeek === 5, isSunday: dayOfWeek === 0 },
      };
    }

    return {
      passed: true,
      ruleId: 'rule-delivery-window-001',
      message: `Fenêtre de livraison OK — ${plannedDeliveryDate}`,
      severity: 'info',
    };
  },
};

// ─── Registre de toutes les règles ─────────────────────────────

export const allBusinessRules: BusinessRule[] = [
  // Validation
  validateDimensions,
  validateCarrierRestrictions,
  validatePrintLimit,
  validateDuplicate,
  validatePackaging,
  // Pricing
  validateVolumetricWeight,
  validateLateDeliveryPenalty,
  validateCurrency,
  validateAlgerianTax,
  validateVolumeDiscount,
  validateMinimumCharge,
  validatePeakSeasonSurcharge,
  // Compliance
  validateInsurance,
  validateSLA,
  validateProofPhoto,
  validateDriverCompliance,
  validateDocumentExpiry,
  validateBlacklist,
  validateDeliveryWindow,
  // Customs
  validateCustomsCompliance,
  validateAlgerianCustoms,
  // Safety
  validateDangerousGoods,
  validateTemperatureControl,
  validateLithiumBattery,
  // Operational
  validateContainer,
  validateCarrierPerformance,
  validateWarehouseCapacity,
  validateConsolidation,
  // Compliance (embargo)
  validateEmbargo,
];

// ─── Moteur d'évaluation ───────────────────────────────────────

/**
 * Évalue toutes les règles applicables à un contexte donné.
 */
export function evaluateRules(context: RuleContext): RuleEvaluationSummary {
  const applicableRules = allBusinessRules.filter(
    rule => rule.enabled && rule.appliesTo.includes(context.module)
  );

  const results = applicableRules.map(rule => rule.evaluate(context));

  const critical = results.filter(r => !r.passed && r.severity === 'critical').length;
  const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;
  const info = results.filter(r => !r.passed && r.severity === 'info').length;
  const failed = results.filter(r => !r.passed).length;
  const passed = results.filter(r => r.passed).length;

  // Compliance score: 100 - weighted penalties
  const penaltyScore = critical * 15 + warnings * 5 + info * 1;
  const complianceScore = Math.max(0, Math.min(100, 100 - penaltyScore));

  return {
    totalRules: applicableRules.length,
    passed,
    failed,
    critical,
    warnings,
    info,
    results,
    canProceed: critical === 0,
    complianceScore,
  };
}

/**
 * Évalue une seule règle par son ID.
 */
export function evaluateSingleRule(ruleId: string, context: RuleContext): RuleResult | null {
  const rule = allBusinessRules.find(r => r.id === ruleId);
  if (!rule || !rule.enabled) return null;
  return rule.evaluate(context);
}

/**
 * Obtient les règles par catégorie.
 */
export function getRulesByCategory(category: RuleCategory): BusinessRule[] {
  return allBusinessRules.filter(r => r.category === category);
}

/**
 * Obtient les règles applicables à un module.
 */
export function getRulesForModule(module: string): BusinessRule[] {
  return allBusinessRules.filter(r => r.enabled && r.appliesTo.includes(module));
}

/**
 * Obtient toutes les catégories de règles avec leur compte.
 */
export function getRuleCategoryStats(): Record<RuleCategory, { count: number; enabled: number }> {
  const categories: RuleCategory[] = ['validation', 'compliance', 'pricing', 'workflow', 'safety', 'customs', 'credit', 'operational', 'environmental'];
  return Object.fromEntries(
    categories.map(cat => {
      const rules = allBusinessRules.filter(r => r.category === cat);
      return [cat, { count: rules.length, enabled: rules.filter(r => r.enabled).length }];
    })
  ) as Record<RuleCategory, { count: number; enabled: number }>;
}

// ─── Transitions de statut ─────────────────────────────────────

export type ParcelStatus = 'picked_up' | 'in_warehouse' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'damaged' | 'lost';
export type ShipmentStatus = 'en_attente' | 'confirmee' | 'en_transit' | 'livree' | 'retardee' | 'annulee';

interface StatusTransition {
  from: string;
  to: string;
  requiredRole: string[];
  requiredDocuments?: string[];
  requiresPhoto?: boolean;
  requiresApproval?: boolean;
  approvalLevel?: 'manager' | 'admin' | 'board';
  autoNotify?: boolean;
  /** SLA impact when this transition occurs late */
  slaImpact?: 'none' | 'warning' | 'breach';
}

export const parcelStatusTransitions: StatusTransition[] = [
  { from: 'picked_up', to: 'in_warehouse', requiredRole: ['admin', 'manager', 'agent'], autoNotify: true },
  { from: 'in_warehouse', to: 'in_transit', requiredRole: ['admin', 'manager', 'agent'], requiredDocuments: ['label'], autoNotify: true },
  { from: 'in_transit', to: 'out_for_delivery', requiredRole: ['admin', 'manager', 'agent'], autoNotify: true },
  { from: 'out_for_delivery', to: 'delivered', requiredRole: ['admin', 'manager', 'agent'], requiresPhoto: true, autoNotify: true },
  { from: 'in_transit', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true, approvalLevel: 'manager', autoNotify: true },
  { from: 'out_for_delivery', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true, approvalLevel: 'manager', autoNotify: true },
  { from: 'delivered', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true, approvalLevel: 'admin', autoNotify: true },
  { from: 'picked_up', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true },
  { from: 'in_warehouse', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true },
  // New: Damaged status
  { from: 'in_transit', to: 'damaged', requiredRole: ['admin', 'manager', 'agent'], requiresPhoto: true, requiresApproval: true, approvalLevel: 'manager', autoNotify: true, slaImpact: 'breach' },
  { from: 'out_for_delivery', to: 'damaged', requiredRole: ['admin', 'manager', 'agent'], requiresPhoto: true, requiresApproval: true, approvalLevel: 'manager', autoNotify: true, slaImpact: 'breach' },
  { from: 'in_warehouse', to: 'damaged', requiredRole: ['admin', 'manager', 'agent'], requiresPhoto: true, autoNotify: true, slaImpact: 'warning' },
  // New: Lost status
  { from: 'in_transit', to: 'lost', requiredRole: ['admin', 'manager'], requiresApproval: true, approvalLevel: 'admin', autoNotify: true, slaImpact: 'breach' },
  { from: 'in_warehouse', to: 'lost', requiredRole: ['admin', 'manager'], requiresApproval: true, approvalLevel: 'admin', autoNotify: true, slaImpact: 'breach' },
];

export function canTransitionStatus(
  from: string,
  to: string,
  userRole: string,
  hasPhoto: boolean = false,
  hasDocuments: string[] = []
): { allowed: boolean; reason?: string; requiresApproval?: boolean; approvalLevel?: string } {
  const transition = parcelStatusTransitions.find(t => t.from === from && t.to === to);

  if (!transition) {
    return { allowed: false, reason: `Transition de "${from}" vers "${to}" non autorisée` };
  }

  if (!transition.requiredRole.includes(userRole)) {
    return { allowed: false, reason: `Rôle "${userRole}" non autorisé pour cette transition` };
  }

  if (transition.requiresPhoto && !hasPhoto) {
    return { allowed: false, reason: 'Photo de preuve requise pour cette transition' };
  }

  if (transition.requiredDocuments) {
    const missingDocs = transition.requiredDocuments.filter(d => !hasDocuments.includes(d));
    if (missingDocs.length > 0) {
      return { allowed: false, reason: `Documents requis manquants: ${missingDocs.join(', ')}` };
    }
  }

  return {
    allowed: true,
    requiresApproval: transition.requiresApproval,
    approvalLevel: transition.approvalLevel,
  };
}

export function getAvailableTransitions(currentStatus: string, userRole: string): StatusTransition[] {
  return parcelStatusTransitions.filter(
    t => t.from === currentStatus && t.requiredRole.includes(userRole)
  );
}

// ─── Surcharge carburant dynamique ─────────────────────────────

export interface FuelSurcharge {
  id: string;
  transportMode: 'air' | 'maritime' | 'ground' | 'parcel';
  percentage: number;
  effectiveDate: string;
  expiryDate?: string;
  region: string;
  carrier?: string;
}

export const currentFuelSurcharges: FuelSurcharge[] = [
  { id: 'fs-1', transportMode: 'air', percentage: 12.5, effectiveDate: '2026-04-01', region: 'Moyen-Orient', carrier: 'DHL Express' },
  { id: 'fs-2', transportMode: 'air', percentage: 11.0, effectiveDate: '2026-04-01', region: 'Europe', carrier: 'FedEx' },
  { id: 'fs-3', transportMode: 'air', percentage: 10.5, effectiveDate: '2026-04-01', region: 'Afrique', carrier: 'Aramex' },
  { id: 'fs-4', transportMode: 'maritime', percentage: 8.0, effectiveDate: '2026-04-01', region: 'Méditerranée' },
  { id: 'fs-5', transportMode: 'ground', percentage: 6.5, effectiveDate: '2026-04-01', region: 'Maghreb' },
  { id: 'fs-6', transportMode: 'parcel', percentage: 5.0, effectiveDate: '2026-04-01', region: 'National' },
  { id: 'fs-7', transportMode: 'maritime', percentage: 9.5, effectiveDate: '2026-04-01', region: 'Asie-Méditerranée' },
  { id: 'fs-8', transportMode: 'air', percentage: 13.0, effectiveDate: '2026-04-01', region: 'Asie', carrier: 'Cathay Cargo' },
  { id: 'fs-9', transportMode: 'ground', percentage: 7.5, effectiveDate: '2026-04-01', region: 'Sahel' },
];

export function getFuelSurcharge(transportMode: string, region: string, carrier?: string): FuelSurcharge | undefined {
  return currentFuelSurcharges.find(
    s => s.transportMode === transportMode && s.region === region && (!carrier || s.carrier === carrier)
  );
}

// ─── Multi-devises ─────────────────────────────────────────────

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  date: string;
  source: string;
}

export const defaultExchangeRates: ExchangeRate[] = [
  { from: 'EUR', to: 'DZD', rate: 145.50, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'USD', to: 'DZD', rate: 134.80, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'GBP', to: 'DZD', rate: 168.20, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'CNY', to: 'DZD', rate: 18.55, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'AED', to: 'DZD', rate: 36.70, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'SAR', to: 'DZD', rate: 35.90, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'TRY', to: 'DZD', rate: 3.75, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'MAD', to: 'DZD', rate: 13.80, date: '2026-04-28', source: 'Banque d\'Algérie' },
  { from: 'TND', to: 'DZD', rate: 43.60, date: '2026-04-28', source: 'Banque d\'Algérie' },
];

export function getExchangeRate(from: string, to: string): number | undefined {
  if (from === to) return 1;
  const direct = defaultExchangeRates.find(r => r.from === from && r.to === to);
  if (direct) return direct.rate;
  // Try reverse
  const reverse = defaultExchangeRates.find(r => r.from === to && r.to === from);
  if (reverse) return 1 / reverse.rate;
  // Cross rate via DZD
  const fromToDZD = defaultExchangeRates.find(r => r.from === from && r.to === 'DZD');
  const toToDZD = defaultExchangeRates.find(r => r.from === to && r.to === 'DZD');
  if (fromToDZD && toToDZD) return fromToDZD.rate / toToDZD.rate;
  return undefined;
}

export function convertCurrency(amount: number, from: string, to: string): { converted: number; rate: number } | null {
  const rate = getExchangeRate(from, to);
  if (!rate) return null;
  return { converted: Math.round(amount * rate), rate };
}

// ─── Approbations multi-niveaux ────────────────────────────────

export interface ApprovalThreshold {
  /** Type d'approbation */
  type: string;
  /** Montant minimum déclenchant l'approbation */
  minAmount: number;
  /** Niveau d'approbation requis */
  level: 'manager' | 'admin' | 'board';
  /** Délai maximum d'approbation en heures */
  maxApprovalHours: number;
  /** Escalade automatique après délai */
  autoEscalate: boolean;
}

export const approvalThresholds: ApprovalThreshold[] = [
  { type: 'price_override', minAmount: 5000, level: 'manager', maxApprovalHours: 4, autoEscalate: true },
  { type: 'price_override', minAmount: 25000, level: 'admin', maxApprovalHours: 8, autoEscalate: true },
  { type: 'price_override', minAmount: 100000, level: 'board', maxApprovalHours: 24, autoEscalate: true },
  { type: 'return', minAmount: 0, level: 'manager', maxApprovalHours: 4, autoEscalate: false },
  { type: 'return', minAmount: 50000, level: 'admin', maxApprovalHours: 8, autoEscalate: true },
  { type: 'refund', minAmount: 0, level: 'manager', maxApprovalHours: 4, autoEscalate: false },
  { type: 'refund', minAmount: 25000, level: 'admin', maxApprovalHours: 8, autoEscalate: true },
  { type: 'dangerous_goods', minAmount: 0, level: 'admin', maxApprovalHours: 2, autoEscalate: true },
  { type: 'high_value', minAmount: 200000, level: 'admin', maxApprovalHours: 4, autoEscalate: true },
  { type: 'high_value', minAmount: 1000000, level: 'board', maxApprovalHours: 24, autoEscalate: true },
  { type: 'rule_override', minAmount: 0, level: 'manager', maxApprovalHours: 2, autoEscalate: true },
  { type: 'credit_limit_increase', minAmount: 0, level: 'admin', maxApprovalHours: 8, autoEscalate: true },
];

export function getRequiredApprovalLevel(type: string, amount: number): ApprovalThreshold | undefined {
  const thresholds = approvalThresholds
    .filter(t => t.type === type && amount >= t.minAmount)
    .sort((a, b) => b.minAmount - a.minAmount);
  return thresholds[0];
}

// ─── Persistance de la configuration des règles ────────────────

const BUSINESS_RULES_CONFIG_KEY = 'logisway-business-rules-config';

export interface BusinessRulesConfig {
  disabledRules: string[];
  customRules: BusinessRule[];
  fuelSurcharges: FuelSurcharge[];
  exchangeRates: ExchangeRate[];
  approvalThresholds: ApprovalThreshold[];
  taxConfig: typeof TAX_CONFIG;
  creditLimits: Record<string, number>;
  containerSpecs: Record<string, { lengthM: number; widthM: number; heightM: number; maxWeightKg: number; volumeM3: number }>;
}

export function loadBusinessRulesConfig(): BusinessRulesConfig {
  if (typeof window === 'undefined') {
    return {
      disabledRules: [],
      customRules: [],
      fuelSurcharges: currentFuelSurcharges,
      exchangeRates: defaultExchangeRates,
      approvalThresholds,
      taxConfig: TAX_CONFIG,
      creditLimits: CREDIT_LIMITS,
      containerSpecs: CONTAINER_SPECS,
    };
  }
  try {
    const raw = localStorage.getItem(BUSINESS_RULES_CONFIG_KEY);
    if (raw) return JSON.parse(raw) as BusinessRulesConfig;
  } catch { /* ignore */ }
  return {
    disabledRules: [],
    customRules: [],
    fuelSurcharges: currentFuelSurcharges,
    exchangeRates: defaultExchangeRates,
    approvalThresholds,
    taxConfig: TAX_CONFIG,
    creditLimits: CREDIT_LIMITS,
    containerSpecs: CONTAINER_SPECS,
  };
}

export function saveBusinessRulesConfig(config: BusinessRulesConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUSINESS_RULES_CONFIG_KEY, JSON.stringify(config));
}

export function toggleRule(ruleId: string, enabled: boolean): BusinessRulesConfig {
  const config = loadBusinessRulesConfig();
  if (enabled) {
    config.disabledRules = config.disabledRules.filter(id => id !== ruleId);
  } else {
    if (!config.disabledRules.includes(ruleId)) {
      config.disabledRules.push(ruleId);
    }
  }
  saveBusinessRulesConfig(config);
  return config;
}

export function isRuleEnabled(ruleId: string): boolean {
  const config = loadBusinessRulesConfig();
  return !config.disabledRules.includes(ruleId);
}

// ─── Helpers exportés ──────────────────────────────────────────

export { CARRIER_LIMITS, CONTAINER_SPECS, CREDIT_LIMITS, TAX_CONFIG, COUNTRIES_REQUIRING_ORIGIN, HIGH_RISK_COUNTRIES, EMBARGOED_COUNTRIES };

/**
 * Business Rules Engine — FreightFlow Pro
 * Moteur de règles métier avancé pour la validation, la conformité,
 * les approbations, les transitions de statut et la tarification dynamique.
 */

import { parcelFormats, type ParcelFormat } from './label-config';

// ─── Types fondamentaux ────────────────────────────────────────

export type Severity = 'critical' | 'warning' | 'info';
export type RuleCategory = 'validation' | 'compliance' | 'pricing' | 'workflow' | 'safety' | 'customs';

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  enabled: boolean;
  /** Règle applicable à quels modules */
  appliesTo: string[];
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
}

// ─── Règles de validation dimensionnelle ───────────────────────

const validateDimensions: BusinessRule = {
  id: 'rule-dim-001',
  name: 'Validation dimensionnelle du colis',
  description: 'Vérifie que les dimensions du colis correspondent au format sélectionné et respectent les limites transporteur',
  category: 'validation',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels'],
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

// ─── Règle de poids volumétrique ───────────────────────────────

const validateVolumetricWeight: BusinessRule = {
  id: 'rule-vol-001',
  name: 'Poids volumétrique (aérien)',
  description: 'Calcule le poids volumétrique selon la formule IATA (L×l×h/6000) et compare au poids réel',
  category: 'pricing',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'air-freight'],
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

    // Formule IATA: L × l × h / 6000
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

// ─── Règle de marchandises dangereuses ─────────────────────────

const DANGEROUS_GOODS_CODES = [
  'UN0012', 'UN0014', 'UN0027', 'UN0042', 'UN0044',
  'UN0160', 'UN0161', 'UN0245', 'UN0246', 'UN0255',
  'UN0323', 'UN0335', 'UN0357', 'UN0380', 'UN0381',
  'UN0447', 'UN0448', 'UN0449', 'UN0450', 'UN0451',
  'UN1263', 'UN1866', 'UN1993', 'UN3065', 'UN3175',
];

const validateDangerousGoods: BusinessRule = {
  id: 'rule-dg-001',
  name: 'Contrôle marchandises dangereuses',
  description: 'Vérifie si le colis contient des marchandises dangereuses nécessitant une déclaration UN et un emballage certifié',
  category: 'safety',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
  evaluate: (ctx) => {
    const data = ctx.data;
    const description = ((data.description as string) || '').toUpperCase();
    const hsCode = (data.hsCode as string) || '';
    const unCode = (data.unCode as string) || '';
    const hasDgDeclaration = data.dgDeclaration as boolean;

    // Mots-clés de marchandises dangereuses
    const dgKeywords = [
      'EXPLOSIF', 'INFLAMMABLE', 'COMBUSTIBLE', 'OXYDANT', 'CORROSIF',
      'TOXIQUE', 'RADIOACTIF', 'GAZ', 'AEROSOL', 'BATTERIE LITHIUM',
      'LI-ION', 'ACIDE', 'BASE', 'SOLVANT', 'PEINTURE', 'CARBURANT',
      'ESSENCE', 'DIESEL', 'ALCOOL', 'PEROXYDE', 'Matière DANGEREUSE',
    ];

    const foundKeywords = dgKeywords.filter(kw => description.includes(kw));
    const isUNDangerous = DANGEROUS_GOODS_CODES.some(code => unCode.toUpperCase().startsWith(code.substring(0, 4)));

    if (foundKeywords.length > 0 || isUNDangerous) {
      const issues: string[] = [];

      if (foundKeywords.length > 0) {
        issues.push(`Mots-clés détectés: ${foundKeywords.join(', ')}`);
      }
      if (isUNDangerous) {
        issues.push(`Code UN dangereux détecté: ${unCode}`);
      }
      if (!hasDgDeclaration) {
        issues.push('Déclaration de marchandises dangereuses manquante');
      }

      return {
        passed: hasDgDeclaration && !!unCode,
        ruleId: 'rule-dg-001',
        message: `MARCHANDISES DANGEREUSES — ${issues.join(' | ')}`,
        severity: 'critical',
        suggestions: [
          'Remplir la déclaration de marchandises dangereuses (DGD)',
          'Indiquer le code UN approprié',
          'Utiliser un emballage certifié OACI/IATA',
          'Vérifier les restrictions du transporteur',
          'Joindre la fiche de données de sécurité (FDS/MSDS)',
        ],
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

// ─── Règle de conformité douanière ─────────────────────────────

const validateCustomsCompliance: BusinessRule = {
  id: 'rule-customs-001',
  name: 'Conformité douanière',
  description: 'Vérifie que les documents douaniers obligatoires sont présents pour les expéditions internationales',
  category: 'customs',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
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

    // Certificat d'origine requis pour certains pays
    const countriesRequiringOrigin = ['CN', 'TR', 'IN', 'AE', 'SA'];
    if (countriesRequiringOrigin.some(c => destinationCountry.includes(c)) && !hasCertificateOrigin) {
      missingDocs.push('Certificat d\'origine');
    }

    if (missingDocs.length > 0 && (action === 'create' || action === 'update')) {
      return {
        passed: false,
        ruleId: 'rule-customs-001',
        message: `Documents douaniers manquants: ${missingDocs.join(', ')}`,
        severity: 'critical',
        suggestions: missingDocs.map(d => `Ajouter: ${d}`),
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

// ─── Règle de valeur déclarée / assurance ──────────────────────

const validateInsurance: BusinessRule = {
  id: 'rule-ins-001',
  name: 'Valeur déclarée et assurance',
  description: 'Vérifie que la valeur déclarée est couverte par une assurance appropriée, surtout pour les colis de valeur',
  category: 'compliance',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime'],
  evaluate: (ctx) => {
    const data = ctx.data;
    const declaredValue = (data.declaredValue as number) || 0;
    const insuranceAmount = (data.insuranceAmount as number) || 0;
    const isInternational = data.isInternational as boolean;

    const THRESHOLD_MANDATORY_INSURANCE = 50000; // DZD
    const THRESHOLD_HIGH_VALUE = 200000; // DZD

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

// ─── Règle de restriction transporteur ─────────────────────────

const validateCarrierRestrictions: BusinessRule = {
  id: 'rule-carrier-001',
  name: 'Restrictions transporteur',
  description: 'Vérifie les restrictions spécifiques aux transporteurs (poids max, dimensions, pays)',
  category: 'validation',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels'],
  evaluate: (ctx) => {
    const data = ctx.data;
    const carrier = (data.carrier as string) || '';
    const weight = (data.weightKg as number) || 0;
    const isInternational = data.isInternational as boolean;

    const carrierLimits: Record<string, { maxWeight: number; maxLength: number; maxWidth: number; maxHeight: number }> = {
      'DHL Express': { maxWeight: 70, maxLength: 120, maxWidth: 80, maxHeight: 80 },
      'FedEx': { maxWeight: 68, maxLength: 274, maxWidth: 274, maxHeight: 274 },
      'UPS': { maxWeight: 70, maxLength: 274, maxWidth: 274, maxHeight: 274 },
      'Aramex': { maxWeight: 30, maxLength: 150, maxWidth: 100, maxHeight: 100 },
    };

    const limits = carrierLimits[carrier];
    if (!limits) {
      return { passed: true, ruleId: 'rule-carrier-001', message: 'Pas de restrictions connues pour ce transporteur', severity: 'info' };
    }

    const errors: string[] = [];
    const lengthCm = data.lengthCm as number;
    const widthCm = data.widthCm as number;
    const heightCm = data.heightCm as number;

    if (weight > limits.maxWeight) errors.push(`Poids ${weight}kg > limite ${limits.maxWeight}kg`);
    if (lengthCm > limits.maxLength) errors.push(`Longueur ${lengthCm}cm > limite ${limits.maxLength}cm`);
    if (widthCm > limits.maxWidth) errors.push(`Largeur ${widthCm}cm > limite ${limits.maxWidth}cm`);
    if (heightCm > limits.maxHeight) errors.push(`Hauteur ${heightCm}cm > limite ${limits.maxHeight}cm`);

    // Surcharge pondérale combinée (girth)
    const girth = 2 * (widthCm + heightCm);
    const combinedLength = lengthCm + girth;
    if (combinedLength > 330 && isInternational) {
      errors.push(`Dimension combinée (${combinedLength}cm) > 330cm — surcharge grand format applicable`);
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

// ─── Règle SLA (Service Level Agreement) ───────────────────────

const validateSLA: BusinessRule = {
  id: 'rule-sla-001',
  name: 'Respect des SLA',
  description: 'Vérifie que le délai de livraison estimé respecte les engagements de service',
  category: 'compliance',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels', 'shipments'],
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

// ─── Règle de douane Algérie spécifique ────────────────────────

const validateAlgerianCustoms: BusinessRule = {
  id: 'rule-customs-dz-001',
  name: 'Conformité douanière algérienne',
  description: 'Vérifie les exigences spécifiques aux douanes algériennes pour les importations/exportations',
  category: 'customs',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
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
    const hasAI = data.ai as string; // Article d'importation

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

// ─── Règle de limitation d'impression ──────────────────────────

const validatePrintLimit: BusinessRule = {
  id: 'rule-print-001',
  name: 'Limitation d\'impression étiquettes',
  description: 'Vérifie les limites d\'impression et la cohérence du nombre de copies',
  category: 'validation',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels'],
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

// ─── Règle de preuve photo obligatoire ─────────────────────────

const validateProofPhoto: BusinessRule = {
  id: 'rule-photo-001',
  name: 'Preuve photo obligatoire',
  description: 'Vérifie la présence de preuves photo pour les colis livrés ou les colis de valeur',
  category: 'compliance',
  severity: 'warning',
  enabled: true,
  appliesTo: ['parcels'],
  evaluate: (ctx) => {
    const data = ctx.data;
    const status = data.status as string;
    const hasProofPhoto = !!(data.proofPhoto as string);
    const hasDeliveryPhoto = !!(data.deliveryProofPhoto as string);
    const declaredValue = (data.declaredValue as number) || 0;
    const action = ctx.action;

    // Photo de preuve obligatoire pour les colis livrés
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

    // Photo fortement recommandée pour les colis de haute valeur
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

// ─── Règle de restrictions d'embargo ───────────────────────────

const EMBARGOED_COUNTRIES = ['KP', 'IR', 'SY', 'CU']; // Code ISO simplifié

const validateEmbargo: BusinessRule = {
  id: 'rule-embargo-001',
  name: 'Contrôle embargo',
  description: 'Vérifie que la destination n\'est pas sous embargo ou soumise à des sanctions',
  category: 'compliance',
  severity: 'critical',
  enabled: true,
  appliesTo: ['parcels', 'air-freight', 'maritime', 'ground-transport'],
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

// ─── Registre de toutes les règles ─────────────────────────────

export const allBusinessRules: BusinessRule[] = [
  validateDimensions,
  validateVolumetricWeight,
  validateDangerousGoods,
  validateCustomsCompliance,
  validateInsurance,
  validateCarrierRestrictions,
  validateSLA,
  validateAlgerianCustoms,
  validatePrintLimit,
  validateProofPhoto,
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

  return {
    totalRules: applicableRules.length,
    passed: results.filter(r => r.passed).length,
    failed,
    critical,
    warnings,
    info,
    results,
    canProceed: critical === 0,
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

// ─── Transitions de statut ─────────────────────────────────────

export type ParcelStatus = 'picked_up' | 'in_warehouse' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
export type ShipmentStatus = 'en_attente' | 'confirmee' | 'en_transit' | 'livree' | 'retardee' | 'annulee';

interface StatusTransition {
  from: string;
  to: string;
  requiredRole: string[];
  requiredDocuments?: string[];
  requiresPhoto?: boolean;
  requiresApproval?: boolean;
  autoNotify?: boolean;
}

export const parcelStatusTransitions: StatusTransition[] = [
  { from: 'picked_up', to: 'in_warehouse', requiredRole: ['admin', 'manager', 'agent'], autoNotify: true },
  { from: 'in_warehouse', to: 'in_transit', requiredRole: ['admin', 'manager', 'agent'], requiredDocuments: ['label'], autoNotify: true },
  { from: 'in_transit', to: 'out_for_delivery', requiredRole: ['admin', 'manager', 'agent'], autoNotify: true },
  { from: 'out_for_delivery', to: 'delivered', requiredRole: ['admin', 'manager', 'agent'], requiresPhoto: true, autoNotify: true },
  { from: 'in_transit', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true, autoNotify: true },
  { from: 'out_for_delivery', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true, autoNotify: true },
  { from: 'delivered', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true, autoNotify: true },
  { from: 'picked_up', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true },
  { from: 'in_warehouse', to: 'returned', requiredRole: ['admin', 'manager'], requiresApproval: true },
];

export function canTransitionStatus(
  from: string,
  to: string,
  userRole: string,
  hasPhoto: boolean = false,
  hasDocuments: string[] = []
): { allowed: boolean; reason?: string } {
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

  return { allowed: true };
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
];

export function getFuelSurcharge(transportMode: string, region: string, carrier?: string): FuelSurcharge | undefined {
  return currentFuelSurcharges.find(
    s => s.transportMode === transportMode && s.region === region && (!carrier || s.carrier === carrier)
  );
}

// ─── Persistance de la configuration des règles ────────────────

const BUSINESS_RULES_CONFIG_KEY = 'freightflow-business-rules-config';

export interface BusinessRulesConfig {
  disabledRules: string[];
  customRules: BusinessRule[];
  fuelSurcharges: FuelSurcharge[];
}

export function loadBusinessRulesConfig(): BusinessRulesConfig {
  if (typeof window === 'undefined') {
    return { disabledRules: [], customRules: [], fuelSurcharges: currentFuelSurcharges };
  }
  try {
    const raw = localStorage.getItem(BUSINESS_RULES_CONFIG_KEY);
    if (raw) return JSON.parse(raw) as BusinessRulesConfig;
  } catch { /* ignore */ }
  return { disabledRules: [], customRules: [], fuelSurcharges: currentFuelSurcharges };
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

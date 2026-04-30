import { NextRequest, NextResponse } from 'next/server';

// ─── Mock Data for Scan Results ──────────────────────────────────

interface ScanResult {
  code: string;
  type: 'tracking' | 'container' | 'parcel' | 'flight' | 'unknown';
  status: string;
  details: Record<string, string>;
}

function detectCodeType(code: string): ScanResult['type'] {
  const upper = code.toUpperCase();
  if (/^FFP-\d{4}-\d{4}$/.test(upper) || /^FFP-\d{4}$/.test(upper)) return 'tracking';
  if (/^[A-Z]{4}-?\d{7}$/.test(upper)) return 'container';
  if (/^PRC-\d{6}$/.test(upper)) return 'parcel';
  if (/^[A-Z]{2,3}-?\d{3,4}$/.test(upper)) return 'flight';
  return 'unknown';
}

function getTrackingDetails(code: string): ScanResult {
  return {
    code,
    type: 'tracking',
    status: 'En transit',
    details: {
      'Référence': code,
      'Expéditeur': 'SPA HydroServices',
      'Destinataire': 'Alger Média Group',
      'Origine': 'Marseille, France',
      'Destination': 'Alger, Algérie',
      'Mode': 'Maritime',
      'Poids': '2.4 tonnes',
      'ETA': new Date(Date.now() + 3 * 86400000).toLocaleDateString('fr-FR'),
      'Dernière mise à jour': 'Conteneur chargé — En haute mer',
    },
  };
}

function getContainerDetails(code: string): ScanResult {
  return {
    code,
    type: 'container',
    status: 'En transit',
    details: {
      'Numéro Conteneur': code,
      'Type': '40\' HC (High Cube)',
      'Port de Chargement': 'Shenzhen, Chine',
      'Port de Décharge': 'Alger, Algérie',
      'Navire': 'MSC Fantasia',
      'Client': 'TechImport SARL',
      'Poids Brut': '18.5 tonnes',
      'Marchandise': 'Matériel électronique',
      'BL': 'MSCNGB20260045',
    },
  };
}

function getParcelDetails(code: string): ScanResult {
  return {
    code,
    type: 'parcel',
    status: 'En livraison',
    details: {
      'Référence Colis': code,
      'Expéditeur': 'Karim Benali',
      'Destinataire': 'Amina Cherif',
      'Origine': 'Alger Centre',
      'Destination': 'Oran, Algérie',
      'Transporteur': 'Express Pro',
      'Poids': '2.3 kg',
      'Dimensions': '30×20×15 cm',
      'Statut Livraison': 'En cours de distribution',
    },
  };
}

function getFlightDetails(code: string): ScanResult {
  return {
    code,
    type: 'flight',
    status: 'Confirmé',
    details: {
      'Numéro Vol': code,
      'Compagnie': 'Turkish Airlines',
      'Origine': 'Istanbul (IST)',
      'Destination': 'Alger (ALG)',
      'Départ': '08:45',
      'Arrivée': '11:30',
      'Capacité Disponible': '12 tonnes',
      'Type Appareil': 'A330-300F',
      'LTA/AWB': '235-12345678',
    },
  };
}

function getUnknownDetails(code: string): ScanResult {
  return {
    code,
    type: 'unknown',
    status: 'Non reconnu',
    details: {
      'Code scanné': code,
      'Type détecté': 'Code non reconnu dans le système',
      'Suggestion': 'Vérifiez le format du code ou ajoutez-le manuellement',
    },
  };
}

function lookupCode(code: string): ScanResult {
  const type = detectCodeType(code);
  switch (type) {
    case 'tracking': return getTrackingDetails(code);
    case 'container': return getContainerDetails(code);
    case 'parcel': return getParcelDetails(code);
    case 'flight': return getFlightDetails(code);
    default: return getUnknownDetails(code);
  }
}

// ─── POST Handler ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, action } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code requis pour le scan' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    // Action: lookup — standard code lookup
    if (!action || action === 'lookup') {
      const result = lookupCode(trimmedCode);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));
      return NextResponse.json({
        success: true,
        result,
        timestamp: new Date().toISOString(),
      });
    }

    // Action: validate — check if code format is valid
    if (action === 'validate') {
      const type = detectCodeType(trimmedCode);
      const isValid = type !== 'unknown';
      return NextResponse.json({
        success: true,
        valid: isValid,
        type,
        code: trimmedCode,
      });
    }

    // Action: batch — process multiple codes
    if (action === 'batch' && Array.isArray(code)) {
      const results = code.map((c: string) => lookupCode(c.trim().toUpperCase()));
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
      return NextResponse.json({
        success: true,
        results,
        count: results.length,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue. Utilisez: lookup, validate, ou batch' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du scan' },
      { status: 500 }
    );
  }
}

// ─── GET Handler ─────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    service: 'FreightFlow Pro Scanner API',
    version: '1.0.0',
    endpoints: {
      'POST /api/scan': {
        description: 'Scanner un code-barres ou QR code',
        actions: {
          lookup: 'Rechercher les informations d\'un code',
          validate: 'Valider le format d\'un code',
          batch: 'Traiter plusieurs codes en une fois',
        },
        supportedFormats: {
          tracking: 'FFP-XXXX-XXXX (numéro d\'expédition)',
          container: 'XXXX1234567 (numéro de conteneur)',
          parcel: 'PRC-XXXXXX (numéro de colis)',
          flight: 'XX-XXXX (numéro de vol)',
        },
      },
    },
  });
}

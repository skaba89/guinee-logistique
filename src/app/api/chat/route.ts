import { NextRequest, NextResponse } from 'next/server';

interface ChatHistoryItem {
  role: string;
  content: string;
}

interface ChatRequestBody {
  message: string;
  history: ChatHistoryItem[];
}

const SYSTEM_PROMPT = `Tu es FlowBot, l'assistant IA de FreightFlow Pro, une plateforme logistique professionnelle. Tu aides les utilisateurs avec :

- Suivi d'expéditions (numéros FFP-XXXX-XXXX)
- Statut des conteneurs maritimes (numéros MSKU-XXXXXXX)
- Vols de fret aérien (codes comme AF123, EK456)
- Colis et courrier (numéros PRC-XXXXXX)
- Tarifs de fret (maritime, aérien, terrestre)
- Procédures douanières
- Gestion d'entrepôt
- Assurance cargo
- Incoterms
- Et toutes questions logistiques

Règles :
- Réponds toujours en français
- Sois professionnel mais chaleureux
- Si on te donne un numéro de suivi, simule une réponse de suivi réaliste
- Donne des conseils pratiques et concrets
- Utilise des emojis avec parcimonie pour rendre la conversation agréable
- Si tu ne connais pas quelque chose, oriente vers le support (support@freightflow.pro)
- Garde tes réponses concises (max 3-4 paragraphes)`;

// Simulated logistics data for realistic responses
const TRACKING_RESPONSES: Record<string, string> = {
  'FFP': (num: string) => `📦 **Suivi de l'expédition ${num}**\n\n✅ Statut : **En transit**\n🚢 Transport : Maritime\n📍 Position actuelle : Méditerranée centrale\n🕐 Arrivée estimée : Dans 3 jours\n\nDernière mise à jour : Le conteneur a été chargé sur le navire MSC GÜLSÜN au port de Marseille. Transit prévu via le détroit de Gibraltar.`,
  'MSKU': (num: string) => `集装箱 **Conteneur ${num}**\n\n✅ Statut : **Chargé sur navire**\n🚢 Navire : CMA CGM MARCO POLO\n📍 Port de chargement : Le Havre\n🏁 Port de déchargement : Casablanca\n📅 ETA : 48 heures\n\nLe conteneur est en bonne état et suit son itinéraire prévu.`,
  'PRC': (num: string) => `📮 **Colis ${num}**\n\n✅ Statut : **En livraison**\n🚛 Transporteur : Chronopost\n📍 Centre de tri : Paris Nord\n🕐 Livraison prévue : Aujourd'hui 14h-18h\n\nLe colis est sorti du centre de tri ce matin à 7h30.`,
};

function generateLogisticsResponse(message: string, history: ChatHistoryItem[]): string {
  const lowerMsg = message.toLowerCase();

  // Check for tracking number
  const ffpMatch = message.match(/\bFFP-\d{4}-\d{4}\b/i);
  if (ffpMatch) {
    return TRACKING_RESPONSES['FFP'](ffpMatch[0].toUpperCase());
  }

  const mskuMatch = message.match(/\bMSKU-\d{7}\b/i);
  if (mskuMatch) {
    return TRACKING_RESPONSES['MSKU'](mskuMatch[0].toUpperCase());
  }

  const prcMatch = message.match(/\bPRC-\d{6}\b/i);
  if (prcMatch) {
    return TRACKING_RESPONSES['PRC'](prcMatch[0].toUpperCase());
  }

  // Flight number
  const flightMatch = message.match(/\b([A-Z]{2}\d{3,4})\b/i);
  if (flightMatch && !lowerMsg.includes('tarif') && !lowerMsg.includes('aide')) {
    const flightNum = flightMatch[1].toUpperCase();
    return `✈️ **Vol ${flightNum}**\n\n✅ Statut : **Programmé**\n🕐 Départ : 08:30 (à l'heure)\n📍 Origine : Paris CDG\n🏁 Destination : Dubai DXB\n📦 Fret disponible : 12 tonnes\n\nLes réservations de fret pour ce vol sont ouvertes. Contactez notre équipe pour réserver de l'espace.`;
  }

  // Suivi d'expédition
  if (lowerMsg.includes('suivi') || lowerMsg.includes('expédition') || lowerMsg.includes('shipment') || lowerMsg.includes('tracker')) {
    return `🔍 **Suivi d'expédition**\n\nPour suivre votre expédition, veuillez me fournir votre numéro de suivi :\n\n• **FFP-XXXX-XXXX** pour les expéditions générales\n• **MSKU-XXXXXXX** pour les conteneurs maritimes\n• **PRC-XXXXXX** pour les colis\n• **Code vol** (ex: AF123) pour le fret aérien\n\nVous pouvez aussi utiliser la barre de recherche (Ctrl+K) pour trouver rapidement vos expéditions.`;
  }

  // Statut des colis
  if (lowerMsg.includes('colis') || lowerMsg.includes('parcel') || lowerMsg.includes('courrier')) {
    return `📦 **Statut de vos colis**\n\nVoici un résumé de vos colis récents :\n\n✅ **PRC-284751** — Livré hier\n🚛 **PRC-284892** — En livraison aujourd'hui\n📋 **PRC-285103** — En préparation\n⏳ **PRC-285240** — En attente d'enlèvement\n\nPour le détail d'un colis spécifique, indiquez-moi son numéro PRC.`;
  }

  // Tarifs fret
  if (lowerMsg.includes('tarif') || lowerMsg.includes('prix') || lowerMsg.includes('rate') || lowerMsg.includes('coût') || lowerMsg.includes('cout')) {
    return `💰 **Tarifs de fret actuels**\n\n**Fret maritime** 🚢\n• Europe → Asie : $1,850/TEU\n• Europe → Afrique Nord : $950/TEU\n• Transatlantique : $2,200/TEU\n\n**Fret aérien** ✈️\n• Europe → Moyen-Orient : €3.20/kg\n• Europe → Asie : €4.50/kg\n• Inter-européen : €2.10/kg\n\n**Transport terrestre** 🚛\n• National : €0.85/km (complet)\n• International : €1.20/km\n\n📊 *Les tarifs sont mis à jour quotidiennement. Pour un devis personnalisé, consultez la section "Devis" ou contactez notre équipe commerciale.*`;
  }

  // Aide
  if (lowerMsg.includes('aide') || lowerMsg.includes('help') || lowerMsg.includes('besoin') || lowerMsg.includes('problème') || lowerMsg.includes('probleme')) {
    return `🤝 **Comment puis-je vous aider ?**\n\nVoici ce que je peux faire pour vous :\n\n📦 **Suivi** — Suivez vos expéditions en temps réel\n💼 **Tarifs** — Consultez les tarifs de fret actuels\n📋 **Colis** — Vérifiez le statut de vos colis\n✈️ **Vols** — Info sur les vols de fret\n🚢 **Maritime** — Conteneurs et navires\n🏢 **Douanes** — Procédures et documents\n\n💡 **Astuce** : Utilisez Ctrl+K pour rechercher rapidement dans toute la plateforme.\n\nPour un support technique, contactez : support@freightflow.pro`;
  }

  // Douanes
  if (lowerMsg.includes('douane') || lowerMsg.includes('customs') || lowerMsg.includes('déclaration')) {
    return `🏢 **Procédures douanières**\n\n**Documents requis :**\n• Facture commerciale\n• Liste de colisage (packing list)\n• Certificat d'origine\n• Connaissement (B/L) ou LTA\n\n**Délais estimés :**\n• Import EU : 1-2 jours ouvrés\n• Hors EU : 3-5 jours ouvrés\n• Contrôle renforcé : +2-3 jours\n\n📋 Consultez la section "Douanes" pour vos déclarations en cours. Notre équipe peut vous accompagner pour les formalités.`;
  }

  // Entrepôt
  if (lowerMsg.includes('entrepôt') || lowerMsg.includes('warehouse') || lowerMsg.includes('stockage')) {
    return `🏢 **Gestion d'entrepôt**\n\n**Capacité actuelle :**\n• Paris Nord : 78% occupé\n• Lyon : 52% occupé\n• Marseille : 65% occupé\n\n**Services disponibles :**\n• Cross-docking\n• Stockage température contrôlée\n• Préparation de commandes\n• Étiquetage et emballage\n\nRéservez un emplacement via la section "Entrepôt" ou contactez-nous.`;
  }

  // Assurance
  if (lowerMsg.includes('assurance') || lowerMsg.includes('insurance') || lowerMsg.includes('dommage')) {
    return `🛡️ **Assurance Cargo**\n\n**Couvertures disponibles :**\n• **Tous risques** : Couverture complète (0.4% de la valeur)\n• **FAP** : Franc d'avaries particulières (0.25%)\n• **ICC-C** : Couverture de base (0.15%)\n\nEn cas de dommage :\n1. Photographiez les dégâts\n2. Conservez l'emballage\n3. Déclarez dans les 3 jours\n4. Remplissez le formulaire en ligne\n\n📞 Urgences : +33 1 23 45 67 89`;
  }

  // Incoterms
  if (lowerMsg.includes('incoterm') || lowerMsg.includes('fob') || lowerMsg.includes('cif') || lowerMsg.includes('ddp')) {
    return `📜 **Incoterms 2020**\n\n**Les plus utilisés en fret :**\n\n• **FOB** (Free On Board) — Le vendeur livre à bord du navire\n• **CIF** (Cost, Insurance, Freight) — Le vendeur paie transport + assurance\n• **DDP** (Delivered Duty Paid) — Le vendeur paie tout, y compris douanes\n• **EXW** (Ex Works) — L'acheteur vient chercher à l'usine\n• **FCA** (Free Carrier) — Le vendeur livre au transporteur\n\n💡 Consultez la section "Incoterms" pour des guides détaillés.`;
  }

  // Greetings
  if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello') || lowerMsg.includes('bonsoir') || lowerMsg === 'hi') {
    return `Bonjour ! 😊 Ravi de vous retrouver !\n\nComment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser une question sur :\n\n📦 Le suivi de vos expéditions\n💰 Les tarifs de fret\n📋 L'état de vos colis\n🏢 Les procédures douanières\n\nOu donnez-moi directement un numéro de suivi !`;
  }

  // Merci
  if (lowerMsg.includes('merci') || lowerMsg.includes('thank')) {
    return `Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider 24h/24.\n\nBonne journée logistique ! 🚀`;
  }

  // Default response
  return `Merci pour votre question ! 🤔\n\nJe suis FlowBot, votre assistant logistique. Je peux vous aider avec :\n\n📦 **Suivi** — Donnez-moi un numéro (FFP-XXXX-XXXX, MSKU-XXXXXXX, etc.)\n💰 **Tarifs** — Demandez les tarifs de fret\n📋 **Colis** — Vérifiez le statut de vos colis\n🏢 **Douanes** — Procédures et documents\n🛡️ **Assurance** — Couvertures et réclamations\n📜 **Incoterms** — Guides et explications\n\nComment puis-je vous être utile ?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequestBody;

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    const history = Array.isArray(body.history) ? body.history : [];

    // Simple rate limiting - max 50 messages in history
    const trimmedHistory = history.slice(-50);

    // Generate response based on the message content
    const reply = generateLogisticsResponse(message, trimmedHistory);

    // Simulate a small delay to feel natural
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700));

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

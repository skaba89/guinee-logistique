/**
 * Label & Printer Configuration System — FreightFlow Pro
 * Centralized configuration for Zebra/ZPL label generation,
 * printer management, label formats, and parcel size categories.
 */

// ─── Label Format Definitions ──────────────────────────────────

export interface LabelFormat {
  id: string;
  name: string;
  /** Width in mm */
  widthMm: number;
  /** Height in mm */
  heightMm: number;
  /** Width in dots at 203 DPI */
  widthDots203: number;
  /** Height in dots at 203 DPI */
  heightDots203: number;
  /** Width in dots at 300 DPI */
  widthDots300: number;
  /** Height in dots at 300 DPI */
  heightDots300: number;
  /** Paper type description */
  paperType: string;
  /** Whether this is a standard Zebra format */
  zebraStandard: boolean;
  /** Usage description */
  usage: string;
  /** Icon identifier */
  icon: string;
}

export const labelFormats: LabelFormat[] = [
  {
    id: '4x6',
    name: '4" x 6" (100x150mm)',
    widthMm: 100,
    heightMm: 150,
    widthDots203: 812,
    heightDots203: 1218,
    widthDots300: 1200,
    heightDots300: 1800,
    paperType: 'Autocollant thermique direct',
    zebraStandard: true,
    usage: 'Étiquette d\'expédition standard — le format le plus courant pour les transporteurs internationaux',
    icon: 'Package',
  },
  {
    id: '4x4',
    name: '4" x 4" (100x100mm)',
    widthMm: 100,
    heightMm: 100,
    widthDots203: 812,
    heightDots203: 812,
    widthDots300: 1200,
    heightDots300: 1200,
    paperType: 'Autocollant thermique direct',
    zebraStandard: true,
    usage: 'Étiquette compacte pour petits colis et pochettes',
    icon: 'Package',
  },
  {
    id: '4x8',
    name: '4" x 8" (100x200mm)',
    widthMm: 100,
    heightMm: 200,
    widthDots203: 812,
    heightDots203: 1624,
    widthDots300: 1200,
    heightDots300: 2400,
    paperType: 'Autocollant thermique direct',
    zebraStandard: true,
    usage: 'Étiquette grand format avec détails complets et codes-barres multiples',
    icon: 'Package',
  },
  {
    id: '2-4x4',
    name: '2.4" x 4" (62x100mm)',
    widthMm: 62,
    heightMm: 100,
    widthDots203: 488,
    heightDots203: 812,
    widthDots300: 720,
    heightDots300: 1200,
    paperType: 'Autocollant thermique direct',
    zebraStandard: true,
    usage: 'Étiquette étroite pour boîtes et sacs — format DHL/FedEx par défaut',
    icon: 'Tag',
  },
  {
    id: '2x1',
    name: '2" x 1" (50x25mm)',
    widthMm: 50,
    heightMm: 25,
    widthDots203: 406,
    heightDots203: 203,
    widthDots300: 600,
    heightDots300: 300,
    paperType: 'Autocollant thermique direct',
    zebraStandard: true,
    usage: 'Étiquette barcode/QR compacte pour identification rapide',
    icon: 'Tag',
  },
  {
    id: '6x4',
    name: '6" x 4" (150x100mm)',
    widthMm: 150,
    heightMm: 100,
    widthDots203: 1218,
    heightDots203: 812,
    widthDots300: 1800,
    heightDots300: 1200,
    paperType: 'Autocollant thermique direct',
    zebraStandard: true,
    usage: 'Étiquette paysage avec infos détaillées — palette et fret',
    icon: 'Container',
  },
  {
    id: 'a4',
    name: 'A4 (210x297mm)',
    widthMm: 210,
    heightMm: 297,
    widthDots203: 1700,
    heightDots203: 2400,
    widthDots300: 2500,
    heightDots300: 3500,
    paperType: 'Papier standard / autocollant A4',
    zebraStandard: false,
    usage: 'Format A4 pour imprimantes laser/inkjet avec étiquettes prédécoupées',
    icon: 'FileText',
  },
];

// ─── Printer Configuration ─────────────────────────────────────

export type PrinterConnection = 'network' | 'usb' | 'bluetooth' | 'serial';
export type PrinterDPI = 203 | 300 | 600;
export type PrinterStatus = 'online' | 'offline' | 'error' | 'idle' | 'printing';

export interface ZebraPrinter {
  id: string;
  name: string;
  model: string;
  connection: PrinterConnection;
  ipAddress?: string;
  port?: number;
  usbPort?: string;
  dpi: PrinterDPI;
  defaultLabelFormat: string;
  status: PrinterStatus;
  /** Last status check timestamp */
  lastCheck: string;
  /** Total labels printed */
  labelsPrinted: number;
  /** Is this the default printer? */
  isDefault: boolean;
  /** Darkness/heat level (0-30) */
  darkness: number;
  /** Print speed (inches per second) */
  speed: number;
  /** Media type currently loaded */
  mediaType: string;
}

export const defaultPrinters: ZebraPrinter[] = [
  {
    id: 'printer-1',
    name: 'Zebra ZD421',
    model: 'ZD421t',
    connection: 'network',
    ipAddress: '192.168.1.50',
    port: 9100,
    dpi: 300,
    defaultLabelFormat: '4x6',
    status: 'online',
    lastCheck: '2026-04-27T08:00:00',
    labelsPrinted: 1247,
    isDefault: true,
    darkness: 15,
    speed: 6,
    mediaType: 'Autocollant 100x150mm',
  },
  {
    id: 'printer-2',
    name: 'Zebra ZT411',
    model: 'ZT411',
    connection: 'network',
    ipAddress: '192.168.1.51',
    port: 9100,
    dpi: 300,
    defaultLabelFormat: '4x8',
    status: 'idle',
    lastCheck: '2026-04-27T07:55:00',
    labelsPrinted: 3521,
    isDefault: false,
    darkness: 18,
    speed: 8,
    mediaType: 'Autocollant 100x200mm',
  },
  {
    id: 'printer-3',
    name: 'Zebra GK420d',
    model: 'GK420d',
    connection: 'usb',
    usbPort: 'USB001',
    dpi: 203,
    defaultLabelFormat: '2-4x4',
    status: 'offline',
    lastCheck: '2026-04-26T16:30:00',
    labelsPrinted: 856,
    isDefault: false,
    darkness: 12,
    speed: 4,
    mediaType: 'Autocollant 62x100mm',
  },
];

export const connectionLabels: Record<PrinterConnection, string> = {
  network: 'Réseau (TCP/IP)',
  usb: 'USB',
  bluetooth: 'Bluetooth',
  serial: 'Série (RS-232)',
};

export const connectionColors: Record<PrinterConnection, string> = {
  network: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  usb: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  bluetooth: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  serial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export const statusLabels: Record<PrinterStatus, string> = {
  online: 'En ligne',
  offline: 'Hors ligne',
  error: 'Erreur',
  idle: 'En veille',
  printing: 'Impression',
};

export const statusColors: Record<PrinterStatus, string> = {
  online: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  offline: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  idle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  printing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export const statusDotColors: Record<PrinterStatus, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  error: 'bg-red-500',
  idle: 'bg-amber-500',
  printing: 'bg-blue-500 animate-pulse',
};

// ─── Parcel Format / Size Categories ───────────────────────────

export interface ParcelFormat {
  id: string;
  name: string;
  /** Max weight in kg */
  maxWeight: number;
  /** Max length in cm */
  maxLength: number;
  /** Max width in cm */
  maxWidth: number;
  /** Max height in cm */
  maxHeight: number;
  /** Suggested label format ID */
  suggestedLabelFormat: string;
  /** Base price in DZD for domestic */
  basePriceDomestic: number;
  /** Base price in DZD for international */
  basePriceInternational: number;
  /** Price per additional kg */
  pricePerKg: number;
  /** Icon name */
  icon: string;
  /** Color gradient */
  color: string;
  /** Description */
  description: string;
}

export const parcelFormats: ParcelFormat[] = [
  {
    id: 'xs',
    name: 'XS — Enveloppe/Pochette',
    maxWeight: 0.5,
    maxLength: 25,
    maxWidth: 18,
    maxHeight: 3,
    suggestedLabelFormat: '2-4x4',
    basePriceDomestic: 350,
    basePriceInternational: 2500,
    pricePerKg: 500,
    icon: 'Mail',
    color: 'from-sky-400 to-blue-500',
    description: 'Documents, bijoux, petits objets plats — pochette autocollante',
  },
  {
    id: 's',
    name: 'S — Petit colis',
    maxWeight: 2,
    maxLength: 30,
    maxWidth: 20,
    maxHeight: 15,
    suggestedLabelFormat: '2-4x4',
    basePriceDomestic: 600,
    basePriceInternational: 4200,
    pricePerKg: 600,
    icon: 'Package',
    color: 'from-teal-400 to-emerald-500',
    description: 'Petit colis, accessoires, échantillons — boîte standard S',
  },
  {
    id: 'm',
    name: 'M — Colis moyen',
    maxWeight: 5,
    maxLength: 40,
    maxWidth: 30,
    maxHeight: 25,
    suggestedLabelFormat: '4x4',
    basePriceDomestic: 950,
    basePriceInternational: 7500,
    pricePerKg: 700,
    icon: 'Package',
    color: 'from-amber-400 to-orange-500',
    description: 'Colis moyen, vêtements, chaussures, électronique — boîte M',
  },
  {
    id: 'l',
    name: 'L — Grand colis',
    maxWeight: 10,
    maxLength: 50,
    maxWidth: 40,
    maxHeight: 35,
    suggestedLabelFormat: '4x6',
    basePriceDomestic: 1500,
    basePriceInternational: 12000,
    pricePerKg: 800,
    icon: 'PackageCheck',
    color: 'from-orange-400 to-red-500',
    description: 'Grand colis, équipement, pièces détachées — carton L',
  },
  {
    id: 'xl',
    name: 'XL — Très grand colis',
    maxWeight: 20,
    maxLength: 60,
    maxWidth: 50,
    maxHeight: 40,
    suggestedLabelFormat: '4x6',
    basePriceDomestic: 2200,
    basePriceInternational: 18000,
    pricePerKg: 900,
    icon: 'PackageCheck',
    color: 'from-red-400 to-rose-600',
    description: 'Colis volumineux, ordinateur, petit électroménager — carton XL',
  },
  {
    id: 'xxl',
    name: 'XXL — Colis très volumineux',
    maxWeight: 30,
    maxLength: 80,
    maxWidth: 60,
    maxHeight: 50,
    suggestedLabelFormat: '4x8',
    basePriceDomestic: 3500,
    basePriceInternational: 28000,
    pricePerKg: 1000,
    icon: 'Container',
    color: 'from-purple-400 to-indigo-600',
    description: 'Colis très volumineux, électroménager, mobilier léger — palette/paquet XXL',
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    maxWeight: 50,
    maxLength: 150,
    maxWidth: 100,
    maxHeight: 100,
    suggestedLabelFormat: '4x8',
    basePriceDomestic: 5000,
    basePriceInternational: 35000,
    pricePerKg: 1100,
    icon: 'Ruler',
    color: 'from-gray-400 to-gray-600',
    description: 'Dimensions personnalisées — prix calculé selon poids et volume réel',
  },
];

// ─── Price Calculation (V2 — multi-devises, taxes, ristournes, pénalités) ───

export interface PriceCalculationParams {
  formatId: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isInternational: boolean;
  serviceLevel: 'express' | 'standard' | 'economy' | 'same_day' | 'next_day';
  insuranceAmount?: number;
  currency?: string;
  /** Client category for discount */
  clientCategory?: 'standard' | 'silver' | 'gold' | 'platinum' | 'vip';
  /** Monthly shipment count for volume discount */
  monthlyShipmentCount?: number;
  /** Monthly revenue for volume discount */
  monthlyRevenue?: number;
  /** Current contract discount rate (%) */
  contractDiscount?: number;
  /** Fuel surcharge rate (%) */
  fuelSurchargeRate?: number;
  /** Peak season surcharge rate (%) */
  peakSurchargeRate?: number;
  /** Apply TVA (19%) */
  applyTVA?: boolean;
  /** Apply TAP (1%) */
  applyTAP?: boolean;
  /** Is export (TVA exempt) */
  isExport?: boolean;
  /** Late delivery penalty amount */
  lateDeliveryPenalty?: number;
  /** Dangerous goods surcharge rate */
  dangerousGoodsSurcharge?: number;
}

export interface PriceBreakdown {
  basePrice: number;
  weightSurcharge: number;
  volumeSurcharge: number;
  serviceMultiplier: number;
  servicePrice: number;
  insurancePrice: number;
  fuelSurcharge: number;
  peakSeasonSurcharge: number;
  dangerousGoodsSurcharge: number;
  subtotalBeforeDiscount: number;
  volumeDiscount: number;
  contractDiscount: number;
  totalDiscount: number;
  subtotalAfterDiscount: number;
  tvaRate: number;
  tvaAmount: number;
  tapRate: number;
  tapAmount: number;
  lateDeliveryPenalty: number;
  totalPrice: number;
  totalPriceTTC: number;
  currency: string;
  /** Exchange rate info if conversion needed */
  exchangeRate?: number;
  originalCurrency?: string;
  originalAmount?: number;
}

/**
 * Calculate parcel shipping price with full breakdown (V2).
 * Includes: multi-devises, taxes algériennes, ristournes, surcharges.
 */
export function calculateParcelPrice(params: PriceCalculationParams): PriceBreakdown {
  const format = parcelFormats.find((f) => f.id === params.formatId) ?? parcelFormats[2]; // default M
  const basePrice = params.isInternational ? format.basePriceInternational : format.basePriceDomestic;

  // Weight surcharge: extra kg beyond base
  const weightSurcharge = params.weightKg > 0 ? Math.max(0, params.weightKg - 1) * format.pricePerKg : 0;

  // Volume surcharge: if actual volume exceeds format max, add 15%
  const actualVolume = params.lengthCm * params.widthCm * params.heightCm;
  const maxVolume = format.maxLength * format.maxWidth * format.maxHeight;
  const volumeSurcharge = actualVolume > maxVolume ? basePrice * 0.15 : 0;

  // Service level multiplier
  const serviceMultipliers: Record<string, number> = {
    express: 1.6,
    standard: 1.0,
    economy: 0.7,
    same_day: 2.2,
    next_day: 1.8,
  };
  const serviceMultiplier = serviceMultipliers[params.serviceLevel] ?? 1.0;
  const servicePrice = basePrice * (serviceMultiplier - 1);

  // Insurance: 2% of declared value
  const insurancePrice = params.insuranceAmount ? params.insuranceAmount * 0.02 : 0;

  // Fuel surcharge
  const fuelSurcharge = (params.fuelSurchargeRate ?? 0) / 100 * basePrice;

  // Peak season surcharge
  const peakSeasonSurcharge = (params.peakSurchargeRate ?? 0) / 100 * basePrice;

  // Dangerous goods surcharge
  const dangerousGoodsSurcharge = params.dangerousGoodsSurcharge
    ? basePrice * params.dangerousGoodsSurcharge / 100
    : 0;

  // Subtotal before discount
  const subtotalBeforeDiscount = basePrice + weightSurcharge + volumeSurcharge + servicePrice + insurancePrice + fuelSurcharge + peakSeasonSurcharge + dangerousGoodsSurcharge;

  // Volume discount (based on monthly shipment count + revenue)
  let volumeDiscountRate = 0;
  if ((params.monthlyShipmentCount ?? 0) >= 2000) volumeDiscountRate = 0.15;
  else if ((params.monthlyShipmentCount ?? 0) >= 1000) volumeDiscountRate = 0.12;
  else if ((params.monthlyShipmentCount ?? 0) >= 500) volumeDiscountRate = 0.08;
  else if ((params.monthlyShipmentCount ?? 0) >= 300) volumeDiscountRate = 0.05;
  else if ((params.monthlyShipmentCount ?? 0) >= 100) volumeDiscountRate = 0.03;
  const volumeDiscount = subtotalBeforeDiscount * volumeDiscountRate;

  // Contract discount
  const contractDiscountRate = (params.contractDiscount ?? 0) / 100;
  const contractDiscount = (subtotalBeforeDiscount - volumeDiscount) * contractDiscountRate;

  // Total discount
  const totalDiscount = volumeDiscount + contractDiscount;

  // Subtotal after discount
  const subtotalAfterDiscount = subtotalBeforeDiscount - totalDiscount;

  // Late delivery penalty
  const lateDeliveryPenalty = params.lateDeliveryPenalty ?? 0;

  // Tax calculation (Algeria)
  const isExport = params.isExport ?? false;
  const applyTVA = params.applyTVA ?? !isExport;
  const applyTAP = params.applyTAP ?? !isExport;
  const tvaRate = applyTVA && !isExport ? 19 : 0;
  const tapRate = applyTAP && !isExport ? 1 : 0;
  const tvaAmount = subtotalAfterDiscount * tvaRate / 100;
  const tapAmount = subtotalAfterDiscount * tapRate / 100;

  // Total HT and TTC
  const totalPrice = Math.round(subtotalAfterDiscount + lateDeliveryPenalty);
  const totalPriceTTC = Math.round(totalPrice + tvaAmount + tapAmount);

  return {
    basePrice,
    weightSurcharge,
    volumeSurcharge,
    serviceMultiplier,
    servicePrice,
    insurancePrice,
    fuelSurcharge,
    peakSeasonSurcharge,
    dangerousGoodsSurcharge,
    subtotalBeforeDiscount,
    volumeDiscount,
    contractDiscount,
    totalDiscount,
    subtotalAfterDiscount,
    tvaRate,
    tvaAmount,
    tapRate,
    tapAmount,
    lateDeliveryPenalty,
    totalPrice,
    totalPriceTTC,
    currency: params.currency ?? 'DZD',
  };
}

/**
 * Format price in DZD with thousands separator.
 */
export function formatPrice(amount: number, currency = 'DZD'): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' ' + currency;
}

// ─── ZPL Label Generation ──────────────────────────────────────

export interface ZPLLabelData {
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  dimensions: string;
  formatName: string;
  carrier: string;
  price: number;
  barcode: string;
  qrData: string;
  date: string;
  companyName: string;
}

/**
 * Generate ZPL code for a shipping label.
 * Supports multiple label formats and includes barcode + QR code.
 */
export function generateZPL(data: ZPLLabelData, formatId: string, dpi: PrinterDPI = 300): string {
  const format = labelFormats.find((f) => f.id === formatId) ?? labelFormats[0];
  const w = dpi === 203 ? format.widthDots203 : format.widthDots300;
  const h = dpi === 203 ? format.heightDots203 : format.heightDots300;

  // Scale factors relative to 4x6 at 300dpi
  const scaleX = w / 1200;
  const scaleY = h / 1800;

  const px = (x: number) => Math.round(x * scaleX);
  const py = (y: number) => Math.round(y * scaleY);
  const fs = (s: number) => Math.max(16, Math.round(s * Math.min(scaleX, scaleY)));

  // Generate barcode (Code 128)
  const barcodeY = py(50);
  const barcodeH = py(100);

  // QR Code position
  const qrY = py(170);
  const qrSize = py(180);

  const zpl = `^XA
^CI28
^PW${w}
^LL${h}

~~HEADER~~
^FO${px(20)},${py(15)}^A0N,${fs(28)},${fs(28)}^FD${data.companyName}^FS
^FO${px(20)},${py(50)}^A0N,${fs(18)},${fs(18)}^FD${data.date}^FS
^FO${px(500)},${py(15)}^A0N,${fs(22)},${fs(22)}^FD${data.formatName}^FS
^FO${px(500)},${py(45)}^A0N,${fs(14)},${fs(14)}^FD${data.carrier}^FS

~~SEPARATOR~~
^FO${px(10)},${py(80)}^GB${w - px(20)},1,3^FS

~~BARCODE~~
^FO${px(20)},${barcodeY}^BY3,,${barcodeH}^BCN,${barcodeH},Y,N,N^FD${data.barcode}^FS

~~QR CODE~~
^FO${w - qrSize - px(20)},${qrY}^BQN,2,${Math.max(3, Math.round(5 * Math.min(scaleX, scaleY)))}^FDMA,${data.qrData}^FS

~~SENDER~~
^FO${px(20)},${py(290)}^A0N,${fs(14)},${fs(14)}^FDEXPEDITEUR^FS
^FO${px(20)},${py(310)}^A0N,${fs(20)},${fs(20)}^FD${data.senderName}^FS
^FO${px(20)},${py(335)}^A0N,${fs(14)},${fs(14)}^FD${data.senderAddress}^FS
^FO${px(20)},${py(355)}^A0N,${fs(14)},${fs(14)}^FD${data.senderPhone}^FS

~~SEPARATOR~~
^FO${px(10)},${py(380)}^GB${w - px(20)},1,3^FS

~~RECEIVER~~
^FO${px(20)},${py(395)}^A0N,${fs(14)},${fs(14)}^FDDESTINATAIRE^FS
^FO${px(20)},${py(415)}^A0N,${fs(24)},${fs(24)}^FD${data.receiverName}^FS
^FO${px(20)},${py(445)}^A0N,${fs(16)},${fs(16)}^FD${data.receiverAddress}^FS
^FO${px(20)},${py(465)}^A0N,${fs(14)},${fs(14)}^FD${data.receiverPhone}^FS

~~SEPARATOR~~
^FO${px(10)},${py(490)}^GB${w - px(20)},1,3^FS

~~PARCEL INFO~~
^FO${px(20)},${py(505)}^A0N,${fs(14)},${fs(14)}^FDPoids: ${data.weight} kg^FS
^FO${px(250)},${py(505)}^A0N,${fs(14)},${fs(14)}^FDDim: ${data.dimensions}^FS
^FO${px(20)},${py(530)}^A0N,${fs(20)},${fs(20)}^FD${formatPrice(data.price)}^FS

~~TRACKING~~
^FO${px(20)},${py(560)}^A0N,${fs(18)},${fs(18)}^FD${data.trackingNumber}^FS

^XZ`;

  return zpl;
}

/**
 * Generate a simulated label preview as an SVG string.
 * This is used to display a visual preview of the label in the browser.
 */
export function generateLabelPreviewSVG(data: ZPLLabelData, formatId: string): string {
  const format = labelFormats.find((f) => f.id === formatId) ?? labelFormats[0];
  const scale = 2; // px per mm
  const w = format.widthMm * scale;
  const h = format.heightMm * scale;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="white" stroke="#ccc" stroke-width="1"/>
  
  <!-- Header -->
  <rect x="4" y="4" width="${w - 8}" height="24" rx="2" fill="#0d9488" opacity="0.1"/>
  <text x="8" y="18" font-family="monospace" font-size="9" font-weight="bold" fill="#0d9488">${data.companyName}</text>
  <text x="${w - 8}" y="18" font-family="monospace" font-size="7" fill="#666" text-anchor="end">${data.date}</text>
  
  <!-- Barcode area -->
  <rect x="8" y="32" width="${w - 16}" height="40" rx="2" fill="#f5f5f5"/>
  <text x="${w / 2}" y="52" font-family="monospace" font-size="8" fill="#333" text-anchor="middle">||| |||| ||| |||| ||| ${data.barcode} ||| |||| |||</text>
  <text x="${w / 2}" y="66" font-family="monospace" font-size="7" fill="#666" text-anchor="middle">${data.trackingNumber}</text>
  
  <!-- Sender -->
  <line x1="8" y1="76" x2="${w - 8}" y2="76" stroke="#ddd" stroke-width="0.5"/>
  <text x="8" y="86" font-family="sans-serif" font-size="5" fill="#999">EXPEDITEUR</text>
  <text x="8" y="95" font-family="sans-serif" font-size="7" font-weight="bold" fill="#333">${data.senderName}</text>
  <text x="8" y="103" font-family="sans-serif" font-size="5" fill="#666">${data.senderAddress}</text>
  <text x="8" y="110" font-family="sans-serif" font-size="5" fill="#666">${data.senderPhone}</text>
  
  <!-- Receiver -->
  <line x1="8" y1="116" x2="${w - 8}" y2="116" stroke="#ddd" stroke-width="0.5"/>
  <text x="8" y="126" font-family="sans-serif" font-size="5" fill="#999">DESTINATAIRE</text>
  <text x="8" y="136" font-family="sans-serif" font-size="8" font-weight="bold" fill="#333">${data.receiverName}</text>
  <text x="8" y="145" font-family="sans-serif" font-size="6" fill="#666">${data.receiverAddress}</text>
  <text x="8" y="153" font-family="sans-serif" font-size="5" fill="#666">${data.receiverPhone}</text>
  
  <!-- Parcel info -->
  <line x1="8" y1="160" x2="${w - 8}" y2="160" stroke="#ddd" stroke-width="0.5"/>
  <text x="8" y="170" font-family="sans-serif" font-size="5" fill="#999">INFOS COLIS</text>
  <text x="8" y="179" font-family="sans-serif" font-size="6" fill="#333">Poids: ${data.weight} kg | Dim: ${data.dimensions}</text>
  <text x="8" y="189" font-family="sans-serif" font-size="7" font-weight="bold" fill="#0d9488">${formatPrice(data.price)}</text>
  <text x="${w - 8}" y="189" font-family="sans-serif" font-size="5" fill="#999" text-anchor="end">${data.carrier}</text>
  
  <!-- QR placeholder -->
  <rect x="${w - 40}" y="32" width="32" height="32" rx="2" fill="#f5f5f5" stroke="#ddd"/>
  <text x="${w - 24}" y="52" font-family="sans-serif" font-size="5" fill="#999" text-anchor="middle">QR</text>
</svg>`;
}

// ─── Local Storage Keys ────────────────────────────────────────

const PRINTERS_KEY = 'freightflow-printers';
const DEFAULT_PRINTER_KEY = 'freightflow-default-printer';
const LABEL_SETTINGS_KEY = 'freightflow-label-settings';

export interface LabelSettings {
  defaultLabelFormat: string;
  defaultPrinterId: string;
  autoPrintOnCreate: boolean;
  includePriceOnLabel: boolean;
  includeQRCode: boolean;
  includeBarcode: boolean;
  labelCopies: number;
}

export const defaultLabelSettings: LabelSettings = {
  defaultLabelFormat: '4x6',
  defaultPrinterId: 'printer-1',
  autoPrintOnCreate: false,
  includePriceOnLabel: true,
  includeQRCode: true,
  includeBarcode: true,
  labelCopies: 1,
};

export function loadPrinters(): ZebraPrinter[] {
  if (typeof window === 'undefined') return defaultPrinters;
  try {
    const raw = localStorage.getItem(PRINTERS_KEY);
    if (raw) return JSON.parse(raw) as ZebraPrinter[];
  } catch { /* ignore */ }
  return defaultPrinters;
}

export function savePrinters(printers: ZebraPrinter[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRINTERS_KEY, JSON.stringify(printers));
}

export function loadLabelSettings(): LabelSettings {
  if (typeof window === 'undefined') return defaultLabelSettings;
  try {
    const raw = localStorage.getItem(LABEL_SETTINGS_KEY);
    if (raw) return { ...defaultLabelSettings, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultLabelSettings;
}

export function saveLabelSettings(settings: LabelSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LABEL_SETTINGS_KEY, JSON.stringify(settings));
}

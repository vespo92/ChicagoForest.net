/**
 * Bill of Materials (BOM) Generator
 *
 * Generates detailed bills of materials for mesh network node configurations.
 * Includes pricing, sources, and documentation links.
 *
 * DISCLAIMER: This is an AI-generated educational framework. Prices are
 * estimates and may vary. Always verify current pricing before purchasing.
 *
 * @module @chicago-forest/hardware-hal/bom-generator
 */

import {
  RASPBERRY_PI_SPECS,
  type MeshNodeConfig,
  type RaspberryPiSpec,
  type PiHATSpec,
} from './nodes/raspberry-pi-node';

import {
  ESP32_SPECS,
  type ESP32NodeConfig,
  type ESP32BoardSpec,
} from './nodes/esp32-node';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Bill of Materials line item
 */
export interface BOMLineItem {
  /** Item name */
  name: string;
  /** Category */
  category: BOMCategory;
  /** Quantity */
  quantity: number;
  /** Unit price (USD) */
  unitPrice: number;
  /** Extended price (USD) */
  extendedPrice: number;
  /** Primary source URL */
  sourceUrl: string;
  /** Alternative sources */
  alternativeSources?: string[];
  /** Notes */
  notes?: string;
  /** SKU or part number */
  sku?: string;
  /** Lead time (days) */
  leadTime?: number;
}

/**
 * BOM item categories
 */
export type BOMCategory =
  | 'compute'          // Raspberry Pi, ESP32
  | 'radio'            // LoRa modules, WiFi adapters
  | 'antenna'          // Antennas and cables
  | 'power'            // Solar panels, batteries, chargers
  | 'enclosure'        // Cases, weatherproofing
  | 'cable'            // Cables, connectors
  | 'accessory'        // HATs, adapters, misc
  | 'storage'          // SD cards, SSDs
  | 'mounting'         // Poles, brackets
  | 'networking';      // Ethernet, PoE

/**
 * Complete Bill of Materials
 */
export interface BillOfMaterials {
  /** Configuration name */
  configurationName: string;
  /** Description */
  description: string;
  /** Generated date */
  generatedDate: string;
  /** Line items */
  items: BOMLineItem[];
  /** Subtotal by category */
  categoryTotals: Record<BOMCategory, number>;
  /** Total cost */
  totalCost: number;
  /** Estimated shipping (10% of total) */
  estimatedShipping: number;
  /** Grand total with shipping */
  grandTotal: number;
  /** Notes and recommendations */
  notes: string[];
  /** Assembly time estimate (hours) */
  assemblyTimeHours: number;
  /** Skill level required */
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

// =============================================================================
// COMMON COMPONENTS
// =============================================================================

/**
 * Common components that can be added to any BOM
 */
export const COMMON_COMPONENTS = {
  // Storage
  microSD32GB: {
    name: 'SanDisk 32GB Industrial microSD',
    category: 'storage' as BOMCategory,
    unitPrice: 15,
    sourceUrl: 'https://www.amazon.com/dp/B07P14QHB7',
    notes: 'Industrial grade, high endurance',
  },
  microSD64GB: {
    name: 'SanDisk 64GB High Endurance microSD',
    category: 'storage' as BOMCategory,
    unitPrice: 20,
    sourceUrl: 'https://www.amazon.com/dp/B07P3D6Y5B',
    notes: 'High endurance for continuous write',
  },

  // Power supplies
  usbC5V3A: {
    name: 'Official Raspberry Pi 5V 3A USB-C Power Supply',
    category: 'power' as BOMCategory,
    unitPrice: 12,
    sourceUrl: 'https://www.raspberrypi.com/products/type-c-power-supply/',
    notes: 'Official Pi power supply, recommended',
  },
  usbC5V5A: {
    name: 'Raspberry Pi 27W USB-C Power Supply (Pi 5)',
    category: 'power' as BOMCategory,
    unitPrice: 15,
    sourceUrl: 'https://www.raspberrypi.com/products/27w-power-supply/',
    notes: 'Required for Pi 5',
  },

  // Antennas
  loraOmni3dbi: {
    name: '915MHz 3dBi Omni Antenna (SMA)',
    category: 'antenna' as BOMCategory,
    unitPrice: 12,
    sourceUrl: 'https://www.amazon.com/dp/B08LVGGZPR',
    notes: 'Basic omni, good for portable use',
  },
  loraOmni5dbi: {
    name: '915MHz 5dBi Fiberglass Omni Antenna',
    category: 'antenna' as BOMCategory,
    unitPrice: 35,
    sourceUrl: 'https://www.amazon.com/dp/B086YV2QLS',
    notes: 'Outdoor rated, higher gain',
  },
  loraOmni8dbi: {
    name: '915MHz 8dBi Outdoor Omni Antenna',
    category: 'antenna' as BOMCategory,
    unitPrice: 55,
    sourceUrl: 'https://www.amazon.com/dp/B09NLFM4QC',
    notes: 'High gain outdoor antenna',
  },

  // Cables
  smaExtension3ft: {
    name: 'SMA Extension Cable 3ft',
    category: 'cable' as BOMCategory,
    unitPrice: 8,
    sourceUrl: 'https://www.amazon.com/dp/B01LXQT9JO',
    notes: 'Low loss coax',
  },
  uflToSma: {
    name: 'U.FL to SMA Female Pigtail',
    category: 'cable' as BOMCategory,
    unitPrice: 6,
    sourceUrl: 'https://www.amazon.com/dp/B01AJQ33Y4',
    notes: 'For connecting external antenna to module',
  },
  ethernetCat6: {
    name: 'Cat6 Ethernet Cable (various lengths)',
    category: 'cable' as BOMCategory,
    unitPrice: 8,
    sourceUrl: 'https://www.amazon.com/dp/B01IQWGI0O',
    notes: '6ft cable, outdoor rated available',
  },

  // Enclosures
  outdoorEnclosureSmall: {
    name: 'IP67 ABS Enclosure 6x4x3"',
    category: 'enclosure' as BOMCategory,
    unitPrice: 18,
    sourceUrl: 'https://www.amazon.com/dp/B08B3X2K7H',
    notes: 'Waterproof, suitable for small nodes',
  },
  outdoorEnclosureLarge: {
    name: 'IP67 ABS Enclosure 10x6x4"',
    category: 'enclosure' as BOMCategory,
    unitPrice: 28,
    sourceUrl: 'https://www.amazon.com/dp/B07VVKR6P7',
    notes: 'Fits Pi with HATs',
  },
  cableGland: {
    name: 'PG7 Waterproof Cable Glands (5-pack)',
    category: 'enclosure' as BOMCategory,
    unitPrice: 8,
    sourceUrl: 'https://www.amazon.com/dp/B08CV7M3PZ',
    notes: 'For antenna and power cables',
  },

  // Mounting
  poleMountClamp: {
    name: 'Universal Pole Mount Clamp',
    category: 'mounting' as BOMCategory,
    unitPrice: 15,
    sourceUrl: 'https://www.amazon.com/dp/B00HXAN39Q',
    notes: 'Fits 1-2.5" poles',
  },
  wallMountBracket: {
    name: 'L-Bracket Wall Mount',
    category: 'mounting' as BOMCategory,
    unitPrice: 10,
    sourceUrl: 'https://www.amazon.com/dp/B0C2L5X9P1',
    notes: 'Stainless steel, outdoor rated',
  },

  // Solar
  solarPanel6W: {
    name: '6W 6V Solar Panel',
    category: 'power' as BOMCategory,
    unitPrice: 20,
    sourceUrl: 'https://www.amazon.com/dp/B00CBT8GJG',
    notes: 'Compact, for ESP32 nodes',
  },
  solarPanel20W: {
    name: '20W 12V Monocrystalline Solar Panel',
    category: 'power' as BOMCategory,
    unitPrice: 40,
    sourceUrl: 'https://www.renogy.com/20-watt-12-volt-monocrystalline-solar-panel/',
    notes: 'Efficient, compact',
  },
  lifepo4_12v6ah: {
    name: '12V 6Ah LiFePO4 Battery',
    category: 'power' as BOMCategory,
    unitPrice: 45,
    sourceUrl: 'https://www.amazon.com/dp/B0B8R9S3YW',
    notes: 'Long cycle life, safe chemistry',
  },
  lipo_3000mah: {
    name: '3.7V 3000mAh LiPo Battery',
    category: 'power' as BOMCategory,
    unitPrice: 12,
    sourceUrl: 'https://www.amazon.com/dp/B08214DJLJ',
    notes: 'For ESP32 boards',
  },
  battery18650: {
    name: '18650 3000mAh LiIon Battery',
    category: 'power' as BOMCategory,
    unitPrice: 8,
    sourceUrl: 'https://www.amazon.com/dp/B07H3J6NY8',
    notes: 'For T-Beam and similar',
  },

  // PoE
  poeInjector: {
    name: 'PoE+ Injector (802.3at)',
    category: 'networking' as BOMCategory,
    unitPrice: 25,
    sourceUrl: 'https://www.amazon.com/dp/B07VB27JJL',
    notes: 'Provides power and data over Ethernet',
  },
  outdoorEthernetCat6: {
    name: 'Outdoor Rated Cat6 Cable 50ft',
    category: 'cable' as BOMCategory,
    unitPrice: 25,
    sourceUrl: 'https://www.amazon.com/dp/B07QLXC6QR',
    notes: 'UV and water resistant',
  },

  // Protection
  lightningArrestor: {
    name: 'Coax Lightning Arrestor (N-type)',
    category: 'accessory' as BOMCategory,
    unitPrice: 25,
    sourceUrl: 'https://www.amazon.com/dp/B00HXT83S0',
    notes: 'Essential for outdoor antenna installations',
  },
  groundingKit: {
    name: 'Grounding Kit with Rod',
    category: 'accessory' as BOMCategory,
    unitPrice: 40,
    sourceUrl: 'https://www.amazon.com/dp/B000BQNVNG',
    notes: 'For lightning protection',
  },
};

// =============================================================================
// BOM GENERATOR FUNCTIONS
// =============================================================================

/**
 * Generate BOM for Raspberry Pi mesh node configuration
 */
export function generatePiBOM(config: MeshNodeConfig): BillOfMaterials {
  const items: BOMLineItem[] = [];
  const notes: string[] = [];

  // Add Pi board
  items.push({
    name: config.piModel.model,
    category: 'compute',
    quantity: 1,
    unitPrice: config.piModel.price,
    extendedPrice: config.piModel.price,
    sourceUrl: config.piModel.productUrl,
    notes: `${config.piModel.memoryOptions[config.piModel.memoryOptions.length - 1]}MB recommended`,
  });

  // Add HATs
  for (const hat of config.hats) {
    items.push({
      name: hat.name,
      category: 'accessory',
      quantity: 1,
      unitPrice: hat.price,
      extendedPrice: hat.price,
      sourceUrl: hat.productUrl,
      notes: hat.notes.join('; '),
    });
  }

  // Add SD card
  items.push({
    ...COMMON_COMPONENTS.microSD32GB,
    quantity: 1,
    extendedPrice: COMMON_COMPONENTS.microSD32GB.unitPrice,
  });

  // Add power supply if not PoE
  const hasPoE = config.hats.some(h => h.type === 'poe');
  if (hasPoE) {
    items.push({
      ...COMMON_COMPONENTS.poeInjector,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.poeInjector.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.outdoorEthernetCat6,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.outdoorEthernetCat6.unitPrice,
    });
    notes.push('PoE configuration - ensure PoE switch or injector is compatible with IEEE 802.3at');
  } else {
    items.push({
      ...COMMON_COMPONENTS.usbC5V3A,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.usbC5V3A.unitPrice,
    });
  }

  // Add antenna for LoRa configurations
  const hasLoRa = config.hats.some(h => h.type === 'lora');
  if (hasLoRa) {
    items.push({
      ...COMMON_COMPONENTS.loraOmni5dbi,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.loraOmni5dbi.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.uflToSma,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.uflToSma.unitPrice,
    });
    notes.push('Position antenna vertically for best omnidirectional coverage');
  }

  // Add enclosure for outdoor deployments
  if (config.useCase === 'lora-gateway' || config.useCase === 'relay') {
    items.push({
      ...COMMON_COMPONENTS.outdoorEnclosureLarge,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.outdoorEnclosureLarge.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.cableGland,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.cableGland.unitPrice,
    });
    notes.push('Use silicone sealant around cable glands for additional waterproofing');
  }

  // Calculate totals
  const categoryTotals = calculateCategoryTotals(items);
  const totalCost = items.reduce((sum, item) => sum + item.extendedPrice, 0);
  const estimatedShipping = Math.round(totalCost * 0.1);

  // Add configuration-specific notes
  notes.push(...config.notes);

  return {
    configurationName: config.name,
    description: config.description,
    generatedDate: new Date().toISOString(),
    items,
    categoryTotals,
    totalCost,
    estimatedShipping,
    grandTotal: totalCost + estimatedShipping,
    notes,
    assemblyTimeHours: 2,
    skillLevel: 'intermediate',
  };
}

/**
 * Generate BOM for ESP32 mesh node configuration
 */
export function generateESP32BOM(config: ESP32NodeConfig): BillOfMaterials {
  const items: BOMLineItem[] = [];
  const notes: string[] = [];

  // Add board
  items.push({
    name: config.board.name,
    category: 'compute',
    quantity: 1,
    unitPrice: config.board.price,
    extendedPrice: config.board.price,
    sourceUrl: config.board.productUrl,
    notes: config.board.notes.join('; '),
  });

  // Add battery based on battery type
  if (config.board.battery.connector === '18650') {
    items.push({
      ...COMMON_COMPONENTS.battery18650,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.battery18650.unitPrice,
    });
  } else if (config.board.battery.connector === 'JST-PH') {
    items.push({
      ...COMMON_COMPONENTS.lipo_3000mah,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.lipo_3000mah.unitPrice,
    });
  }

  // Add antenna
  if (config.board.loraRadio?.connector === 'SMA') {
    items.push({
      ...COMMON_COMPONENTS.loraOmni3dbi,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.loraOmni3dbi.unitPrice,
    });
  } else if (config.board.loraRadio?.connector === 'U.FL') {
    items.push({
      ...COMMON_COMPONENTS.uflToSma,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.uflToSma.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.loraOmni3dbi,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.loraOmni3dbi.unitPrice,
    });
  }

  // Solar nodes need panel and enclosure
  if (config.useCase === 'solar-relay') {
    items.push({
      ...COMMON_COMPONENTS.solarPanel6W,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.solarPanel6W.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.outdoorEnclosureSmall,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.outdoorEnclosureSmall.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.cableGland,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.cableGland.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.poleMountClamp,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.poleMountClamp.unitPrice,
    });
    notes.push('Orient solar panel facing south (N. hemisphere) at latitude angle');
  }

  // Fixed relay needs power supply and mounting
  if (config.useCase === 'fixed-relay') {
    items.push({
      ...COMMON_COMPONENTS.loraOmni8dbi,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.loraOmni8dbi.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.outdoorEnclosureSmall,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.outdoorEnclosureSmall.unitPrice,
    });
    items.push({
      ...COMMON_COMPONENTS.lightningArrestor,
      quantity: 1,
      extendedPrice: COMMON_COMPONENTS.lightningArrestor.unitPrice,
    });
    notes.push('Install lightning arrestor for tall antenna installations');
  }

  // Calculate totals
  const categoryTotals = calculateCategoryTotals(items);
  const totalCost = items.reduce((sum, item) => sum + item.extendedPrice, 0);
  const estimatedShipping = Math.round(totalCost * 0.1);

  // Add configuration-specific notes
  notes.push(...config.notes);

  return {
    configurationName: config.name,
    description: config.description,
    generatedDate: new Date().toISOString(),
    items,
    categoryTotals,
    totalCost,
    estimatedShipping,
    grandTotal: totalCost + estimatedShipping,
    notes,
    assemblyTimeHours: 1,
    skillLevel: 'beginner',
  };
}

/**
 * Calculate category totals
 */
function calculateCategoryTotals(items: BOMLineItem[]): Record<BOMCategory, number> {
  const totals: Record<BOMCategory, number> = {
    compute: 0,
    radio: 0,
    antenna: 0,
    power: 0,
    enclosure: 0,
    cable: 0,
    accessory: 0,
    storage: 0,
    mounting: 0,
    networking: 0,
  };

  for (const item of items) {
    totals[item.category] += item.extendedPrice;
  }

  return totals;
}

/**
 * Format BOM as markdown table
 */
export function formatBOMAsMarkdown(bom: BillOfMaterials): string {
  const lines: string[] = [];

  lines.push(`# Bill of Materials: ${bom.configurationName}`);
  lines.push('');
  lines.push(`**Description:** ${bom.description}`);
  lines.push(`**Generated:** ${bom.generatedDate}`);
  lines.push(`**Skill Level:** ${bom.skillLevel}`);
  lines.push(`**Assembly Time:** ${bom.assemblyTimeHours} hours`);
  lines.push('');
  lines.push('## Components');
  lines.push('');
  lines.push('| Item | Category | Qty | Unit Price | Extended | Source |');
  lines.push('|------|----------|-----|------------|----------|--------|');

  for (const item of bom.items) {
    lines.push(
      `| ${item.name} | ${item.category} | ${item.quantity} | $${item.unitPrice.toFixed(2)} | $${item.extendedPrice.toFixed(2)} | [Link](${item.sourceUrl}) |`
    );
  }

  lines.push('');
  lines.push('## Cost Summary');
  lines.push('');
  lines.push('| Category | Total |');
  lines.push('|----------|-------|');

  for (const [category, total] of Object.entries(bom.categoryTotals)) {
    if (total > 0) {
      lines.push(`| ${category} | $${total.toFixed(2)} |`);
    }
  }

  lines.push('');
  lines.push(`**Subtotal:** $${bom.totalCost.toFixed(2)}`);
  lines.push(`**Est. Shipping:** $${bom.estimatedShipping.toFixed(2)}`);
  lines.push(`**Grand Total:** $${bom.grandTotal.toFixed(2)}`);
  lines.push('');
  lines.push('## Notes');
  lines.push('');

  for (const note of bom.notes) {
    lines.push(`- ${note}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('*Prices are estimates and may vary. Generated by Chicago Forest Network BOM Generator.*');

  return lines.join('\n');
}

/**
 * Format BOM as CSV
 */
export function formatBOMAsCSV(bom: BillOfMaterials): string {
  const lines: string[] = [];

  lines.push('Item,Category,Quantity,Unit Price,Extended Price,Source URL,Notes');

  for (const item of bom.items) {
    const notes = (item.notes || '').replace(/"/g, '""');
    lines.push(
      `"${item.name}","${item.category}",${item.quantity},${item.unitPrice.toFixed(2)},${item.extendedPrice.toFixed(2)},"${item.sourceUrl}","${notes}"`
    );
  }

  return lines.join('\n');
}

// =============================================================================
// EXPORTS
// =============================================================================

export const BOM_GENERATOR = {
  generatePiBOM,
  generateESP32BOM,
  formatAsMarkdown: formatBOMAsMarkdown,
  formatAsCSV: formatBOMAsCSV,
  components: COMMON_COMPONENTS,
};

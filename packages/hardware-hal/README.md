# @chicago-forest/hardware-hal

> Hardware Abstraction Layer for Chicago Forest Network mesh nodes

**DISCLAIMER:** This is part of an AI-generated theoretical framework for educational and research purposes. The hardware specifications documented here are based on REAL products with verified sources, but the Chicago Forest Network itself is a conceptual project.

## Overview

The Hardware Abstraction Layer (HAL) provides comprehensive specifications for building community mesh network nodes. It documents real hardware products, RF calculators, and deployment configurations.

## Installation

```bash
pnpm add @chicago-forest/hardware-hal
```

## Features

### Radio Specifications

| Radio Type | Bands | Use Case | Range |
|------------|-------|----------|-------|
| LoRa | 915 MHz (US), 868 MHz (EU) | Long-range IoT, Meshtastic | 2-15 km |
| WiFi Mesh | 2.4/5/6 GHz | Local mesh, client access | 100-500m |
| 60 GHz Backhaul | 57-71 GHz | Point-to-point links | 1-2 km |

### Supported Hardware

#### LoRa Modules
- **Semtech SX1262** - Latest generation, best sensitivity (-148 dBm)
- **Semtech SX1276/78** - Widely deployed, proven reliability
- **RAK4631** - nRF52840 + SX1262, WisBlock ecosystem
- **LILYGO T-Beam** - ESP32 + GPS + LoRa, Meshtastic ready
- **Heltec WiFi LoRa 32 V3** - ESP32-S3 + OLED + LoRa

#### Raspberry Pi Nodes
- **Raspberry Pi 5** - Best performance, PCIe for NVMe
- **Raspberry Pi 4B** - Proven workhorse, excellent support
- **Raspberry Pi Zero 2W** - Low power, perfect for solar nodes
- **Raspberry Pi 3B+** - Budget option, good mesh support

#### Pi HATs
- **PoE+ HAT** - Single cable power and data
- **RAK2287** - 8-channel LoRaWAN concentrator
- **Waveshare SX1262** - Single channel LoRa
- **PiJuice** - Solar + battery UPS
- **Sixfab LTE** - Cellular backhaul

## Quick Start

### Basic Link Budget Calculation

```typescript
import {
  calculateLinkBudget,
  RADIO_PRESETS,
  quickLinkBudget
} from '@chicago-forest/hardware-hal';

// Quick calculation with LoRa preset
const result = quickLinkBudget(RADIO_PRESETS.lora_915_sf12, 5); // 5 km

console.log(`Max range: ${result.maxDistanceKm} km`);
console.log(`Link viable: ${result.isViable}`);
console.log(`Margin: ${result.linkMarginDb} dB`);
```

### LoRa Airtime Calculation

```typescript
import { calculateLoRaAirtime } from '@chicago-forest/hardware-hal';

// Calculate time on air for a 50-byte packet
const airtimeMs = calculateLoRaAirtime(
  50,     // payload bytes
  12,     // spreading factor
  125000, // bandwidth Hz
  5       // coding rate (4/5)
);

console.log(`Airtime: ${airtimeMs.toFixed(1)} ms`);
```

### Hardware Configuration

```typescript
import {
  RASPBERRY_PI_SPECS,
  LORAWAN_GATEWAY_CONFIG
} from '@chicago-forest/hardware-hal';

// Get Raspberry Pi 4B specifications
const pi4 = RASPBERRY_PI_SPECS.models.PI_4B;
console.log(`${pi4.model}: ${pi4.memoryOptions}MB RAM options`);

// Get complete LoRaWAN gateway configuration
const gateway = LORAWAN_GATEWAY_CONFIG;
console.log(`Total cost: $${gateway.estimatedCost}`);
console.log(`Power: ${gateway.powerConsumption.typical}W typical`);
```

## Module Structure

```
@chicago-forest/hardware-hal
├── radios/
│   ├── lora-specs.ts      # LoRa chips, modules, regional plans
│   ├── wifi-mesh.ts       # WiFi mesh specifications
│   └── ubiquiti-integration.ts  # UISP compatibility
├── nodes/
│   ├── raspberry-pi-node.ts  # Pi models, HATs, configurations
│   ├── openwrt-router.ts     # Router-based nodes
│   └── solar-powered.ts      # Solar power systems
├── antennas/
│   ├── omnidirectional.ts    # Omni antennas
│   ├── directional.ts        # Panel, Yagi, dishes
│   └── diy-designs.ts        # Community antenna projects
├── power/
│   ├── solar-specs.ts        # Solar panel sizing
│   ├── battery-systems.ts    # LiFePO4, lead-acid
│   └── power-budget.ts       # Power consumption calculator
└── calculators/
    ├── link-budget.ts        # RF link budget
    └── coverage-area.ts      # Coverage estimation
```

## RF Calculators

### Link Budget Calculator

Implements the Friis transmission equation with environment modeling:

```typescript
import { calculateLinkBudget, ENVIRONMENT_LOSS_FACTORS } from '@chicago-forest/hardware-hal';

const result = calculateLinkBudget({
  txPowerDbm: 22,
  txAntennaGainDbi: 6,
  txCableLossDb: 1,
  rxAntennaGainDbi: 6,
  rxCableLossDb: 1,
  rxSensitivityDbm: -137,
  frequencyMhz: 915,
  distanceKm: 10,
  fadeMarginDb: 15,
  additionalLossesDb: 0
});

console.log(result.breakdown);
// {
//   txPower: 22,
//   txAntennaGain: 6,
//   txCableLoss: 1,
//   eirp: 27,
//   fspl: 111.65,
//   additionalLosses: 0,
//   rxAntennaGain: 6,
//   rxCableLoss: 1,
//   receivedPower: -79.65,
//   sensitivity: -137,
//   margin: 57.35
// }
```

### Fresnel Zone Calculator

Calculate required clearance for reliable RF links:

```typescript
import { calculateRequiredClearance } from '@chicago-forest/hardware-hal';

const clearance = calculateRequiredClearance(5, 915, 60);
console.log(`Required clearance at midpoint: ${clearance.requiredClearanceM}m`);
```

### LoRa Range Estimator

```typescript
import { estimateLoRaRange } from '@chicago-forest/hardware-hal';

const range = estimateLoRaRange(22, 3, 12, 125000);
console.log(`Urban: ${range.urban} km`);
console.log(`Suburban: ${range.suburban} km`);
console.log(`Rural: ${range.rural} km`);
console.log(`Line of sight: ${range.los} km`);
```

## Node Configurations

### Pre-configured Node Types

| Configuration | Use Case | Cost | Power |
|--------------|----------|------|-------|
| LoRaWAN Gateway | 8-channel gateway | $350 | 6-10W |
| Meshtastic Relay | Solar-powered relay | $150 | 1.5-3W |
| WiFi Mesh Gateway | Internet gateway | $120 | 8-15W |

### Custom Configuration

```typescript
import {
  RASPBERRY_PI_4B,
  RAK2287_PI_HAT,
  PI_POE_PLUS_HAT,
  type MeshNodeConfig
} from '@chicago-forest/hardware-hal';

const customGateway: MeshNodeConfig = {
  name: 'Custom Community Gateway',
  description: 'High-capacity community gateway',
  useCase: 'gateway',
  piModel: RASPBERRY_PI_4B,
  hats: [RAK2287_PI_HAT, PI_POE_PLUS_HAT],
  externalHardware: ['8 dBi omni antenna', 'IP67 enclosure'],
  recommendedOS: 'ChirpStack Gateway OS',
  software: ['ChirpStack', 'Prometheus', 'Grafana'],
  estimatedCost: 400,
  powerConsumption: { typical: 8, max: 12 },
  notes: ['Position for maximum coverage']
};
```

## Power System Sizing

```typescript
import { calculateSolarSystemSize } from '@chicago-forest/hardware-hal';

// Size a solar system for Chicago
const system = calculateSolarSystemSize({
  dailyConsumptionWh: 50,
  location: 'Chicago',
  daysAutonomy: 3,
  batteryType: 'lifepo4'
});

console.log(`Panel size: ${system.panelWatts}W`);
console.log(`Battery capacity: ${system.batteryAh}Ah`);
```

## Verified Sources

All specifications are documented from verified manufacturer sources:

- **LoRa Alliance**: https://lora-alliance.org/
- **Semtech Datasheets**: https://www.semtech.com/products/wireless-rf/lora-connect/
- **Raspberry Pi Foundation**: https://www.raspberrypi.com/documentation/
- **RAK Wireless**: https://docs.rakwireless.com/
- **FCC Part 15**: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-15
- **ITU-R Propagation Models**: https://www.itu.int/rec/R-REC-P/en

## Meshtastic Compatibility

The HAL includes Meshtastic channel presets for easy integration:

```typescript
import { MESHTASTIC_PRESETS } from '@chicago-forest/hardware-hal';

console.log(MESHTASTIC_PRESETS.LONG_FAST);
// {
//   name: 'Long/Fast',
//   spreadingFactor: 11,
//   bandwidth: 250000,
//   codingRate: 5,
//   txPower: 22,
//   description: 'Long range with decent throughput. Default preset.'
// }
```

## Contributing

Contributions are welcome! Please ensure:

1. All hardware specs include verified source URLs
2. Calculations follow established RF engineering formulas
3. Disclaimers are maintained for theoretical components
4. Tests are added for any new calculators

## License

MIT - See LICENSE file for details.

---

**Remember:** This HAL documents REAL hardware for a THEORETICAL network framework. Always verify specifications before purchasing hardware for your own projects.

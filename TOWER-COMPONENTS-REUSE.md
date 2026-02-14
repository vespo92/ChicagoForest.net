# Tower Network Components - Reuse Guide

Instructions for extracting the P2P / Multipoint network visualization components from ChicagoForest.net and adapting them for a tower company's site.

---

## Stack Overview

| Layer         | Technology             | Version  |
|---------------|------------------------|----------|
| Framework     | Next.js (App Router)   | 15.5.0   |
| UI Library    | React                  | 19.1.0   |
| Language      | TypeScript             | ^5       |
| Styling       | Tailwind CSS           | ^3.4.0   |
| Animations    | tailwindcss-animate    | ^1.0.7   |
| Icons         | lucide-react           | ^0.541.0 |
| Class Merging | clsx + tailwind-merge  | ^2.1.1 / ^3.3.1 |
| Class Variants| class-variance-authority | ^0.7.1 |

No Three.js, Canvas, or WebGL — everything is SVG + CSS animations.

---

## package.json (Minimal for Reuse)

Create a new Next.js project and install these dependencies:

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.541.0",
    "next": "15.5.0",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5"
  }
}
```

---

## Components to Extract

### 1. PlasmaForestDiagram (Main Tower Network Map)

**Source:** `apps/web/components/PlasmaForestDiagram.tsx`

This is the primary interactive network topology visualization — the "tower node looking thing." It renders:

- **SVG-based interactive map** (viewBox `0 0 100 100`) with nodes and connection lines
- **Animated energy flow** — small circles traveling along connection paths via SVG `<animateMotion>` (3s infinite loop)
- **Pulsing coverage circles** — `animate-pulse` around each node, radius scaled by node type (hub=15, community=10, residential=5)
- **Click-to-select** nodes with a detail panel showing type, capacity, connected node count
- **Network stats panel** — total nodes, hub count, total capacity, coverage, efficiency
- **Legend** — differentiates hub stations, community nodes, and residential endpoints

**What to change for your tower company:**
- Replace the `nodes` array with your actual tower site locations (lat/lng converted to x/y coordinates in the 0-100 viewBox, or use a real map projection)
- Replace `type` values: `"hub"` → tower sites, `"community"` → multipoint base stations, `"residential"` → CPE/subscriber endpoints
- Replace `power` with your metrics (throughput in Mbps, link capacity, subscriber count, etc.)
- Update the `connections` array to reflect your actual P2P links and multipoint sectors
- Update labels: "Hub Station" → "Tower Site", "Community Node" → "Base Station", "Residential" → "Subscriber CPE"
- Update the stats panel fields (coverage area, population served, etc.)

**Key SVG animation pattern to keep:**
```tsx
{/* Connection line with dashed stroke */}
<line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
  stroke="hsl(var(--primary))" strokeWidth="0.5"
  strokeDasharray="2 2" opacity="0.3" />

{/* Animated circle traveling along the link */}
<circle r="1" fill="hsl(var(--primary))">
  <animateMotion dur="3s" repeatCount="indefinite"
    path={`M${from.x},${from.y} L${to.x},${to.y}`} />
</circle>
```

**Lucide icons used:** `Home`, `Building2`, `Trees`
**Suggested replacements:** `Radio`, `Building2`, `Home` (or `Antenna`, `Tower`, `Wifi`)

---

### 2. Hero Section (Animated Landing)

**Source:** `apps/web/components/Hero.tsx`

Renders:
- **Animated gradient background** with 3 pulsing blurred circles (`bg-primary/20`, `bg-accent/30`, `bg-primary/10`) using `animate-pulse` with staggered `delay-700` and `delay-1000`
- **Icon trio** header — `Trees`, `Zap`, `Network` icons with pulse animation
- **Feature cards** — 3 cards with `bg-card/50 backdrop-blur border` styling
- **Stats bar** — 4 stat counters (Active Nodes, Power Shared, Data Transferred, Communities)
- **Scroll indicator** — bouncing pill at bottom of viewport

**What to change:**
- Swap icons to `Radio`/`Wifi`/`Network` (or whatever matches your tower brand)
- Replace feature card content (Wireless Power → PtP Links, P2P Protocol → Multipoint Sectors, Community Owned → Managed Services, etc.)
- Update stats to: Active Towers, Subscribers Connected, Throughput, Coverage Area

---

### 3. NetworkArchitecture (Protocol Stack Visualizer)

**Source:** `apps/web/components/NetworkArchitecture.tsx`

Renders:
- **4-layer card stack** — each layer gets an icon, title, description, and 3 stat boxes
- **Feature cards** (3-column grid) — Byzantine Fault Tolerance, E2E Encryption, Self-Healing Mesh
- **ASCII packet structure** in a `<pre>` block

**What to change:**
- Replace the 4 layers with your actual protocol stack (e.g., Layer 1: 60 GHz / 5 GHz Radio, Layer 2: Ethernet Bridge, Layer 3: IP Routing / OSPF, Layer 4: Management Plane)
- Replace feature cards with your network capabilities (Link Redundancy, Remote Management, QoS, etc.)
- Update the packet diagram to match your framing

**Lucide icons used:** `Radio`, `Wifi`, `Activity`, `Shield`, `Lock`, `Globe`

---

### 4. RoutingHero (Animated Network Background)

**Source:** `apps/web/components/routing/RoutingHero.tsx`

Renders:
- **20 randomly-positioned pulsing dots** as background decoration (CSS-only, no SVG)
- **10 SVG connection lines** with a `linearGradient` that fades in/out
- **Badge row** — color-coded protocol indicators (DHT=green, Mesh=blue, SD-WAN=purple, Onion=orange)

**What to change:**
- Replace protocol badges with your link types (PtP, PtMP, Backhaul, Last Mile)
- Adjust the color scheme to match your brand
- This is a great hero background for a "Network Status" or "Coverage Map" page

---

### 5. RoutingDashboard (Stats + Route Table)

**Source:** `apps/web/components/routing/RoutingDashboard.tsx`

Renders:
- **4 stat cards** (`StatCard` subcomponent) with colored borders — Total Routes, Active, Degraded, Failed
- **Protocol distribution grid** — 5 filterable protocol buttons with counts
- **Metrics panels** — latency gauge (gradient bar), hop count (segmented bar)
- **Action buttons** — Discover Routes, Refresh Data, Clear Filter
- **Route table** — sortable columns: Destination, Protocol, State, Latency, Bandwidth, Hops, Loss

**What to change:**
- Replace protocol types (`dht | mesh | sdwan | onion | direct`) with your link types (`ptp | ptmp | backhaul | fiber | lte`)
- Replace route states with your link states (`up | degraded | down`)
- Replace the `/api/routing` fetch calls with your actual monitoring API endpoints
- Update metrics: latency is directly reusable; replace hop count with signal strength (RSSI/SNR)

**TypeScript interfaces to keep/adapt:**
```typescript
interface Route {
  id: string;
  destination: string;
  protocol: 'ptp' | 'ptmp' | 'backhaul' | 'fiber' | 'lte';
  state: 'up' | 'degraded' | 'down';
  metrics: {
    latencyMs: number;
    bandwidthMbps: number;
    hopCount: number;
    packetLoss: number;
  };
  path: string[];
}
```

---

### 6. ProtocolExplainer (Interactive Comparison)

**Source:** `apps/web/components/routing/ProtocolExplainer.tsx`

Renders:
- **5 toggle buttons** to select a protocol — each gets a color-coded border on select
- **Detail panel** with fade-in animation (`animate-in fade-in duration-300`) — shows use cases, characteristics (low/medium/high badges), technical details, real-world basis
- **Comparison table** — all protocols side by side with colored level badges

**What to change:**
- Replace the `PROTOCOLS` array with your technologies (e.g., Cambium PTP, Ubiquiti airMAX, Mimosa, Mikrotik, etc.)
- Replace characteristics: latency/bandwidth/privacy/reliability → range/throughput/interference-resistance/scalability
- Replace `realWorldBasis` with actual deployment references

**Badge color system (reuse as-is):**
```typescript
const LEVEL_COLORS = {
  low: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-green-500/20 text-green-400',
};
```

---

## Styling Files to Copy

### globals.css
**Source:** `apps/web/app/globals.css`

Copy this file as-is. It defines the HSL-based CSS custom property color system that all components reference via `hsl(var(--primary))`, `hsl(var(--border))`, etc. Includes light and dark mode tokens.

### tailwind.config.ts
**Source:** `apps/web/tailwind.config.ts`

Copy this file as-is. It maps the CSS variables to Tailwind utility classes (`bg-primary`, `text-muted-foreground`, `border-border`, etc.) and includes:
- Container configuration (centered, `2rem` padding, `1400px` max)
- Custom border radius scale using `--radius` variable
- Accordion keyframe animations
- `tailwindcss-animate` plugin
- `darkMode: ["class"]` for manual dark mode toggle

---

## File Checklist for Your Agent

Tell your agent to:

1. **Scaffold a new Next.js 15 project** with TypeScript and App Router
   ```
   npx create-next-app@latest tower-network --typescript --tailwind --app --src-dir=false
   ```

2. **Install additional dependencies:**
   ```
   npm install lucide-react class-variance-authority clsx tailwind-merge
   npm install -D tailwindcss-animate
   ```

3. **Copy these files from ChicagoForest.net** (then customize):
   - `apps/web/app/globals.css` → `app/globals.css`
   - `apps/web/tailwind.config.ts` → `tailwind.config.ts`
   - `apps/web/components/PlasmaForestDiagram.tsx` → `components/NetworkMap.tsx`
   - `apps/web/components/Hero.tsx` → `components/Hero.tsx`
   - `apps/web/components/NetworkArchitecture.tsx` → `components/ProtocolStack.tsx`
   - `apps/web/components/routing/RoutingHero.tsx` → `components/routing/RoutingHero.tsx`
   - `apps/web/components/routing/RoutingDashboard.tsx` → `components/routing/RoutingDashboard.tsx`
   - `apps/web/components/routing/ProtocolExplainer.tsx` → `components/routing/ProtocolExplainer.tsx`

4. **Rename and rebrand** all Chicago/Plasma/Forest references to your tower company name

5. **Replace node data** in `NetworkMap.tsx` with your actual tower locations and links

6. **Replace protocol types** across RoutingDashboard and ProtocolExplainer with your actual link technologies

7. **Wire up the API** — RoutingDashboard fetches from `/api/routing`. Either create that API route with your monitoring data or convert the component to use static/mock data initially

8. **Remove workspace imports** — The original `package.json` has `@chicago-forest/p2p-core`, `@chicago-forest/routing`, and `@chicago-forest/shared-types` workspace dependencies. These are NOT used by any of the 6 components listed above, so you can safely ignore them.

---

## Animation Techniques Used (No External Libraries)

All animations are pure CSS / SVG — no JavaScript animation libraries:

| Technique | Where Used | How |
|-----------|-----------|-----|
| Pulsing nodes | PlasmaForestDiagram, Hero, RoutingHero | Tailwind `animate-pulse` class |
| Staggered pulse | Hero background circles | `animate-pulse delay-700`, `delay-1000` |
| Traveling particles | PlasmaForestDiagram link lines | SVG `<animateMotion>` on `<circle>` elements |
| Dashed links | PlasmaForestDiagram connections | SVG `strokeDasharray="2 2"` |
| Gradient fade lines | RoutingHero background | SVG `<linearGradient>` with `stopOpacity` 0→0.5→0 |
| Bounce | Hero scroll indicator | Tailwind `animate-bounce` |
| Spin | RoutingDashboard loading | Tailwind `animate-spin` with `border-t-transparent` trick |
| Fade in | ProtocolExplainer detail panel | `tailwindcss-animate` plugin: `animate-in fade-in duration-300` |
| Hover lift | NetworkArchitecture cards | `hover:shadow-lg transition-shadow` |
| Color transitions | All buttons/links | `transition-colors` with `hover:bg-*` |

---

## Quick Start Summary

```bash
# 1. Create project
npx create-next-app@latest tower-network --typescript --tailwind --app --src-dir=false

# 2. Install deps
cd tower-network
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install -D tailwindcss-animate

# 3. Copy globals.css and tailwind.config.ts from ChicagoForest.net

# 4. Copy the 6 component files listed above into components/

# 5. Add "use client" directive at top of each component (already present)

# 6. Import components in app/page.tsx:
#    import NetworkMap from "@/components/NetworkMap"
#    import Hero from "@/components/Hero"
#    etc.

# 7. Rebrand and replace data

# 8. Run dev server
npm run dev
```

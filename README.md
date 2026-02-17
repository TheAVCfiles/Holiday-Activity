# Presidents Day Fortress Dashboard v2.2

A React-based institutional confidence filter dashboard for ETH/LI regime analysis with block bootstrap CI and TRI* simulation.

## 🚀 Features

### Core Functionality
- **Live Bootstrap State Engine**: Real-time p-value, structural weight, and confidence interval tracking
- **Regime Status Monitoring**: Visual indicators for OPEN/CLOSED_DEFENSIVE states
- **Interactive Controls**: Adjustable parameters for permutation p-value and structural weight
- **TRI* Simulation**: Dynamic updates every 5 seconds with ≥2.5σ threshold
- **Asset Day Sheet**: Institutional-grade trading levels for LIT, ETH, and QQQ
- **JSON Payload Export**: Real-time regime data in structured format

## 🛠️ Technology Stack

- **React 19.2.4** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool and dev server
- **Tailwind CSS 4.1.18** - Styling framework
- **Lucide React** - Icon library

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Development

The dashboard runs on `http://localhost:5173/` by default.

```bash
npm run dev
```

## 📊 Key Metrics

### Regime Logic
- **OPEN**: Structural confirmed (W≥80) + CI excludes 0 + p-value < 0.05
- **CLOSED_DEFENSIVE**: Any condition fails

### Action Rules
- **AGGRESSIVE**: TRI* scaling active when regime OPEN
- **NEUTRAL**: No TRI* scaling when regime CLOSED

## 🎨 UI Features

- **Dark Theme**: Slate gradient background with emerald/rose accents
- **Responsive Design**: Grid layout adapts to screen sizes
- **Interactive Elements**: Real-time slider and input controls
- **Color-Coded Logs**: Visual hierarchy for different log types
- **Dynamic Status**: Live updates based on filter parameters

## 🔒 Security & Integrity

- Atomic writes to regime.json
- Hashed delivery for secure transmission
- 100% organism integrity validation
- Unbreakable system architecture

## 📄 License

ISC

---

**Decrypt the Future™** — DASHBOARD SEALED. EXECUTE.

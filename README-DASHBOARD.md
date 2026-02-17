# Presidents Day Fortress Dashboard v2.2

## 🏰 Institutional Confidence Filter Dashboard

An interactive React dashboard for visualizing ETH/LI regime analysis with Bootstrap CI and TRI* simulation.

![Dashboard Screenshot](https://github.com/user-attachments/assets/7a538c2d-b09e-467c-bfda-0f200bae7011)

## Features

- **Live Bootstrap State**: Real-time display of bootstrap p-values, structural weights, and confidence intervals
- **Interactive Controls**: Adjustable P-value slider and structural weight input
- **Regime Status**: Visual indication of OPEN/CLOSED_DEFENSIVE regime states
- **Institutional Day Sheet**: Asset pivot points, support/resistance levels, and ATR bands
- **TRI* Simulation**: Automatic updates every 5 seconds for dynamic analysis
- **JSON Payload Preview**: Live regime overlay data export

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library

## Dashboard Components

### Filter Controls
- **Permutation P-Value (Min)**: Adjustable slider (0-0.1) with 0.05 gate threshold
- **Structural Weight (W)**: Numeric input with ≥80 target threshold

### Engine Logs
Real-time bootstrap engine status logs showing:
- Block bootstrap initialization
- Resampling completion
- τ* lag detection
- Confidence interval calculation
- P-value validation

### Institutional Day Sheet
Asset analysis table with:
- Pivot points
- S1/S2 support levels
- R1/R2 resistance levels
- ATR bands
- Dynamic action recommendations based on regime status

### Regime Overlay JSON
Live JSON export showing:
- Timestamp
- Regime status
- Structural confirmation
- CI validation
- P-value
- Weight
- Action rules

## License

MIT

## Credits

Built for institutional confidence filtering and algorithmic trading analysis.

**Decrypt the Future™** — Dashboard SEALED. EXECUTE.

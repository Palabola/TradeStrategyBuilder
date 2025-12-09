# TradeStrategyBuilder

A monorepo containing a visual drag-and-drop trading strategy builder component for React/Next.js applications.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/@palabola86/trade-strategy-builder)

## 📦 Packages

This repository contains two packages:

| Package | Description | Path |
|---------|-------------|------|
| **[@palabola86/trade-strategy-builder](https://www.npmjs.com/package/@palabola86/trade-strategy-builder)** | The NPM package - visual strategy builder component | [`/strategy`](./strategy) |
| **Demo App** | Next.js demo application showcasing the component | [`/demo`](./demo) |

## 🚀 Quick Start

### Using the NPM Package

Install the package in your project:

```bash
npm install @palabola86/trade-strategy-builder
```

Add to your `globals.css`:

```css
@import "tailwindcss";
@source "../node_modules/@palabola86/trade-strategy-builder/dist";
```

Use the component:

```tsx
"use client"

import { StrategyBuilder } from "@palabola86/trade-strategy-builder"

export default function StrategyPage() {
  return (
    <StrategyBuilder 
      onSave={(strategy) => console.log("Strategy saved:", strategy)} 
    />
  )
}
```

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Palabola/TradeStrategyBuilder.git
   cd TradeStrategyBuilder
   ```

2. **Install dependencies and run the demo**
   ```bash
   cd demo
   npm install
   npm run dev
   ```

3. **Develop the strategy package**
   ```bash
   cd strategy
   npm install
   npm run dev  # Watch mode
   ```

## 📁 Project Structure

```
TradeStrategyBuilder/
├── demo/                    # Demo Next.js application
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Demo-specific components
│   └── package.json
│
├── strategy/                # NPM package source
│   ├── src/
│   │   ├── components/      # Strategy builder components
│   │   ├── types/           # TypeScript type definitions
│   │   └── index.ts         # Package exports
│   ├── package.json
│   ├── README.md            # Package documentation
│   ├── STRATEGY_BUILDER_QUICK_REFERENCE.md
│   ├── STRATEGY_BUILDER_SETUP.md
│   └── STRATEGY_BUILDER_SUMMARY.md
│
├── LICENSE                  # MIT License
└── README.md               # This file
```

## ✨ Features

- 🎯 **Drag-and-Drop Interface** - Intuitive block-based strategy building
- 📊 **Condition Blocks** - Price movements, indicator comparisons, crossovers
- ⚡ **Action Blocks** - Open/close positions, buy/sell, notifications
- 🎨 **Customizable Themes** - Override colors and styles
- 🤖 **AI Builder Support** - Integrate with AI models to generate strategies
- 📱 **Responsive Design** - Works on desktop and mobile

## 📖 Documentation

- [Package README](./strategy/README.md) - Full usage documentation
- [Quick Reference](./strategy/STRATEGY_BUILDER_QUICK_REFERENCE.md) - API quick lookup
- [Setup Guide](./strategy/STRATEGY_BUILDER_SETUP.md) - Integration guide
- [Summary](./strategy/STRATEGY_BUILDER_SUMMARY.md) - Architecture overview

## 🛠️ Development

### Building the Package

```bash
cd strategy
npm run build
```

### Publishing to NPM

```bash
cd strategy
npm version patch  # or minor/major
npm publish --access public
```

### Running the Demo

```bash
cd demo
npm run dev
```

## 🔧 Tech Stack

- **React 19** - UI framework
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@dnd-kit** - Drag and drop
- **Radix UI** - UI primitives
- **tsup** - Package bundling

## 📄 License

MIT © [Palabola](https://github.com/Palabola)

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@palabola86/trade-strategy-builder)
- [GitHub Repository](https://github.com/Palabola/TradeStrategyBuilder)
- [Report Issues](https://github.com/Palabola/TradeStrategyBuilder/issues)

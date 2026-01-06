# Snipt - Screenshot & Annotation Tool

Snipt er en moderne screenshot- og annotationsværktøj for Windows, kombineret med en cloud-baseret galleritjeneste.

## 📁 Projektstruktur

```
snipt/
├── app_Electron/        # Electron desktop app
│   ├── src/             # React komponenter
│   ├── electron/        # Electron main process
│   ├── scripts/         # Build scripts
│   └── package.json
├── docs/                # Landing page (GitHub Pages)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── downloads/       # App installers
├── supabase/            # Backend functions
└── dashboard/           # Admin dashboard (kommende)
```

## 🚀 Getting Started

### App (Electron)

```bash
cd app_Electron
npm install
npm run dev              # Development
npm run build:win        # Build Windows installer
```

### Landing Page

Landing page hostes via GitHub Pages fra `docs/` mappen.

## 📦 Build & Release

Når du builder appen med `npm run build:win`:
1. Vite bygger React-koden
2. Electron-builder laver Windows installer
3. Post-build script komprimerer installer til ZIP
4. ZIP kopieres til `docs/downloads/`

```bash
cd app_Electron
npm run build:win
```

Push derefter til `main` branch for at opdatere landingpage.

## 🔧 Stack

- **App**: Electron + React + Tailwind
- **Backend**: Supabase
- **Frontend**: HTML/CSS/JS
- **Hosting**: GitHub Pages + GitHub Releases

## 📝 License

MIT

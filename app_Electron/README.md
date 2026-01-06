# Snipt - Professional Screenshot Desktop App

En professionel screenshot desktop applikation til Windows, macOS og Linux.

## ✨ Features

- 🖥️ **Desktop app** - Native applikation til alle platforme
- 📸 **Skærmbilledeoptagelse** - Tag hele skærmen eller specifikke vinduer
- ✏️ **Annotationsværktøjer** - Pile, bokse, fremhævninger og tekst
- ⌨️ **Globale tastaturgenveje** - `Ctrl+Shift+S` og `Ctrl+Shift+A`
- 📋 **Hurtige handlinger** - Kopier, gem eller upload
- 💾 **System tray integration** - Kører i baggrunden
- 🎨 **8 farvevalg** til annotationer

## 🚀 Installation

```bash
npm install
```

## 🎯 Kør App'en

### Udviklings-mode:
```bash
npm run dev
```

### Byg Installer:

**Windows:**
```bash
npm run build:win
```

**macOS:**
```bash
npm run build:mac
```

**Linux:**
```bash
npm run build:linux
```

Installerbare filer findes i `release/` mappen.

## ⌨️ Tastaturgenveje

- `Ctrl+Shift+S` - Åbn skærmbilledeoptagelse med annotation
- `Ctrl+Shift+A` - Hurtig kopiering til udklipsholder

## 🎨 Annotationsværktøjer

- **Pil** - Tegn retningsbestemte pile
- **Boks** - Opret rektangulære rammer
- **Fremhævning** - Semi-transparente farvede områder
- **Tekst** - Tilføj tekstetiketter

## 📁 Projektstruktur

```
app/
├── electron/          # Electron main og preload
├── src/
│   ├── components/    # React komponenter
│   ├── config/        # Firebase og Supabase config
│   ├── utils/         # Hjælpefunktioner
│   ├── App.jsx        # Hovedvindue
│   └── CaptureApp.jsx # Optagelsesvindue
├── package.json
└── vite.config.js
```

## 🛠️ Tech Stack

- Electron 28
- React 18
- Vite
- Tailwind CSS
- Supabase (cloud upload)
- Firebase (fremtidig auth)

## 📄 Licens

MIT

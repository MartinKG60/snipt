# GitHub Actions Build Guide

## Automatisk bygning til Windows, macOS og Linux

Projektet er nu sat op til automatisk at bygge til alle tre platforme via GitHub Actions.

## Hvordan det virker

### 1. Automatisk ved release (anbefalet)
Når du opretter et version tag, bygges og udgives alt automatisk:

```bash
git tag v1.0.1
git push origin v1.0.1
```

Dette vil:
- Bygge til Windows, macOS og Linux
- Oprette en GitHub Release
- Uploade alle installer-filer automatisk

### 2. Manuel trigger
Du kan også manuelt trigge en build:
1. Gå til dit repository på GitHub
2. Klik på "Actions" tab
3. Vælg "Build and Release" workflow
4. Klik "Run workflow"

## Output

Efter bygningen kan du:
- **Downloade artifacts** fra Actions-siden (midlertidig lagring)
- **Finde releases** under Releases-siden (permanent, hvis tagget)

### Filer der genereres:
- **Windows**: `Snipt Setup 1.0.0.exe`, portable version, og zip
- **macOS**: `Snipt-1.0.0.dmg` og zip
- **Linux**: `Snipt-1.0.0.AppImage`, `.deb` pakke, og zip

## Code Signing

Pt. er code signing deaktiveret (`CSC_IDENTITY_AUTO_DISCOVERY: false`).

For at aktivere:
1. Tilføj code signing certificates som GitHub Secrets
2. Fjern `CSC_IDENTITY_AUTO_DISCOVERY: false` fra workflow

## Næste skridt

1. Commit og push `.github/workflows/build.yml`
2. Opret et version tag for at teste
3. Tjek Actions-siden for build status

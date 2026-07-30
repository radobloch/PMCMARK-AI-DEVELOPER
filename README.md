# 🚀 PMCMARK AI Developer

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![GitHub Actions CI](https://img.shields.io/badge/GitHub_Actions-Passing-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Powered by Gemini](https://img.shields.io/badge/Google_AI_Studio-Gemini_3.6-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

> **PMCMARK AI Developer** to nowoczesne środowisko programistyczne wspierane sztuczną inteligencją **Google AI Studio (Gemini 3.6 Flash)** oraz integracją z **GitHub REST API**. Aplikacja umożliwia natychmiastowe generowanie kodu, automatyczny audyt bezpieczeństwa, generowanie pełnej dokumentacji `README.md`, podgląd aplikacji na żywo oraz automatyczny deployment na platformę **Vercel** przy użyciu **GitHub Actions**.

---

## 📋 Spis Treści

- [✨ Funkcjonalności](#-funkcjonalności)
- [🛠️ Technologie](#️-technologie)
- [📦 Instalacja](#-instalacja)
- [🚀 Użycie](#-użycie)
- [⚙️ Konfiguracja Zmiennych Środowiskowych](#️-konfiguracja-zmiennych-środowiskowych)
- [🌐 Deployment na Vercel i GitHub Actions](#-deployment-na-vercel-i-github-actions)
- [🧪 Testowanie](#-testowanie)
- [🖼️ Przykłady Widoków](#️-przykłady-widoków)
- [🤝 Wkład (Contributing)](#-wkład-contributing)
- [📄 Licencja](#-licencja)

---

## ✨ Funkcjonalności

- 🧠 **AI Code Generator & Architect**: Generowanie czystego, bezbłędnego kodu w TypeScript/JavaScript, React i HTML/CSS na podstawie naturalnych promptów programisty.
- 🛡️ **Automatyczny Audyt i Analiza Kodu**: Weryfikacja pod kątem błędów składniowych, wydajności oraz podatności bezpieczeństwa (OWASP).
- 📚 **Interactive README.md Generator (`/docs`)**: Formularz AI generujący kompletną, gotową do publikacji dokumentację w dowolnym języku (Polski, Angielski, Niemiecki, Hiszpański, Francuski).
- 🐙 **Pełna Integracja z GitHub API**:
  - Przeglądanie repozytoriów użytkownika i zawartości plików.
  - Automatyczne tworzenie Issue oraz komentarzy do Pull Requestów.
- 💻 **Wbudowany Edytor i Podgląd Na Żywo (Live Preview)**: Interaktywne testowanie komponentów w wyizolowanym piaskownicy (sandbox).
- ⚡ **Gotowy Zestaw CI/CD & Vercel**: Dołączone szablony `vercel.json`, `.github/workflows/deploy.yml` oraz `.github/workflows/test.yml`.

---

## 🛠️ Technologie

| Kategoria | Technologie / Biblioteki |
| :--- | :--- |
| **Framework & UI** | React 19, Vite / Next.js, Tailwind CSS v4, Lucide React, Motion |
| **Sztuczna Inteligencja** | Google AI Studio SDK (`@google/genai` Gemini 3.6 Flash) |
| **Integracje API** | GitHub REST API (`@octokit/rest`), Express serverless proxy |
| **Testowanie & Jakość** | Jest, React Testing Library, MSW (Mock Service Worker), TypeScript, ESLint |
| **DevOps & CI/CD** | Vercel Serverless Functions, GitHub Actions Workflows |

---

## 📦 Instalacja

Wymagania wstępne: **Node.js >= 20.0.0** oraz **npm >= 10.0.0**.

1. **Klonowanie repozytorium**:
   ```bash
   git clone https://github.com/your-username/pmcmark-ai-developer.git
   cd pmcmark-ai-developer
   ```

2. **Instalacja zależności**:
   ```bash
   npm ci
   ```

3. **Konfiguracja pliku środowiskowego**:
   Skopiuj wzorzec `.env.example` do pliku `.env`:
   ```bash
   cp .env.example .env
   ```

---

## ⚙️ Konfiguracja Zmiennych Środowiskowych

Wypełnij wartości w pliku `.env`:

```env
# Google AI Studio API Key (Wymagany do funkcji Gemini 3.6 Flash)
GOOGLE_AI_STUDIO_API_KEY="your-google-ai-studio-api-key"

# GitHub Personal Access Token (Wymagany do operacji na repozytoriach i issue)
GITHUB_TOKEN="ghp_your_personal_access_token_here"

# Konfiguracja Portu Serwera Lokalnego
PORT=3000
NODE_ENV="development"
```

> **Wskazówka:** Klucz API do Google AI Studio możesz wygenerować bezpłatnie na stronie [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 Użycie

### Uruchomienie Serwera Deweloperskiego
```bash
npm run dev
```
Aplikacja zostanie uruchomiona pod adresem: `http://localhost:3000`.

### Budowanie Wersji Produkcyjnej
```bash
npm run build
```

### Uruchomienie Podglądu Produkcyjnego
```bash
npm run start
```

---

## 🧪 Testowanie

Projekt posiada zestaw testów jednostkowych napisanych przy użyciu **Jest** oraz **React Testing Library**:

```bash
# Uruchomienie sprawdzania typów TypeScript i skryptów testowych
npm run test

# Uruchomienie lintera ESLint
npm run lint
```

---

## 🌐 Deployment na Vercel i GitHub Actions

### Krok 1: Połączenie Repozytorium GitHub z Vercel

1. Zaloguj się na platformie [Vercel](https://vercel.com/).
2. Kliknij **Add New...** -> **Project** i zaimportuj repozytorium `pmcmark-ai-developer`.
3. W sekcji **Environment Variables** dodaj:
   - `GOOGLE_AI_STUDIO_API_KEY`
   - `GITHUB_TOKEN`
4. Kliknij **Deploy**.

### Krok 2: Konfiguracja Sekretów w GitHub Actions (Automatyczny Deploy)

Aby włączyć automatyczny deployment przy każdym pushu do gałęzi `main`:

1. Przejdź do repozytorium na GitHubie: **Settings** -> **Secrets and variables** -> **Actions**.
2. Dodaj następujące **Repository Secrets**:
   - `VERCEL_TOKEN`: Twój token dostępowy Vercel (wygenerowany w *Account Settings* -> *Tokens*).
   - `VERCEL_ORG_ID`: ID Twojej organizacji/konta w Vercel.
   - `VERCEL_PROJECT_ID`: ID projektu w Vercel (znajdziesz w *Project Settings* -> *General*).
3. Przepchnij zmiany do gałęzi `main` – workflow `.github/workflows/deploy.yml` uruchomi testy i wykona deployment.

---

## 🖼️ Przykłady Widoków

- **`/docs` - Generator Dokumentacji README.md**:
  Formularz pobierający dane projektu, generujący uporządkowaną strukturę sekcji z opcją kopiowania i natychmiastowego pobierania pliku `.md`.
- **`/analyze` - Audytor Kodu AI**:
  Analizator kodu źródłowego wskazujący błędy, ostrzeżenia oraz sugestie optymalizacyjne.
- **GitHub Showcase**:
  Integracja z repozytoriami, wgląd w otwarte Issue i możliwość automatycznego komentowania.

---

## 🤝 Wkład (Contributing)

Chcesz pomóc w rozwoju PMCMARK AI Developer? Każdy wkład jest mile widziany!

1. Sklonuj repozytorium (`fork`).
2. Stwórz swoją gałąź dla funkcji (`git checkout -b feature/amazing-feature`).
3. Zapisz zmiany (`git commit -m 'Add amazing feature'`).
4. Wyślij gałąź (`git push origin feature/amazing-feature`).
5. Otwórz **Pull Request**.

Prosimy o przestrzeganie standardów jakości kodu oraz uruchomienie `npm run test` i `npm run lint` przed zgłoszeniem Pull Requesta.

---

## 📄 Licencja

Projekt jest udostępniany na licencji **MIT**. Zobacz plik [LICENSE](LICENSE), aby uzyskać więcej informacji.

---

<p center align="center">
  Stworzone z ❤️ przy użyciu <strong>Google AI Studio</strong> & <strong>Vercel</strong>.
</p>

# Implementation Plan: Strength Stats (2026 Vision)

We're building a fitness tracking app that replaces legacy apps with a futuristic, performant, and intelligence-driven experience.

## Tech Stack
- **Framework**: React Native with Expo SDK 54 (Managed Workflow)
- **Navigation**: Expo Router (File-based)
- **Backend**: Supabase (Auth, DB, Real-time)
- **Styling**: NativeWind v4 (Tailwind for React Native)
- **Animations**: React Native Reanimated
- **Graphics Engine**: React Native Skia (for Liquid Glass effects & Shaders)
- **Icons**: Lucide React Native

## 🏋️‍♂️ Gestion des Séances (Finalisation)
### [MODIFY] [workout.tsx](file:///Volumes/DD/strenght-stats/app/(tabs)/workout.tsx)
- **Loader Histoire**: Afficher un `ActivityIndicator` pendant `fetchHistory`.
- **Détails Séance**: Implémenter la modal "Voir" qui affiche le récap complet (exos, charges) d'une séance passée.
- **Fiabilité Sauvegarde**: 
    - Vérifier l'existence du profil utilisateur avant l'insertion.
    - Ajouter des toasts/alertes plus précis en cas d'erreur de base de données.

## 📊 Dashboard Data Sync
### [MODIFY] [index.tsx](file:///Volumes/DD/strenght-stats/app/(tabs)/index.tsx)
- **Statistiques Réelles**: 
    - Remplacer les données "en dur" par des requêtes Supabase.
    - Calculer le tonnage hebdomadaire (somme des `weight * reps`).
    - Calculer le taux de complétion (séances terminées vs objectif).
- **Réseau de Graphes**: Préparer le terrain pour des graphiques de progression de force.

## ⚙️ CI/CD & Git
- [x] Push initial sur GitHub.
- [ ] Branche `feat/dashboard-sync` pour les travaux en cours.

## User Review Required
> [!IMPORTANT]
> - **Liquid Glass Integration**: I will use `react-native-skia` to achieve the "Liquid Glass" look (refraction, mesh gradients, dynamic translucency). This is the 2026 standard.
> - **AI Strategy**: We will implement a `MockAIService` foundation. This allows for logic-based suggestions (progression, recovery) today, without requiring a paid API key, while being perfectly "pluggable" for a real LLM later.
> - Do you prefer a specific color palette? I'm thinking "Dark Mode" by default: Deep Onyx (`#0A0A0A`), Neon Violet/Blue accents, and Glassmorphism effects.
> - Should we include "Vision API" (camera form analysis) in the roadmap, or focus on "AI Progression" (weight suggesting) first?

## Proposed Changes

### [Initialization]
- [NEW] Initialize Expo project with TypeScript.
- [NEW] Install NativeWind v4 and PostCSS configuration.
- [NEW] Install Supabase client.
- [NEW] Set up Project Structure (`app/`, `components/`, `lib/`, `hooks/`, `theme/`).

### [Architecture & Design System]
#### [NEW] `theme/tokens.ts`
- Centralized color, spacing, and radius tokens for a premium feel.
#### [NEW] [lib/supabase.ts](file:///Users/adriengrampone/Documents/freelance/perso/strength-stats/lib/supabase.ts)
- Singleton instance for Supabase connectivity.

### [Core Features]
#### [NEW] `app/(auth)/login.tsx`
- Minimalist, premium login screen.
#### [MODIFY] [app/(tabs)/index.tsx](file:///Users/adriengrampone/Documents/freelance/perso/strength-stats/app/%28tabs%29/index.tsx)
- Dashboard UI (Hero Screen) Refinement: V4 UX updates.
  - Interactive Weekly Calendar header.
  - Horizontal scroll for secondary actions to save vertical space.
  - Sticky Floating Action Button (FAB) for "Commencer séance".
  - Make the AI Insight card actionable (one-tap start).
#### [NEW] [hooks/useAIProgress.ts](file:///Users/adriengrampone/Documents/freelance/perso/strength-stats/hooks/useAIProgress.ts)
- Logic to analyze past sessions and suggest "The Next Level".

## Verification Plan
### Manual Verification
- Verify layout responsiveness on iOS/Android emulators.
- Test Supabase Auth flow.
- Demonstrate "Viral Ready" animation for finishing a workout.

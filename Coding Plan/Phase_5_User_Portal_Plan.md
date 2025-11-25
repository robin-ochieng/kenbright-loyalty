# Phase 5: User Portal Development Plan

## Overview
**Goal:** Build a mobile-first, responsive web application for Kenbright customers to manage their loyalty points, view insurance products, and redeem rewards.
**Target Audience:** End-users (Policyholders).
**Key Requirement:** Progressive Web App (PWA) capabilities for an app-like experience.

## 1. Technical Stack & Setup
*   **Framework:** React 18 + Vite
*   **Language:** TypeScript
*   **UI Library:** Material UI (MUI) v5
*   **State Management:** React Context + Hooks
*   **Routing:** React Router DOM v6
*   **Backend Integration:** Supabase JS Client
*   **PWA:** Vite PWA Plugin / Workbox

## 2. Directory Structure
The structure will mirror `frontend-admin` for consistency but optimized for mobile views.
```
frontend-user/
├── public/
│   ├── manifest.json       # PWA Manifest
│   └── sw.js              # Service Worker
├── src/
│   ├── components/
│   │   ├── Layout/        # Main Layout (Header, Bottom Nav)
│   │   ├── Auth/          # Login/Register forms
│   │   ├── Dashboard/     # Widgets (Points, Tier)
│   │   └── Common/        # Reusable UI components
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── MyProducts.tsx
│   │   ├── Rewards.tsx
│   │   └── History.tsx
│   ├── services/
│   │   ├── supabaseClient.ts
│   │   ├── authService.ts
│   │   ├── memberService.ts
│   │   └── rewardService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── App.tsx
│   └── main.tsx
```

## 3. Implementation Steps

### Step 1: Project Scaffolding & Configuration
*   [ ] Initialize project files (`vite.config.ts`, `tsconfig.json`, `index.html`).
*   [ ] Install dependencies (`@mui/material`, `@mui/icons-material`, `react-router-dom`, `@supabase/supabase-js`).
*   [ ] Configure PWA settings (Manifest, Icons).

### Step 2: Authentication & Security
*   [ ] Set up `supabaseClient.ts`.
*   [ ] Create `AuthContext` to manage user session.
*   [ ] Implement `Login` page with Email/Password & Social Auth placeholders.
*   [ ] Implement `Register` page with basic KYC fields (Name, Phone, National ID).
*   [ ] Create `ProtectedRoute` component.

### Step 3: Core Layout & Navigation
*   [ ] Create `MainLayout` with:
    *   Top App Bar (Logo, Profile Icon).
    *   Bottom Navigation Bar (Dashboard, Rewards, Products, Profile) - *Mobile First*.
*   [ ] Set up Routing in `App.tsx`.

### Step 4: Dashboard (Home)
*   [ ] **Points Widget**: Display current balance and Tier (Bronze/Silver/Gold).
*   [ ] **Quick Actions**: "Redeem", "Refer a Friend", "Update Profile".
*   [ ] **Recent Activity**: Mini-list of last 3 transactions.

### Step 5: Feature Modules
*   **Profile & KYC**:
    *   [ ] View/Edit Personal Info.
    *   [ ] View KYC Status (Active/Pending).
    *   [ ] Add Dependents & Assets (Cross-sell data).
*   **My Products**:
    *   [ ] List active insurance policies (fetched from `member_products`).
    *   [ ] Display policy status and renewal dates.
*   **Rewards Store**:
    *   [ ] Grid view of `rewards_catalog`.
    *   [ ] Redemption flow (Modal confirmation -> Deduct points -> Create redemption record).
*   **Transaction History**:
    *   [ ] Full list of points earned and redeemed.

### Step 6: PWA & Polish
*   [ ] Configure Service Worker for offline caching (basic assets).
*   [ ] Add "Add to Home Screen" prompt logic.
*   [ ] Ensure responsive design on all pages.

## 4. Data Integration Points
*   **Auth**: `auth.users` (Supabase Auth).
*   **Member Data**: `public.members` (Linked by `user_id`).
*   **Products**: `public.member_products` JOIN `public.products`.
*   **Rewards**: `public.rewards_catalog`.
*   **Redemptions**: Insert into `public.points_redemptions`.

## 5. Execution Order
1.  **Scaffold**: Get the app running.
2.  **Auth**: Allow users to sign in/up.
3.  **Layout**: Establish the mobile app feel.
4.  **Dashboard**: Show the core value (Points).
5.  **Rewards**: Enable the "Burn" mechanism.
6.  **Products/Profile**: Enable the "Earn" & Data collection mechanism.

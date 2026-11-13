# AgriSage AI — Architecture & System Design

## 1. System Overview

**AgriSage AI** is a production-grade Agricultural Technology platform designed to provide evidence-conscious digital decision support to farmers, agronomy consultants, and farm managers.

The system combines:
1. **Interactive Client**: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, TanStack Query, and Sonner notifications.
2. **Secure API Backend**: Node.js, Express, TypeScript strict mode, Zod validation, helmet, cors, and rate-limiting.
3. **AI Agricultural Engine**: Google Gemini via official `@google/genai` SDK with strict JSON Schema constraints, fallback handling, retry logic, and zero client credential leakage.
4. **Data Isolation & Auth**: Supabase PostgreSQL with cryptographic Row Level Security (RLS) policies and session management.

---

## 2. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT TIER                                       |
|  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack Query      |
|                                                                                   |
|  - Farmer Profile & Multi-Farm Management                                         |
|  - AI Crop Recommendations (Soil pH, NPK, Rainfall, Climate, Objectives)         |
|  - Comprehensive Crop Library (Cereals, Pulses, Oilseeds, Fruits, Vegetables)     |
|  - Multimodal Plant Disease Clinic (JPEG/PNG/WebP Image Inspection)               |
|  - Irrigation & Nutrient Management Calculators                                  |
|  - Farming Activity Calendar & Historical Advisory Archive                       |
+-----------------------------------------------------------------------------------+
                                        |
                            HTTP / REST (Bearer JWT)
                                        |
+-----------------------------------------------------------------------------------+
|                                 SERVER TIER                                       |
|                  Node.js + Express + TypeScript (Strict)                          |
|                                                                                   |
|  Middlewares:                                                                     |
|    - Rate Limiter (Standard & Stricter AI Rate Limiting)                          |
|    - Supabase JWT Authenticator & Ownership Verifier                              |
|    - Zod Request Schema Validators                                                |
|    - Multer Memory Buffer & Sharp Image Sanitization Engine                       |
|    - Centralized Error Handler                                                    |
|                                                                                   |
|  AI Advisory Services:                                                            |
|    - GeminiAgriculturalService (@google/genai)                                    |
|    - Strict Agricultural System Prompt (20 Core Principles)                       |
|    - Structured JSON Schema Outputs with Zod Parsing                              |
+-----------------------------------------------------------------------------------+
                   |                                             |
            PostgreSQL Queries                             GenAI API Calls
                   |                                             |
+-----------------------------------------+   +-------------------------------------+
|             DATABASE TIER               |   |            EXTERNAL AI              |
|        Supabase PostgreSQL + RLS        |   |       Google Gemini 2.5 Flash       |
|                                         |   |          (@google/genai)            |
|  - profiles (CASCADE on user deletion)  |   +-------------------------------------+
|  - farms (Multi-farm with RLS)          |
|  - crops (Catalog of Indian crops)      |
|  - crop_recommendations (Historical)    |
|  - advisories (Step-by-step guidance)   |
|  - disease_reports (Multimodal findings)|
|  - farming_activities (Calendar tasks)  |
+-----------------------------------------+
```

---

## 3. Security Architecture & Threat Mitigation

- **Zero-Trust Ownership Checks**: Every incoming farm ID, advisory ID, activity ID, and disease report ID undergoes explicit owner ID matching against `req.user.id` derived directly from verified JWT tokens.
- **Server-Side AI Credential Isolation**: The Gemini API key never reaches client bundles. All prompt construction and multimodal image transfers execute exclusively on the server.
- **Image Processing Security**: Uploaded photos are inspected with `sharp(buffer).metadata()` to verify valid image headers, discarding executables, SVG injection scripts, and malformed buffers before processing.
- **Row-Level Security (RLS)**: PostgreSQL tables feature isolated policies ensuring authenticated users can only query and mutate records linked to `auth.uid()`.

# Energy Project Design Services — PRD

## Original Problem Statement
Web platform for Romanian natural-gas engineering companies — manage technical documentation: branches, pipe extensions, utilization installations, permits, verifications, communication with OSD / Designer / Contractor / VGD / RTE / Client.

## User Choices (Latest Iteration — V4.5)
- UI: Romanian
- Email: Gmail SMTP, per-user creds (each user enters their own Gmail + App Password)
- Payments: Stripe with EUR
- Real company: **ENERGY PROJECT DESIGN SRL · CUI 43151074 · J40/12982/2020 · Str. Lt. Alexandru Popescu nr. 9B, Sectorul 3, București**
- Digital signature: PKCS#12 PKI (CMS .p7s) + QES scaffold ready for certSIGN/DigiSign/Trans Sped activation
- Auth: JWT email/password + Emergent Google OAuth (GDPR consent captured at register)

## Architecture
- Backend: FastAPI + MongoDB (motor), modules split: `plans.py` (10 plans), `calc_engine.py` (smart calculations), `ai_assistant.py` (intent parser), `qes_provider.py`, `signing.py`, `docx_processor.py`, `email_sender.py`, `auth.py`, `db.py`
- Frontend: React 19 + Tailwind + Swiss/brutalist design (IBM Plex Sans, amber #FFB300 accent)
- Navigation grouped: Operațional / Documentație / Comunicare & Control / Cont

## Implemented (2026-02 V4.5)
- ✅ 10 plans (EUR): Basic 99, Proiectant 149, Executant 149, Avize 129, Ofertare 119, Contabilitate 119, VGD 199, RTE 199, Societate 399, Developer (intern lifetime)
- ✅ Date proiect (14 required fields + observații, completion score, placeholder export)
- ✅ Date tehnice (11 fields + override per result)
- ✅ Calcul inteligent — 6 smart boxes: debit_calculat, debit_recomandat, putere_instalata_kw, risc_presiune, estimare_cost, contor_orientativ — each with formula, surse, status, override
- ✅ Verifică documentație — scoring engine with 8 checks, summary OK/Warning/Missing, copy + JSON export
- ✅ AI Assistant — rule-based intent parser (~13 intents), preview before navigation, history
- ✅ Audit interfață — 13+ pages cataloged with required handlers and plan-access flags
- ✅ Email composer with 7 templates, role-based recipients, placeholder replacement, mailto, attach generated docs
- ✅ Certificări interne — hash SHA-256 + timestamp + role + signer + document title, history list
- ✅ Templates / Documents / Stamps / Certificates PKI (existing, fully functional)
- ✅ Legal pages with real Energy Project Design data (Termeni, Confidențialitate, GDPR)
- ✅ GDPR consent required at registration; GDPR export + account delete endpoints
- ✅ Per-user Gmail config in Settings + QES provider scaffold

## Testing
- 47/47 backend pytest pass (27 regression + 20 v4.5)

## Backlog
- P1: PDF export alongside DOCX
- P1: Multi-project support (currently one default project per user)
- P1: Public verification page (`/verify/{doc_id}`) for third parties
- P2: Real QES provider implementation (certSIGN/DigiSign/Trans Sped)
- P2: Team workspaces with role inheritance
- P2: Mobile app
- P2: AI Developer self-update controlled patch system

## Next Action Items
- Real Stripe live key (currently `sk_test_emergent`)
- Real QES contract activation
- Optional: add team/multi-user workspaces

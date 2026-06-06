# 🛟 HANDOFF — Energy Project Design Services
**Snapshot generated:** 2026-06-06 00:49 UTC
**Source repo:** https://github.com/dragosserban95/Energy-Project-Design (branch `main`)
**Preview (current Emergent session):** https://template-stamp-hub.preview.emergentagent.com
**Production target:** https://energy-project-design-services.onrender.com

---

## 📌 Pentru noul utilizator Emergent — cum continui de aici

Pasul 1. Creează un task nou în Emergent (cont gratuit OK).
Pasul 2. În prompt, lipește acest mesaj:

> Importă codul din `https://github.com/dragosserban95/Energy-Project-Design` (branch `main`). Apoi citește `/app/memory/PRD.md` și `HANDOFF_FOR_NEXT_EMERGENT.md` din rădăcina repo-ului ca să înțelegi unde am rămas. Limba aplicației: română. Contul developer: `dragosserban95@gmail.com` / parola `Test12345` (auto-detectat ca developer). Continuă de la secțiunea "Next actions" din handoff.

Pasul 3. Configurează secretele în `backend/.env` (lista mai jos). Sunt deja documentate în `backend/.env.example`.
Pasul 4. Repornește serviciile: `sudo supervisorctl restart backend frontend`.

---

## 🧠 Project vision (PRD.md — full copy)

# Energy Project Design Services — PRD

## Original Problem Statement
B2B SaaS for Romanian engineering documentation, starting with **gas naturale** (branșamente, extinderi, instalații utilizare). Architecture supports multi-industry extension (electrical, water/sewage, civil, telecom).

## User Choices
- UI: Romanian
- Email: Gmail SMTP, per-user creds
- Payments: Stripe with EUR (currently `sk_test_emergent`, ready for `sk_live_...`)
- Real company: **ENERGY PROJECT DESIGN SRL · CUI 43151074 · J40/12982/2020 · Str. Lt. Alexandru Popescu nr. 9B, Sectorul 3, București**
- Digital signature: local PKCS#12 + QES scaffold (certSIGN/DigiSign/Trans Sped)
- Auth: JWT email/password + Emergent Google OAuth + GDPR consent
- Developer account: **`dragosserban95@gmail.com`** (auto-detected, plan=`developer`, lifetime)

## Architecture
- Backend: FastAPI + MongoDB (motor); modules: `industries.py`, `system_templates.py`, `plans.py`, `calc_engine.py`, `ai_assistant.py`, `ai_developer.py`, `qes_provider.py`, `docx_processor.py`, `signing.py`, `email_sender.py`, `auth.py`, `db.py`
- Frontend: React 19 + Tailwind, IBM Plex Sans/Mono, amber #FFB300, Swiss/brutalist
- Per-user **active project** drives all operational pages
- System-seeded DOCX templates available for all users (clone to library)

## Industries (8 catalogued)
1. ✅ **Gas naturale** (active) — 5 subdomenii active: Branșamente, Instalații utilizare, Extinderi conductă, Studii fezabilitate, Înlocuiri/modernizări
2. ⏳ Electrică (coming_soon)
3. ⏳ Apă & canalizare (coming_soon)
4. ⏳ Construcții civile (coming_soon)
5. ⏳ Telecom (coming_soon)
6. ⏳ Fotovoltaice (coming_soon)
7. ⏳ Construcții (coming_soon)
8. ⏳ Infrastructură feroviară (coming_soon)

## Imported from upstream repo (dragosserban95/Energy-Project-Design)
- VGD/RTE detail fields: atestat_vgd, data_verificare_vgd, status_vgd, observatii_vgd, autorizatie_rte, data_verificare_rte, status_rte, observatii_rte
- 3 additional industries matching the locked profiles list (Fotovoltaice, Construcții, Infrastructură feroviară)
- 2 additional system templates: certificare_vgd, certificare_rte
- Dual placeholder syntax support: `{{var}}` AND `<var>` (the upstream repo uses `<>`)

## Implemented (2026-02, V4.5+V4.6)
- ✅ 10 EUR plans (Basic 99 → Societate 399 + Developer)
- ✅ Multi-project CRUD + active project switcher in header + archive/restore/delete
- ✅ Industry & subdomain selector on project creation (validated server-side)
- ✅ Date proiect (14 required fields + completion score)
- ✅ Date tehnice + Calcul inteligent (6 smart boxes with formulas, sources, override)
- ✅ 4 system templates pre-seeded for gas engineering (Cerere racordare, Memoriu tehnic, Borderou, Adresă OSD)
- ✅ Clone-to-library workflow for system templates
- ✅ Templates / Stamps / Certificates PKI / Documents with Print button
- ✅ Email composer with 7 templates + role-based recipients + placeholder resolution
- ✅ Internal Certifications (SHA-256 + role + signer + timestamp)
- ✅ AI Assistant — intent parser (13 intents) with command-packet preview
- ✅ AI Developer panel (Plan Mode only — no auto-apply) with OpenAI BYOK enrichment, safety rules, handoff list (Emergent/Claude/ChatGPT/Codex)
- ✅ Verifică documentație — 8-check scoring engine + JSON export
- ✅ Audit interfață — 13+ pages with plan-access flags
- ✅ Settings: per-user Gmail config + QES credentials forms (per provider)
- ✅ Legal pages with real ENERGY PROJECT DESIGN SRL data
- ✅ GDPR consent required at register; /gdpr/export + /gdpr/account DELETE
- ✅ Developer auto-detection across email/password AND Google OAuth

## Testing
- **67/67 backend pytest pass** (27 regression + 20 v4.5 + 20 v4.6)

## Backlog
- P1: Encrypt `qes_credentials` at rest (Fernet/KMS)
- P1: Implement real certSIGN/DigiSign/Trans Sped subclasses (needs API contract)
- P1: Switch to Stripe live key (`sk_live_...`)
- P2: PDF export alongside DOCX
- P2: Team workspaces with role inheritance
- P2: Activate electrical / water-sewage / civil / telecom industries
- P2: Public verification page `/verify/{doc_id}`
- P3: Encrypt action_logs and gmail_app_password at rest

## Handoff (for any AI / human developer)
- Code root: `/app/` (backend `/app/backend`, frontend `/app/frontend`)
- API base: `${REACT_APP_BACKEND_URL}/api` (Kubernetes ingress, all backend routes start with `/api`)
- DB: MongoDB via `MONGO_URL` env var
- Tests: `pytest /app/backend/tests/ -v`
- Restart: `sudo supervisorctl restart backend|frontend`
- Compatible AI agents to continue: Emergent E1, Anthropic Claude, OpenAI ChatGPT, OpenAI Codex/Copilot

### Adding a new industry
1. Add entry in `/app/backend/industries.py` `INDUSTRIES` dict with `status='active'` and subdomains with `active=True`
2. Add system templates in `/app/backend/system_templates.py` (builder + entry in `SYSTEM_TEMPLATES`)
3. No frontend changes needed — `/proiecte` page auto-discovers via `GET /api/industries`

### Adding a new QES provider
1. Implement subclass in `/app/backend/qes_provider.py` (set `status='active'` in `info()`)
2. Register in `PROVIDERS` dict
3. Add credential field schema in `/app/frontend/src/pages/Settings.jsx` `QES_FIELDS`


---

## 📜 README

# Energy Project Design Services

B2B SaaS pentru documentație inginerească (gaze naturale, electrice, construcții, etc.) — companie reală: **ENERGY PROJECT DESIGN SRL** (CUI 43151074, J40/12982/2020, București).

🌐 **Live (Render)**: https://energy-project-design-services.onrender.com
🛠 **Preview (Emergent)**: https://template-stamp-hub.preview.emergentagent.com

## Stack

- **Backend**: FastAPI + Motor (MongoDB) + python-docx + reportlab + emergentintegrations (LLM)
- **Frontend**: React 19 + Tailwind + Shadcn/UI
- **Auth**: JWT email/password + Emergent Google OAuth + GDPR consent
- **Payments**: Stripe (EUR)
- **Email**: Per-user Gmail SMTP
- **Digital signatures**: PKCS#12 local + QES scaffold (certSIGN/DigiSign/Trans Sped)

## Functionalities

- Multi-proiect cu industrie + subdomeniu (8 industrii: gaze, electrică, apă, construcții civile, telecom, fotovoltaice, construcții, infrastructură feroviară)
- Date proiect (14 câmpuri) + Calcul inteligent (6 formule)
- Generare DOCX + PDF cu placeholder replacement (`{{var}}` și `<var>`)
- Template-uri sistem (cerere racordare, memoriu tehnic, borderou, adresă OSD, certificare VGD/RTE)
- Email composer cu 7 template-uri + role-based recipients
- AI Assistant (intent parser, 13 intenții) + AI Developer Chat (Plan Mode)
- Internal Certifications (SHA-256 + role + signer + timestamp)
- Audit interfață + GDPR export/delete
- **Developer prompt → GitHub auto-push** (V4.8): logat ca `dragosserban95@gmail.com`, scrii prompt → comită direct în `main` → Render auto-deploy

## Setup local

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env  # populate secrets
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd frontend
yarn install
cp .env.example .env  # set REACT_APP_BACKEND_URL=http://localhost:8001
yarn start
```

MongoDB: `mongodb://localhost:27017` (sau MongoDB Atlas în prod).

## Deploy pe Render

1. Conectează acest repo în [Render dashboard](https://dashboard.render.com/select-repo)
2. Render detectează automat `render.yaml` și creează 2 servicii (backend + frontend static)
3. Completează secretele lipsă în Render UI (MONGO_URL, JWT_SECRET, STRIPE_API_KEY, GMAIL_USER, GMAIL_APP_PASSWORD, OPENAI_API_KEY, GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GITHUB_TOKEN, EPD_UPDATE_SECRET, DEVELOPER_TEST_PASSWORD)
4. Deploy → URL public: `https://energy-project-design-services.onrender.com`

Pentru MongoDB, recomandare: [MongoDB Atlas Free Tier (M0)](https://www.mongodb.com/cloud/atlas/register).

## Developer prompt → GitHub push

După login ca `dragosserban95@gmail.com` (parolă `Test12345`) → pagina **AI Developer** → scrii prompt-ul de îmbunătățire + lista fișierelor + conținutul nou → API-ul `POST /api/dev/github/push` commit-uie direct pe branch-ul `main`. Render auto-deploy se declanșează în ~30s.

## Licență

Proprietary © ENERGY PROJECT DESIGN SRL 2026.


---

## 🔐 Test credentials

# Test Credentials

## Developer account (lifetime, auto-detected)
- email: dragosserban95@gmail.com
- password: Test12345
- Auto-marked is_developer=true, plan=developer on first register OR login

## Backend env
- STRIPE_API_KEY=sk_test_emergent (in /app/backend/.env)
- MONGO_URL=mongodb://localhost:27017
- Gmail: per-user via /api/users/me PATCH

## App
- URL: https://template-stamp-hub.preview.emergentagent.com
- App: Energy Project Design Services v4.5+v4.6
- Company: ENERGY PROJECT DESIGN SRL, CUI 43151074, J40/12982/2020

## Note for testing
- Register endpoint requires gdpr_consent=true (Romanian message returned otherwise)
- Active project: each user has one active at a time; switching via POST /api/projects/{id}/activate
- System templates seeded at backend startup (4 templates for gas engineering)


---

## 📦 Repo state — ultimele commits

| SHA | Data | Mesaj |
|-----|------|-------|
| `de504dc` | 2026-06-06T00:49:06Z | feat(dev): handoff export + push for cross-account Emergent transfer |
| `4c128a1` | 2026-06-06T00:49:06Z | feat(dev): handoff export + push for cross-account Emergent transfer |
| `7b7c9fe` | 2026-06-06T00:49:05Z | feat(dev): handoff export + push for cross-account Emergent transfer |
| `b485aa5` | 2026-06-05T21:29:25Z | feat(dev): GitHub push UI + /api/dev/github/{status,push} endpoints |
| `b98d1fa` | 2026-06-05T21:29:24Z | feat(dev): GitHub push UI + /api/dev/github/{status,push} endpoints |
| `8f12a2b` | 2026-06-05T21:29:24Z | feat(dev): GitHub push UI + /api/dev/github/{status,push} endpoints |
| `bc93489` | 2026-06-05T21:29:23Z | feat(dev): GitHub push UI + /api/dev/github/{status,push} endpoints |
| `ea164fc` | 2026-06-05T21:29:22Z | feat(dev): GitHub push UI + /api/dev/github/{status,push} endpoints |
| `e5bbcc7` | 2026-06-05T21:26:55Z | sync(frontend): Templates.jsx, Termeni.jsx, Verification.jsx... |
| `914d12e` | 2026-06-05T21:26:54Z | sync(frontend): Templates.jsx, Termeni.jsx, Verification.jsx... |
| `e27814a` | 2026-06-05T21:26:53Z | sync(frontend): Templates.jsx, Termeni.jsx, Verification.jsx... |
| `da1d8f8` | 2026-06-05T21:26:52Z | sync(frontend): Templates.jsx, Termeni.jsx, Verification.jsx... |

Vezi toate commit-urile: https://github.com/dragosserban95/Energy-Project-Design/commits/main

---

## ⚙️ Backend env keys (`backend/.env`) — valorile redacted, copiază din contul tău

```
MONGO_URL=
DB_NAME=
CORS_ORIGINS=
STRIPE_API_KEY=
JWT_SECRET=
JWT_ALGORITHM=
JWT_EXPIRE_HOURS=
GMAIL_USER=
GMAIL_APP_PASSWORD=
OPENAI_API_KEY=
EPD_AI_MODEL=
DEVELOPER_TEST_EMAIL=
DEVELOPER_TEST_PASSWORD=
GOOGLE_API_KEY=
GOOGLE_CLIENT_ID=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=
EPD_UPDATE_SECRET=
SMTP_FROM_NAME=
TZ=
```

Detalii unde obții fiecare cheie sunt în `backend/.env.example`.

## ⚙️ Frontend env keys (`frontend/.env`)

```
REACT_APP_BACKEND_URL=
WDS_SOCKET_PORT=
ENABLE_HEALTH_CHECK=
```

---

## 🚀 Deployment cu Render (1-click)

1. `render.yaml` e deja în rădăcina repo-ului — auto-detectat de Render.
2. Conectează repo-ul în [Render dashboard](https://dashboard.render.com/select-repo).
3. Setezi secretele în Render UI (env vars).
4. URL public: `https://energy-project-design-services.onrender.com`

## 🤖 Developer prompt → GitHub auto-push

După login ca `dragosserban95@gmail.com` → meniul **// Intern → Push pe GitHub** (`/developer/github`):
- Endpoint backend: `POST /api/dev/github/push` (`backend/github_push.py`)
- Trimite fișiere noi/actualizate → commit pe `main` → Render auto-deploy

---

## 🗂️ Arhitectură pe scurt

```
/app/
├── backend/                 FastAPI + Motor (MongoDB)
│   ├── server.py            Router principal (/api/*)
│   ├── auth.py              JWT email/password + Emergent Google
│   ├── github_push.py       Developer → GitHub commit
│   ├── ai_assistant.py      Intent parser (13 intents)
│   ├── ai_developer.py      Plan Mode (no auto-apply)
│   ├── docx_processor.py    Placeholder replacement {{var}} și <var>
│   ├── pdf_export.py        reportlab
│   ├── calc_engine.py       6 formule (debit, presiune, etc.)
│   ├── qes_provider.py      Mock acum; certSIGN/DigiSign/Trans Sped pending
│   ├── plans.py             Stripe plans (Basic 99 → Societate 2500 + Developer)
│   ├── industries.py        8 industrii (gaze activ; restul coming_soon)
│   └── system_templates.py  6 template-uri pre-seeded
└── frontend/
    └── src/
        ├── App.js
        ├── contexts/AuthContext.jsx
        ├── lib/api.js       axios baseURL = `${REACT_APP_BACKEND_URL}/api`
        └── pages/           ~25 pagini (Dashboard, Projects, ProjectData, ...)
```

---

## ✅ Done / ⏳ Pending / 📦 Backlog

### Done (în această sesiune)
- ✅ Cod complet push-uit în GitHub (`backend/`, `frontend/src/`, `render.yaml`, `.env.example`)
- ✅ Endpoint developer **GitHub auto-push** + pagină `/developer/github` cu UI completă
- ✅ Endpoint **handoff export** (acest fișier!)
- ✅ V4.7 features: PDF export (reportlab), AI Developer Chat, prețuri actualizate (Societate 2500 EUR), industria "Construcții" activată

### Pending (next actions pentru noul user)
- 🔴 **Deploy pe Render**: conectează repo-ul (link mai sus) + setează secretele
- 🟠 **Refactor auth**: localStorage → httpOnly cookies (`AuthContext.jsx`, `auth.py`, `server.py`, `api.js`). Solicitat de Code Review.
- 🟡 **QES real**: certSIGN/DigiSign/Trans Sped subclass — așteaptă contract + API key de la user
- 🟡 **Stripe live key**: schimbă `sk_test_emergent` cu cheia live din .env

### Backlog (P2-P3)
- Encrypt `qes_credentials` la rest (Fernet)
- Refactor `server.py::verify_documentation()` (93 linii)
- Refactor `pages/Developer.jsx` (componentă mare)
- Activare industrii: Electrică / Apă & Canalizare / Telecom / Fotovoltaice / Infrastructură feroviară
- Team workspaces cu role inheritance
- Public verification page `/verify/{doc_id}`

---

## 🧪 Test rapid după preluare

```bash
cd /app
# Backend
curl http://localhost:8001/api/                                # {"status":"ok"...}
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}'

# Frontend
# vizitezi preview URL, te loghezi, vezi meniul "// Intern" cu 3 itemi developer.
```

---

## 📬 Contact

Compania reală: **ENERGY PROJECT DESIGN SRL** · CUI 43151074 · J40/12982/2020 · București.
Limba interfeței: română.

---

_End of handoff. Bună continuare 👋_

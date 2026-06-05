# StampDoc Romania — PRD

## Original Problem Statement
Build me a web site for gas pipes engineering companies in Romania that operates uploaded docx templates to replace within them text introduced by textboxs within the application, stamp them with stamps images uploaded, digitally authorize the stamps introduced, sent the generated docx to email recipients and have purchasing plans for each user, with google login and register by email/account and password.

## User Choices
- UI language: **Romanian**
- Email service: **Gmail/Google SMTP**
- Payments: **Stripe** with RON (Romanian Leu)
- Digital signature: **PKI / PKCS#12** with CMS detached signature (`.p7s`)
- Auth: **Email/password (JWT)** + **Emergent-managed Google OAuth**

## User Personas
- Gas pipes engineer at a small/medium Romanian installation firm
- Technical office manager preparing ANRE-compliant documentation
- Owner needing fast, repeatable, signed documents to clients

## Core Requirements (Static)
1. Upload DOCX templates with `{{placeholder}}` markers; auto-detect placeholders
2. Render dynamic form for placeholders; generate populated DOCX
3. Upload stamp images (PNG/JPG); insert into DOCX at chosen position & size
4. Upload PKCS#12 certificates; produce CMS detached signature `.p7s`
5. Send generated DOCX + `.p7s` via Gmail SMTP to recipients
6. Subscription plans in RON: Free / Pro (99) / Enterprise (299) via Stripe
7. Email/password + Google login

## Architecture
- Backend: FastAPI, MongoDB (motor), JWT auth, Emergent OAuth, Stripe via emergentintegrations, python-docx, endesive (CMS), cryptography
- Frontend: React 19, react-router 7, axios, sonner, Tailwind (IBM Plex Sans/Mono), lucide-react

## Implemented (2026-02)
- ✅ Romanian landing page (Swiss/brutalist design)
- ✅ Login / Register (email + Google OAuth)
- ✅ Dashboard with stats and recent docs
- ✅ Template upload + placeholder auto-detection
- ✅ Template editor with dynamic form, stamp & cert selectors
- ✅ Stamp upload library
- ✅ Certificate (.p12) upload + parsing
- ✅ DOCX generation: placeholder replacement + stamp insertion
- ✅ CMS detached signing (.p7s) via endesive
- ✅ Document history / download / signature download
- ✅ Email sending (Gmail SMTP) with DOCX + .p7s attachments
- ✅ Stripe checkout (RON) for Pro/Enterprise + polling + plan activation
- ✅ Quota enforcement (free=5 total, pro=200/mo, enterprise=2000/mo)
- ✅ Settings page

## Backlog
- P1: Custom stamp positioning with drag-and-drop preview
- P1: PDF export alongside DOCX
- P1: Team/multi-user workspaces
- P2: Document templates marketplace
- P2: API access for Enterprise
- P2: PAdES/CAdES qualified e-signature via certSIGN integration

## Next Action Items
- User to provide GMAIL_USER and GMAIL_APP_PASSWORD to enable email sending
- Production Stripe keys for live RON payments
- Add legal pages (Termeni, Confidențialitate, GDPR)

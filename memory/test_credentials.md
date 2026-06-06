# Test Credentials

## Developer account (lifetime, auto-detected)
- email: dragosserban95@gmail.com
- password: Test12345
- Auto-marked is_developer=true, plan=developer on first register OR login

## Backend env
- STRIPE_API_KEY=sk_test_emergent (in /app/backend/.env)
  - **Production: replace with `sk_live_...` — NO code changes needed**
- MONGO_URL=mongodb://localhost:27017
- Gmail: per-user via /api/users/me PATCH

## App
- URL: https://template-stamp-hub.preview.emergentagent.com
- App: Energy Project Design Services v4.8
- Company: ENERGY PROJECT DESIGN SRL, CUI 43151074, J40/12982/2020

## Auth flow (V4.8+)
- **httpOnly Secure SameSite=None cookies** (XSS-safe — token NEVER in localStorage)
- Login/Register set the `session_token` cookie automatically
- Authorization Bearer header is also supported (backward-compat for curl/testing)
- Logout endpoint clears the cookie and DB session

## Testing examples
```bash
# Login + use cookie for all subsequent calls
curl -c /tmp/c.txt -X POST $BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}'
curl -b /tmp/c.txt $BACKEND_URL/api/auth/me   # cookie-only auth

# OR use Bearer token (for scripted testing)
TOKEN=$(curl -s -X POST $BACKEND_URL/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"dragosserban95@gmail.com","password":"Test12345"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -H "Authorization: Bearer $TOKEN" $BACKEND_URL/api/auth/me
```

## Note for testing
- Register endpoint requires gdpr_consent=true (Romanian message returned otherwise)
- Active project: each user has one active at a time; switching via POST /api/projects/{id}/activate
- System templates seeded at backend startup (4-6 templates for gas engineering + VGD/RTE)
- All 8 industries are now active (34 subdomains)

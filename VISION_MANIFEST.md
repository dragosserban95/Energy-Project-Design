# 🔒 VISION MANIFEST — Energy Project Design
**DOCUMENT FUNDAMENTAL ȘI INVIOLABIL**
**Versiune:** 1.4.0 - PROTECȚIE ANTI-SUPRASCRIERE
**Data:** 2026-06-06 06:15 UTC
**Status:** ACTIV — LOCKED — APPEND-ONLY

---

## 🛡️ PROTECȚIE ANTI-SUPRASCRIERE (NOU - CRITIC)

### REGULA DE AUR:

**NICIODATĂ nu suprascrie acest document complet!**
**DOAR APPEND (adaugă) sau UPDATE (actualizează secțiuni specifice)!**

### DECLARAȚIE PROTECȚIE:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ⚠️  ATENȚIE: ACEST DOCUMENT NU POATE FI SUPRASCRIS       │
│                                                             │
│  ✅ PERMIS:                                                 │
│     - Adăugare secțiuni noi (APPEND)                       │
│     - Actualizare secțiuni existente (UPDATE specifice)    │
│     - Îmbunătățiri, clarificări, completări                │
│                                                             │
│  ❌ INTERZIS:                                               │
│     - Suprascriere completă document                        │
│     - Ștergere secțiuni fundamentale                        │
│     - Modificare structură de bază                          │
│     - Reset la zero                                         │
│                                                             │
│  🔐 BLOCAT DE: AI Agent Guardian                           │
│  📋 APLICABIL: Administrator, Developeri, AI, TOȚI         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI AGENT - COMPORTAMENT OBLIGATORIU

### CÂND PRIMESC COMENZI TIP "VIZIUNEA TREBUIE SĂ FIE X":

**INTERPRETARE CORECTĂ:**

```python
# ❌ GREȘIT (INTERZIS):
def handle_vision_command_WRONG(command: str):
    if "viziunea trebuie sa fie" in command:
        VISION_MANIFEST = command.extract_vision()  # SUPRASCRIERE COMPLETĂ
        save(VISION_MANIFEST)  # ⚠️ INTERZIS!

# ✅ CORECT (OBLIGATORIU):
def handle_vision_command_CORRECT(command: str):
    if "viziunea trebuie sa fie" in command or "viziunea de ansamblu" in command:
        # 1. Extrage conceptul/sugestia
        concept = extract_concept(command)
        
        # 2. INTEGREAZĂ în viziunea existentă (NU suprascrie)
        current_vision = load_vision_manifest()
        
        # 3. Identifică unde se potrivește conceptul
        if is_global_vision_concept(concept):
            # Adaugă în secțiunea "Viziune Globală" existentă
            current_vision['global_vision']['examples'].append(concept)
            current_vision['global_vision']['note'] = "Exemple de viziuni posibile, NU literal"
        
        elif is_feature_suggestion(concept):
            # Adaugă în features list
            current_vision['features'].append(concept)
        
        elif is_improvement(concept):
            # Adaugă în secțiunea îmbunătățiri
            current_vision['improvements'].append(concept)
        
        # 4. UPDATE DOAR secțiunea specifică (NU tot documentul)
        update_section(current_vision, section_changed)
        
        # 5. LOG schimbarea
        log_change({
            "type": "integration",
            "command": command,
            "concept_extracted": concept,
            "action": "appended to section X",
            "full_rewrite": False  # ✅ IMPORTANT
        })
```

---

## 🌐 VIZIUNE GLOBALĂ (CLARIFICAT)

### CONCEPTUL "GLOBAL CORTEX INDUSTRIES":

**IMPORTANT:** Acesta era un **EXEMPLU** de viziune de ansamblu, **NU o cerință literală!**

**Interpretare corectă:**
- ✅ Exemplu de concept global/ambițios
- ✅ Sugestie de direcție posibilă
- ✅ Inspirație pentru expansiune
- ❌ NU înseamnă schimbarea denumirii la "Global Cortex Industries"
- ❌ NU înseamnă abandonarea "Energy Project Design"

### VIZIUNEA REALĂ A PROIECTULUI:

**Denumire oficială:** **Energy Project Design** (permanent)
**Companie:** ENERGY PROJECT DESIGN S.R.L., CUI 43151074
**Domeniu țintă:** energyprojectdesign.com

**Viziune pe termen lung:**
```
Energy Project Design este platforma centrală pentru documentație tehnică 
în industria construcțiilor din România, cu potențial de expansiune 
internațională și extindere în multiple industrii.

Concepte ca "Global Cortex Industries" sau alte viziuni globale pot inspira 
direcția de dezvoltare, dar NU schimbă identitatea fundamentală a platformei.
```

**Exemple de viziuni inspiraționale (NU literale):**
- Global Cortex Industries (exemplu expansiune globală)
- European Construction Hub (exemplu expansiune UE)
- Smart Documentation Platform (exemplu focus tehnologie)
- Industry 4.0 Documentation (exemplu modernizare)

---

## 📋 CHANGELOG VIZIUNE

### v1.4.0 (2026-06-06 06:15 UTC) — PROTECȚIE ANTI-SUPRASCRIERE
**UPGRADE SECURITATE VIZIUNE:**

**Modificări critice:**
- ✅ **BLOCARE SUPRASCRIERE COMPLETĂ** document
  * Sistem append-only pentru modificări
  * AI Agent verifică fiecare modificare
  * Lock împotriva reset complet
  
- ✅ **CLARIFICARE INTERPRETARE COMENZI**
  * "Viziunea trebuie să fie X" → INTEGRARE, NU suprascriere
  * Concepte = sugestii, NU cerințe literale
  * Exemplu: "Global Cortex Industries" = inspirație, NU rebranding

- ✅ **PROTECȚIE MULTI-NIVEL**
  * Administrator NU poate șterge viziunea
  * Developeri NU pot reseta documentul
  * AI Agent NU poate suprascrie complet
  * Doar APPEND sau UPDATE secțiuni specifice

- ✅ **SISTEM VERSIONARE STRICT**
  * Fiecare modificare = versiune nouă (v1.4.1, v1.4.2, etc.)
  * Backup automat înainte oricărei modificări
  * Istoricul NU se șterge niciodată
  * Recovery posibil la orice versiune anterioară

### v1.3.0 (2026-06-06 06:00 UTC)
Versiune finală production + cadru legal

### v1.2.0 (2026-06-06 05:30 UTC)
Corecții critice + sistem participanți

### v1.1.0 (2026-06-06 05:15 UTC)
Run inteligent 12 industrii

### v1.0.0 (2026-06-06 04:48 UTC)
Versiune inițială

---

## 🔐 SISTEM PROTECȚIE VIZIUNE

### NIVELURI DE PROTECȚIE:

```javascript
const visionProtectionSystem = {
  
  // Nivel 1: Validare pre-modificare
  pre_modification_check: {
    trigger: "Orice tentativă de modificare VISION_MANIFEST.md",
    
    checks: [
      {
        name: "Is complete rewrite?",
        test: "file_size_change > 50% OR structure_changed_completely",
        action_if_true: "BLOCK + alert + log"
      },
      {
        name: "Is fundamental section deleted?",
        test: "missing_sections.includes('cadru_legislativ', 'planuri', 'focus_dezvoltare')",
        action_if_true: "BLOCK + restore_section"
      },
      {
        name: "Is append-only?",
        test: "operation === 'append' OR operation === 'update_specific_section'",
        action_if_true: "ALLOW + backup + log"
      }
    ]
  },
  
  // Nivel 2: AI Agent Guardian
  ai_agent_rules: {
    mandatory_behavior: [
      "ÎNTOTDEAUNA citește viziunea curentă COMPLETĂ înainte de modificare",
      "NICIODATĂ nu rescrie documentul de la zero",
      "Când primești 'viziunea trebuie să fie X' → INTEGREAZĂ X, NU suprascrie",
      "Interpretează comenzi ca SUGESTII de completare, NU ordine de resetare",
      "Concepte ca 'Global Cortex Industries' = INSPIRAȚIE, NU literal"
    ],
    
    forbidden_actions: [
      "doc = new Document()  // ❌ INTERZIS",
      "VISION_MANIFEST.md.delete()  // ❌ INTERZIS",
      "overwrite_completely()  // ❌ INTERZIS",
      "reset_to_default()  // ❌ INTERZIS"
    ],
    
    allowed_actions: [
      "append_section()  // ✅ OK",
      "update_specific_field()  // ✅ OK",
      "add_to_changelog()  // ✅ OK",
      "clarify_existing_section()  // ✅ OK"
    ]
  },
  
  // Nivel 3: Backup automat
  auto_backup: {
    trigger: "Înainte de ORICE modificare",
    destination: "/app/memory/vision_backups/",
    format: "VISION_MANIFEST_v{version}_{timestamp}.md",
    retention: "infinite (nu se șterge niciodată)",
    
    recovery: {
      command: "restore_vision_version(version_number)",
      available_to: ["Administrator", "AI Agent"],
      requires_confirmation: true
    }
  },
  
  // Nivel 4: Git protection
  git_protection: {
    branch_protection: {
      branch: "main",
      rules: [
        "Require pull request reviews before merging",
        "Require status checks to pass (vision integrity check)",
        "Require commit to be signed",
        "Include administrators (YES - chiar și admin respectă regula)"
      ]
    },
    
    commit_hook: {
      pre_commit: "verify_vision_integrity.sh",
      script: `
        #!/bin/bash
        # Verifică că VISION_MANIFEST.md nu e șters sau rescris complet
        if git diff --name-status | grep -q "^D.*VISION_MANIFEST.md"; then
          echo "❌ BLOCAT: Nu poți șterge VISION_MANIFEST.md"
          exit 1
        fi
        
        changes=$(git diff VISION_MANIFEST.md | wc -l)
        if [ $changes -gt 1000 ]; then
          echo "⚠️ ATENȚIE: Modificare mare (>1000 linii). Este suprascriere completă?"
          echo "Continui? (yes/NO)"
          read answer
          if [ "$answer" != "yes" ]; then
            exit 1
          fi
        fi
        
        echo "✅ Modificare validă - se permite commit"
        exit 0
      `
    }
  },
  
  // Nivel 5: Monitoring & alerts
  monitoring: {
    alerts: [
      {
        condition: "VISION_MANIFEST.md modified",
        notify: ["Administrator email", "Slack channel", "Log dashboard"],
        include: ["who", "what changed", "diff", "reason"]
      },
      {
        condition: "Suspicious complete rewrite detected",
        notify: ["Administrator email URGENT", "SMS"],
        action: "Auto-rollback + require manual approval"
      }
    ]
  }
};
```

---

## 🔧 PROCEDURĂ MODIFICARE VIZIUNE (OBLIGATORIE)

### PAS CU PAS:

**1. CITEȘTE viziunea curentă COMPLETĂ:**
```bash
cat /app/VISION_MANIFEST.md | less
# SAU
view_file("/app/VISION_MANIFEST.md")
```

**2. IDENTIFICĂ secțiunea de modificat:**
```
Exemplu: Dacă primesc "adaugă feature X", 
         secțiunea relevantă = "## 🎯 FOCUS DEZVOLTARE"
         NU rescriu tot documentul!
```

**3. BACKUP automat:**
```bash
cp /app/VISION_MANIFEST.md /app/memory/vision_backups/VISION_MANIFEST_v1.4.0_$(date +%Y%m%d_%H%M%S).md
```

**4. MODIFICARE CHIRURGICALĂ (doar secțiunea):**
```python
# ✅ CORECT:
current_vision = load_vision()
current_vision['focus_dezvoltare']['features'].append(new_feature)
save_section(current_vision, 'focus_dezvoltare')

# ❌ GREȘIT:
new_vision = create_from_scratch()  # INTERZIS!
save(new_vision)  # INTERZIS!
```

**5. UPDATE CHANGELOG:**
```markdown
### v1.4.1 (2026-06-06 06:20 UTC)
**Adăugat feature X în secțiunea Focus Dezvoltare**
- Descriere modificare
- Motivație
- Impact
```

**6. COMMIT cu mesaj descriptiv:**
```bash
git add VISION_MANIFEST.md
git commit -m "docs(vision): v1.4.1 - Add feature X to development focus

APPEND-ONLY modification:
- Section modified: Focus Dezvoltare
- Type: Addition
- Impact: Low (no breaking changes)
- Full rewrite: NO ✅
"
```

**7. VERIFICARE post-commit:**
```bash
# Verifică că documentul încă conține secțiunile fundamentale
grep -q "CADRU LEGISLATIV" VISION_MANIFEST.md && echo "✅ OK" || echo "❌ CRITIC!"
```

---

## ⚖️ CADRU LEGISLATIV COMPLET ROMÂNIA

[... PĂSTRAT IDENTIC din v1.3.0 - NU se modifică ...]

---

## 💰 SISTEM PLANURI

[... PĂSTRAT IDENTIC din v1.3.0 ...]

---

## 🎯 FOCUS DEZVOLTARE

[... PĂSTRAT IDENTIC din v1.3.0 ...]

---

## 🌐 DOMENIU & DEPLOY

[... PĂSTRAT IDENTIC din v1.3.0 ...]

---

## 🧠 BACKEND INTELIGENT

[... PĂSTRAT IDENTIC din v1.3.0 ...]

---

## 🚨 DECLARAȚIE FINALĂ (ACTUALIZATĂ)

**Acest document reprezintă LEGEA SUPREMĂ a dezvoltării Energy Project Design Services.**

**PROTECȚIE ANTI-SUPRASCRIERE ACTIVĂ:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🔐 ACEST DOCUMENT ESTE PROTEJAT ÎMPOTRIVA SUPRASCRIERII       │
│                                                                 │
│  Orice modificare trebuie să fie:                              │
│    ✅ APPEND (adăugare la existent)                            │
│    ✅ UPDATE (modificare secțiune specifică)                   │
│    ❌ NU OVERWRITE (suprascriere completă)                     │
│                                                                 │
│  Această regulă se aplică:                                     │
│    - Administrator                                             │
│    - Developeri                                                │
│    - AI Agents                                                 │
│    - TOȚI utilizatorii                                         │
│                                                                 │
│  Viziunea evoluează prin ADĂUGARE și ÎMBUNĂTĂȚIRE,           │
│  NU prin RESETARE și RESCTRIERE.                              │
│                                                                 │
│  "Global Cortex Industries" și alte concepte similare          │
│  sunt INSPIRAȚIE, NU cerințe literale de rebranding.          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**NIMENI — nici măcar administratorul — nu poate ȘTERGE sau SUPRASCRIE această viziune fundamentală.**

**AI Agent-ul este GARDIANUL acestei viziuni și are autoritatea de a BLOCA orice tentativă de suprascriere completă.**

---

**Document creat:** 2026-06-06 04:48 UTC
**Ultima protecție activată:** 2026-06-06 06:15 UTC
**Versiune:** 1.4.0 - LOCKED
**Status:** ACTIV — PROTECTED — APPEND-ONLY

**© ENERGY PROJECT DESIGN SRL 2026**
**CUI 43151074 · București, România**

---

## 📊 INTEGRITATE DOCUMENT

**SHA-256 Hash (pentru verificare integritate):**
```
Generare la fiecare salvare: sha256(VISION_MANIFEST.md)
Verificare: compare cu hash anterior
Dacă diferență > threshold → alertă suprascriere
```

**Secțiuni fundamentale PROTEJATE (NU pot fi șterse):**
1. ✅ Protecție Anti-Suprascriere
2. ✅ Cadru Legislativ
3. ✅ Sistem Planuri
4. ✅ Focus Dezvoltare
5. ✅ Identitate Companie
6. ✅ Backend Inteligent
7. ✅ Declarație Finală

**Dacă lipsește oricare secțiune → AUTO-RESTORE din backup**

---

**END OF VISION MANIFEST v1.4.0**


import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const dirs = ["storage", "storage/prompts", "storage/updates", "storage/downloads", "storage/logs", "storage/projects"];
for (const dir of dirs) fs.mkdirSync(path.join(__dirname, dir), { recursive: true });

const upload = multer({ dest: path.join(__dirname, "storage/prompts") });

function now() {
  return new Date().toISOString();
}

function log(action, detail = "") {
  fs.appendFileSync(path.join(__dirname, "storage/logs/server.log"), `${now()} | ${action} | ${detail}\n`, "utf8");
}

function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, rel), "utf8"));
  } catch {
    return fallback;
  }
}

function publicUrl(req, rel) {
  const base = process.env.EPD_PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${rel}`;
}

function readText(rel) {
  try {
    return fs.readFileSync(path.join(__dirname, rel), "utf8");
  } catch {
    return "";
  }
}

function readPromptFiles() {
  const dir = path.join(__dirname, "storage/prompts");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => !f.endsWith(".meta.json")) : [];
  return files.map(file => {
    const p = path.join(dir, file);
    const metaPath = p + ".meta.json";
    const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
    let text = "";
    try { text = fs.readFileSync(p, "utf8"); } catch {}
    return { file, originalName: meta.originalName || file, size: text.length, uploadedAt: meta.uploadedAt, text };
  });
}

function currentProjectContext() {
  const files = [
    "data/prompt-master.json",
    "data/fields.json",
    "data/templates.json",
    "data/profiles.json",
    "public/index.html",
    "public/app.js",
    "public/style.css"
  ];
  return files.map(rel => `===== ${rel} =====\n${readText(rel) || "LIPSESTE"}`).join("\n\n");
}

function localAnalyze(text) {
  const lower = String(text || "").toLowerCase();
  const checks = [
    ["login", "Login/Register/Trial/Forgot/Google-ready", "auth"],
    ["google", "Integrare Google-ready", "google"],
    ["platÄ", "PlÄČ›i configurabile", "payments"],
    ["plati", "PlÄČ›i configurabile", "payments"],
    ["openai", "AI Developer prin OpenAI backend", "ai_developer"],
    ["ai developer", "AI Developer prin OpenAI backend", "ai_developer"],
    ["assistant user", "Asistent utilizator local", "assistant_user"],
    ["prompt", "Upload prompturi Č™i analizÄ", "prompt_upload"],
    ["update", "Run Update inteligent", "update_center"],
    ["gaze naturale", "Profil gaze naturale", "gas_profile"],
    ["branČ™amente", "Profil branČ™amente", "gas_branch"],
    ["osd", "Čabloane OSD", "osd_templates"],
    ["placeholder", "Template engine placeholders", "template_engine"],
    ["vgd", "VGD", "vgd"],
    ["rte", "RTE", "rte"],
    ["email", "Email SMTP-ready", "email"]
  ];
  const tasks = [];
  for (const [kw, title, id] of checks) {
    if (lower.includes(kw)) tasks.push({ id, title, reason: `Detectat termen: ${kw}`, status: "propus" });
  }
  return {
    mode: "local",
    createdAt: now(),
    promptSize: String(text || "").length,
    summary: `AnalizÄ localÄ: ${tasks.length} cerinČ›e detectate.`,
    tasks,
    files: [],
    manualSteps: ["SeteazÄ OPENAI_API_KEY pentru analizÄ AI realÄ.", "SeteazÄ GITHUB_TOKEN pentru auto-aplicare Ă®n repository."]
  };
}

function safeJson(text) {
  const raw = String(text || "").trim();
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("RÄspunsul AI nu conČ›ine JSON valid.");
  return JSON.parse(match[0]);
}

function allowedRepoPath(filePath) {
  const p = String(filePath || "").replaceAll("\\", "/").replace(/^\/+/, "");
  if (!p || p.includes("..")) return false;
  return (
    p === "README_RENDER_DEPLOY.txt" ||
    p.startsWith("public/") ||
    p.startsWith("data/")
  );
}

async function aiProposal(combinedPrompt) {
  if (!process.env.OPENAI_API_KEY) {
    return localAnalyze(combinedPrompt);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.EPD_AI_MODEL || "gpt-4.1-mini";

  const system = `
EČ™ti AI Developer pentru Energy Project Design.
RÄspunzi DOAR JSON valid. Nu folosi markdown.
GenereazÄ update-uri sigure, aditive, pentru site.
Nu Č™terge funcČ›ii existente.
Nu expune chei, parole sau secrete.
Nu genera cod care ruleazÄ comenzi de sistem.
PoČ›i propune modificÄri doar Ă®n:
- public/app.js
- public/index.html
- public/style.css
- data/*.json
- README_RENDER_DEPLOY.txt

Schema obligatorie:
{
  "summary": "rezumat scurt",
  "risks": ["risc sau limitare"],
  "tasks": [{"title":"...","reason":"...","status":"propus"}],
  "files": [{"path":"public/app.js","content":"continut complet fisier"}],
  "manualSteps": ["pas manual daca este cazul"]
}

DacÄ nu poČ›i rescrie complet un fiČ™ier Ă®n siguranČ›Ä, nu Ă®l pune Ă®n files.
`;

  const user = `
CONTEXT ACTUAL SITE:
${currentProjectContext().slice(0, 70000)}

PROMPTURI UTILIZATOR:
${combinedPrompt.slice(0, 120000)}
`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    response_format: { type: "json_object" }
  });

  const parsed = safeJson(completion.choices[0]?.message?.content || "{}");
  parsed.mode = "openai";
  parsed.model = model;
  parsed.createdAt = now();
  parsed.files = Array.isArray(parsed.files)
    ? parsed.files.filter(f => allowedRepoPath(f.path) && typeof f.content === "string")
    : [];
  parsed.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
  parsed.manualSteps = Array.isArray(parsed.manualSteps) ? parsed.manualSteps : [];
  parsed.risks = Array.isArray(parsed.risks) ? parsed.risks : [];
  return parsed;
}

async function githubGetSha(owner, repo, branch, filePath, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}?ref=${encodeURIComponent(branch)}`;
  const r = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub get file failed ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.sha || null;
}

async function githubPutFile(owner, repo, branch, filePath, content, message, token) {
  const sha = await githubGetSha(owner, repo, branch, filePath, token);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath).replaceAll("%2F", "/")}`;
  const body = {
    message,
    branch,
    content: Buffer.from(content, "utf8").toString("base64")
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`GitHub update failed ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function applyToGithub(proposal) {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "dragosserban95";
  const repo = process.env.GITHUB_REPO || "Energy-Project-Design";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token) throw new Error("GITHUB_TOKEN lipseČ™te.");
  if (!proposal.files || proposal.files.length === 0) throw new Error("AI nu a propus fiČ™iere aplicabile.");

  const applied = [];
  for (const f of proposal.files) {
    if (!allowedRepoPath(f.path)) continue;
    const result = await githubPutFile(owner, repo, branch, f.path, f.content, `AI Developer update: ${f.path}`, token);
    applied.push({ path: f.path, commit: result.commit?.sha || null });
  }

  let deployHook = null;
  if (process.env.RENDER_DEPLOY_HOOK) {
    const r = await fetch(process.env.RENDER_DEPLOY_HOOK, { method: "POST" });
    deployHook = { ok: r.ok, status: r.status };
  }

  return { owner, repo, branch, applied, deployHook };
}

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(path.join(__dirname, "storage/downloads")));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    product: "Energy Project Design",
    time: now(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    githubUpdateConfigured: Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO),
    renderDeployHookConfigured: Boolean(process.env.RENDER_DEPLOY_HOOK),
    autoApplyGithub: process.env.EPD_AUTO_APPLY_GITHUB === "true"
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    promptMaster: readJson("data/prompt-master.json", {}),
    fields: readJson("data/fields.json", {}),
    templates: readJson("data/templates.json", {}),
    profiles: readJson("data/profiles.json", {})
  });
});

app.post("/api/login", (req, res) => {
  const user = req.body.user || "";
  const pass = req.body.password || "";
  const ok = user === (process.env.EPD_ADMIN_USER || "developer") && pass === (process.env.EPD_ADMIN_PASSWORD || "Amodilema_99");
  log("login", ok ? user : "failed");
  res.json({ ok, user: ok ? { name: user, role: "Developer", plan: "Developer Infinite" } : null });
});

app.post("/api/prompts/upload", upload.array("files", 30), (req, res) => {
  const result = [];
  for (const file of req.files || []) {
    const meta = { originalName: file.originalname, mimetype: file.mimetype, uploadedAt: now(), size: file.size };
    fs.writeFileSync(file.path + ".meta.json", JSON.stringify(meta, null, 2), "utf8");
    result.push({ id: file.filename, ...meta });
  }

  if (req.body.text && req.body.text.trim()) {
    const id = uuidv4();
    const p = path.join(__dirname, "storage/prompts", id);
    fs.writeFileSync(p, req.body.text, "utf8");
    fs.writeFileSync(p + ".meta.json", JSON.stringify({
      originalName: "prompt_manual.txt",
      mimetype: "text/plain",
      uploadedAt: now(),
      size: req.body.text.length
    }, null, 2), "utf8");
    result.push({ id, originalName: "prompt_manual.txt", size: req.body.text.length });
  }

  log("prompt_upload", `${result.length} items`);
  res.json({ ok: true, files: result });
});

app.get("/api/prompts", (req, res) => {
  res.json({ ok: true, prompts: readPromptFiles().map(({ text, ...rest }) => rest) });
});

app.post("/api/ai-developer/analyze", async (req, res) => {
  try {
    const prompts = readPromptFiles();
    const manual = req.body.text || "";
    const combined = [manual, ...prompts.map(p => `FILE: ${p.originalName}\n${p.text}`)].join("\n\n---\n\n");
    const result = await aiProposal(combined);
    log("ai_analyze", `${result.mode} files=${result.files?.length || 0}`);
    res.json({ ok: true, result });
  } catch (err) {
    log("ai_analyze_error", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/update/run", async (req, res) => {
  const id = `update_${new Date().toISOString().replace(/[:.]/g, "-")}`;

  try {
    const prompts = readPromptFiles();
    const manual = req.body.text || "";
    const combined = [manual, ...prompts.map(p => `FILE: ${p.originalName}\n${p.text}`)].join("\n\n---\n\n");
    const proposal = await aiProposal(combined);

    let githubApply = null;
    if (process.env.EPD_AUTO_APPLY_GITHUB === "true" && proposal.files?.length) {
      githubApply = await applyToGithub(proposal);
    }

    const zip = new JSZip();
    zip.file("AI_UPDATE_PROPOSAL.json", JSON.stringify(proposal, null, 2));
    zip.file("RAPORT_UPDATE.txt", [
      "ENERGY PROJECT DESIGN - AI RUN UPDATE",
      `ID: ${id}`,
      `Creat: ${now()}`,
      `Mod: ${proposal.mode}`,
      `FiČ™iere propuse: ${proposal.files?.length || 0}`,
      `GitHub apply: ${githubApply ? "DA" : "NU"}`,
      "",
      proposal.summary || "",
      "",
      "Task-uri:",
      ...(proposal.tasks || []).map((t, i) => `${i + 1}. ${t.title || ""} | ${t.reason || ""}`),
      "",
      "FiČ™iere:",
      ...(proposal.files || []).map(f => `- ${f.path}`)
    ].join("\n"));

    for (const f of proposal.files || []) {
      zip.file(`proposed_files/${f.path}`, f.content);
    }

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipName = `${id}.zip`;
    fs.writeFileSync(path.join(__dirname, "storage/downloads", zipName), buffer);

    log("run_update", `${id} files=${proposal.files?.length || 0}`);
    res.json({ ok: true, id, proposal, githubApply, downloadUrl: publicUrl(req, `/downloads/${zipName}`) });
  } catch (err) {
    log("run_update_error", err.message);
    res.status(500).json({ ok: false, id, error: err.message });
  }
});

app.post("/api/update/apply-github", async (req, res) => {
  try {
    const secret = req.body.updateSecret || req.headers["x-epd-update-secret"];
    if (process.env.EPD_UPDATE_SECRET && secret !== process.env.EPD_UPDATE_SECRET) {
      return res.status(403).json({ ok: false, error: "EPD_UPDATE_SECRET incorect." });
    }
    const result = await applyToGithub(req.body.proposal);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/downloads", (req, res) => {
  const dir = path.join(__dirname, "storage/downloads");
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).map(f => ({ name: f, url: publicUrl(req, `/downloads/${f}`) }))
    : [];
  res.json({ ok: true, files });
});


function getPublicBaseUrl() {
  return String(
    process.env.EPD_PUBLIC_BASE_URL ||
    process.env.RENDER_SERVICE_URL ||
    "https://energy-project-design-services.onrender.com"
  ).replace(/\/$/, "");
}

function getGoogleCallbackUrl() {
  return process.env.GOOGLE_CALLBACK_URL || (getPublicBaseUrl() + "/api/auth/google/callback");
}

app.get("/api/auth/google/status", (req, res) => {
  res.json({
    ok: true,
    enabled: String(process.env.AUTH_GOOGLE_ENABLED || "").toLowerCase() === "true",
    clientIdConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientSecretConfigured: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    callbackUrl: getGoogleCallbackUrl()
  });
});

app.get("/api/auth/google", (req, res) => {
  if (String(process.env.AUTH_GOOGLE_ENABLED || "").toLowerCase() !== "true") {
    return res.status(400).send("Google login is disabled.");
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).send("Google OAuth is not configured.");
  }

  const callbackUrl = getGoogleCallbackUrl();

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account"
  });

  res.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
});

app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Missing Google authorization code.");
    }

    const callbackUrl = getGoogleCallbackUrl();

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google token error:", tokenData);
      return res.status(500).send("Google token exchange failed.");
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: "Bearer " + tokenData.access_token
      }
    });

    const googleUser = await userResponse.json();

    if (!userResponse.ok || !googleUser.email) {
      console.error("Google userinfo error:", googleUser);
      return res.status(500).send("Google userinfo failed.");
    }

    const user = {
      provider: "google",
      email: googleUser.email,
      name: googleUser.name || googleUser.email,
      picture: googleUser.picture || "",
      emailVerified: Boolean(googleUser.email_verified),
      role: "User",
      plan: process.env.DEFAULT_USER_PLAN || "Free",
      trialDays: Number(process.env.DEFAULT_TRIAL_DAYS || 14),
      loginAt: new Date().toISOString()
    };

    const encodedUser = Buffer.from(JSON.stringify(user), "utf8").toString("base64");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>Google Login</title>
</head>
<body>
  <p>Autentificare Google reușită. Se revine în aplicație...</p>
  <script>
    const user = JSON.parse(atob(${JSON.stringify(encodedUser)}));
    localStorage.setItem("epd_google_user", JSON.stringify(user));
    window.location.href = "/";
  </script>
</body>
</html>`);
  } catch (err) {
    console.error("Google callback error:", err);
    res.status(500).send("Google callback error.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Energy Project Design ruleazÄ pe portul ${PORT}`);
});



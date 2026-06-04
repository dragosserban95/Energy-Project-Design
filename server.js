import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

let OpenAI = null;
try {
  const mod = await import("openai");
  OpenAI = mod.default;
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const dirs = ["storage", "storage/prompts", "storage/updates", "storage/downloads", "storage/logs", "storage/projects"];
for (const d of dirs) fs.mkdirSync(path.join(__dirname, d), { recursive: true });

const upload = multer({ dest: path.join(__dirname, "storage/prompts") });

function readJson(rel, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, rel), "utf8"));
  } catch {
    return fallback;
  }
}
function writeJson(rel, data) {
  const p = path.join(__dirname, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
}
function now() {
  return new Date().toISOString();
}
function log(action, detail = "") {
  const line = `${now()} | ${action} | ${detail}\n`;
  fs.appendFileSync(path.join(__dirname, "storage/logs/server.log"), line, "utf8");
}
function publicUrl(req, rel) {
  const base = process.env.EPD_PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}${rel}`;
}
function readPromptFiles() {
  const dir = path.join(__dirname, "storage/prompts");
  const files = fs.readdirSync(dir).filter(f => !f.endsWith(".meta.json"));
  return files.map(file => {
    const p = path.join(dir, file);
    const metaPath = p + ".meta.json";
    const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, "utf8")) : {};
    let text = "";
    try { text = fs.readFileSync(p, "utf8"); } catch {}
    return { file, originalName: meta.originalName || file, size: text.length, uploadedAt: meta.uploadedAt, text };
  });
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
    ["domeniu", "Publicare domeniu/tunnel", "deployment"],
    ["gaze naturale", "Profil gaze naturale", "gas_profile"],
    ["branČ™amente", "Profil branČ™amente", "gas_branch"],
    ["osd", "Čabloane OSD", "osd_templates"],
    ["placeholder", "Template engine placeholders", "template_engine"],
    ["vgd", "VGD", "vgd"],
    ["rte", "RTE", "rte"],
    ["email", "Email SMTP-ready", "email"],
    ["semnÄtur", "Certificare/semnÄturÄ digitalÄ", "signature"]
  ];
  const tasks = [];
  for (const [kw, title, id] of checks) {
    if (lower.includes(kw)) tasks.push({ id, title, reason: `Detectat termen: ${kw}`, status: "propus" });
  }
  return {
    mode: "local",
    createdAt: now(),
    promptSize: text.length,
    tasks,
    summary: `Au fost detectate ${tasks.length} cerinČ›e relevante.`,
    nextSteps: [
      "VerificÄ task-urile propuse.",
      "RuleazÄ /api/update/run pentru generarea pachetului de update.",
      "AplicÄ manual sau automatizat pachetul dupÄ verificare."
    ]
  };
}

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/downloads", express.static(path.join(__dirname, "storage/downloads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, product: "EPD Site V3 Backend Ready", time: now(), openaiConfigured: Boolean(process.env.OPENAI_API_KEY) });
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
    fs.writeFileSync(p + ".meta.json", JSON.stringify({ originalName: "prompt_manual.txt", mimetype: "text/plain", uploadedAt: now(), size: req.body.text.length }, null, 2), "utf8");
    result.push({ id, originalName: "prompt_manual.txt", size: req.body.text.length });
  }
  log("prompt_upload", `${result.length} files`);
  res.json({ ok: true, files: result });
});

app.get("/api/prompts", (req, res) => {
  res.json({ ok: true, prompts: readPromptFiles().map(({ text, ...x }) => x) });
});

app.post("/api/ai-developer/analyze", async (req, res) => {
  const prompts = readPromptFiles();
  const manual = req.body.text || "";
  const promptMaster = JSON.stringify(readJson("data/prompt-master.json", {}), null, 2);
  const combined = [promptMaster, manual, ...prompts.map(p => `FILE: ${p.originalName}\n${p.text}`)].join("\n\n---\n\n");

  if (process.env.OPENAI_API_KEY && OpenAI) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.EPD_AI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: "EČ™ti AI Developer pentru EPD. AnalizeazÄ prompturile Č™i returneazÄ JSON cu summary, tasks, risks, updatePlan. Nu propune acČ›iuni destructive. Limba romĂ˘nÄ." },
          { role: "user", content: combined.slice(0, 120000) }
        ],
        response_format: { type: "json_object" }
      });
      const content = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      log("ai_analyze_openai", `${prompts.length} prompts`);
      return res.json({ ok: true, mode: "openai", result: parsed });
    } catch (err) {
      log("ai_analyze_openai_error", err.message);
      return res.json({ ok: false, mode: "openai_error", error: err.message, fallback: localAnalyze(combined) });
    }
  }

  const result = localAnalyze(combined);
  log("ai_analyze_local", `${prompts.length} prompts`);
  res.json({ ok: true, mode: "local", result });
});

app.post("/api/update/run", async (req, res) => {
  const prompts = readPromptFiles();
  const combined = prompts.map(p => `FILE: ${p.originalName}\n${p.text}`).join("\n\n---\n\n");
  const analysis = localAnalyze(combined);
  const id = `update_${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const updateDir = path.join(__dirname, "storage/updates", id);
  fs.mkdirSync(updateDir, { recursive: true });

  const manifest = {
    id,
    createdAt: now(),
    product: "EPD Site V3 Backend Ready",
    promptFiles: prompts.map(p => ({ file: p.file, originalName: p.originalName, size: p.size })),
    tasks: analysis.tasks.map(t => ({ ...t, status: "generated" })),
    note: "Pachet generat din prompturi. ĂŽn aceastÄ versiune nu ruleazÄ cod arbitrar; genereazÄ raport Č™i task-uri verificabile."
  };
  fs.writeFileSync(path.join(updateDir, "manifest.update.json"), JSON.stringify(manifest, null, 2), "utf8");
  fs.writeFileSync(path.join(updateDir, "RAPORT_UPDATE.txt"), [
    "EPD RUN UPDATE",
    `ID: ${id}`,
    `Creat: ${now()}`,
    `Prompturi: ${prompts.length}`,
    "",
    ...manifest.tasks.map((t, i) => `${i + 1}. ${t.title} | ${t.reason} | ${t.status}`)
  ].join("\n"), "utf8");

  const zip = new JSZip();
  zip.file("manifest.update.json", JSON.stringify(manifest, null, 2));
  zip.file("RAPORT_UPDATE.txt", fs.readFileSync(path.join(updateDir, "RAPORT_UPDATE.txt"), "utf8"));
  zip.file("PROMPT_MASTER.json", JSON.stringify(readJson("data/prompt-master.json", {}), null, 2));
  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const zipName = `${id}.zip`;
  fs.writeFileSync(path.join(__dirname, "storage/downloads", zipName), buffer);

  log("run_update", id);
  res.json({ ok: true, id, manifest, downloadUrl: publicUrl(req, `/downloads/${zipName}`) });
});

app.get("/api/downloads", (req, res) => {
  const dir = path.join(__dirname, "storage/downloads");
  const files = fs.readdirSync(dir).map(f => ({ name: f, url: publicUrl(req, `/downloads/${f}`) }));
  res.json({ ok: true, files });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`EPD Site V3 Backend Ready ruleaza pe portul ${PORT}`);
});


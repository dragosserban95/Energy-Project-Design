






// EPD_GOOGLE_OAUTH_FINAL_PATCH_BEGIN
function epdGoogleEnvReady() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
  );
}

app.get("/api/auth/google/status", (req, res) => {
  res.json({
    ok: true,
    googleConfigured: epdGoogleEnvReady(),
    clientIdConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientSecretConfigured: Boolean(process.env.GOOGLE_CLIENT_SECRET),
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || null,
    developerEmail: process.env.DEVELOPER_EMAIL || null
  });
});

app.get("/api/auth/google", (req, res) => {
  if (!epdGoogleEnvReady()) {
    return res.status(500).send(
      "Google OAuth nu este configurat. Verifica in Render: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL."
    );
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account"
  });

  return res.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params.toString());
});

app.get("/api/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Lipseste codul Google OAuth.");
    }

    if (!epdGoogleEnvReady()) {
      return res.status(500).send("Google OAuth nu este configurat pe server.");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(401).send(
        "Autentificarea Google a esuat: " + JSON.stringify(tokenData)
      );
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: "Bearer " + tokenData.access_token
      }
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      return res.status(401).send("Google nu a returnat emailul utilizatorului.");
    }

    const email = String(profile.email || "").toLowerCase();
    const developerEmail = String(process.env.DEVELOPER_EMAIL || "").toLowerCase();

    const role = email === developerEmail ? "Developer" : "User";
    const plan = role === "Developer" ? "Developer" : (process.env.DEFAULT_USER_PLAN || "Free");

    const safeUser = {
      ok: true,
      provider: "google",
      email: email,
      name: profile.name || email,
      picture: profile.picture || "",
      role: role,
      plan: plan,
      loginAt: new Date().toISOString()
    };

    const safeUserJson = JSON.stringify(JSON.stringify(safeUser));

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <title>Google Login - Energy Project Design</title>
</head>
<body>
  <p>Autentificare Google reusita. Revenire in aplicatie...</p>
  <script>
    localStorage.setItem("epd_google_user", ${safeUserJson});
    window.location.href = "/";
  </script>
</body>
</html>`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.status(500).send("Eroare Google OAuth: " + err.message);
  }
});
// EPD_GOOGLE_OAUTH_FINAL_PATCH_END


// ---- SAFE CHROME STORAGE FALLBACK ----
const safeChrome =
  typeof chrome !== "undefined" && chrome.storage
    ? chrome
    : {
        storage: {
          local: {
            get: (_, cb) => cb && cb({}),
            set: (_, cb) => cb && cb(),
            remove: (_, cb) => cb && cb(),
          },
        },
        tabs: { query: async () => [] },
        scripting: { executeScript: async () => {} },
      };

// ---- INIT ----
document.addEventListener("DOMContentLoaded", init);

function init() {
  setupAuthListeners();
  loadAuthState();
  setupCreateLotListeners();
}

// ---- HELPERS ----
function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  if (!status) return;
  status.textContent = message;
  status.style.background = isError ? "#ffebee" : "#e8f5e9";
  status.style.color = isError ? "#c62828" : "#2e7d32";
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), 3000);
}

function deriveSiteUrl(cloudUrl) {
  return cloudUrl.replace(/\.convex\.cloud$/, ".convex.site");
}

// ---- CONFIG (from config.js) ----
function getSettings() {
  const cfg =
    (typeof window !== "undefined" && window.LOT_SYNC_CONFIG) || {};
  const convexUrl = String(cfg.CONVEX_URL || "").trim().replace(/\/+$/, "");
  if (!convexUrl || !/^https:\/\/[^/]+\.convex\.cloud$/.test(convexUrl)) {
    return { convexUrl: "", convexSiteUrl: "" };
  }
  return { convexUrl, convexSiteUrl: deriveSiteUrl(convexUrl) };
}

// ---- CONVEX RPC ----
async function convexSignIn(siteUrl, email, password) {
  const res = await fetch(`${siteUrl}/api/auth/signIn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: "password",
      params: { email, password, flow: "signIn" },
      verifier: null,
      refreshToken: null,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Sign-in failed (${res.status})`);
  }
  return res.json();
}

async function convexRefresh(siteUrl, refreshToken) {
  const res = await fetch(`${siteUrl}/api/auth/signIn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  return res.json();
}

async function convexCall(kind, cloudUrl, path, args, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${cloudUrl}/api/${kind}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ path, args, format: "json" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status === "error") {
    throw new Error(data.errorMessage || `Convex ${kind} failed`);
  }
  return data.value;
}

// ---- AUTH MODULE ----
function setupAuthListeners() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const passwordInput = document.getElementById("authPassword");

  if (loginBtn) loginBtn.addEventListener("click", handleLogin);
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (passwordInput) {
    passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleLogin();
    });
  }
}

function loadAuthState() {
  safeChrome.storage.local.get(
    ["authAccessToken", "authDisplayName"],
    (result) => {
      if (result.authAccessToken && result.authDisplayName) {
        updateAuthUI(true, result.authDisplayName);
      } else {
        updateAuthUI(false, null);
      }
    },
  );
}

function updateAuthUI(isLoggedIn, displayName) {
  const loggedOut = document.getElementById("authLoggedOut");
  const loggedIn = document.getElementById("authLoggedIn");
  const nameDisplay = document.getElementById("authDisplayName");
  const createLotSection = document.getElementById("createLotSection");

  if (isLoggedIn) {
    if (loggedOut) loggedOut.style.display = "none";
    if (loggedIn) loggedIn.style.display = "block";
    if (nameDisplay) nameDisplay.textContent = displayName;
    if (createLotSection) createLotSection.style.display = "block";
  } else {
    if (loggedOut) loggedOut.style.display = "block";
    if (loggedIn) loggedIn.style.display = "none";
    if (nameDisplay) nameDisplay.textContent = "";
    if (createLotSection) createLotSection.style.display = "none";
  }
}

function extractTokens(signInResult) {
  const tokens = signInResult && signInResult.tokens;
  if (!tokens) return null;
  const accessToken = tokens.token || tokens.accessToken;
  const refreshToken = tokens.refreshToken;
  if (!accessToken) return null;
  return { accessToken, refreshToken: refreshToken || null };
}

async function handleLogin() {
  const usernameInput = document.getElementById("authUsername");
  const passwordInput = document.getElementById("authPassword");
  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showStatus("Please enter username and password", true);
    return;
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    showStatus(
      "Username must be 3-20 chars (letters, numbers, underscores)",
      true,
    );
    return;
  }

  const email = `${username.toLowerCase()}@lotsync.app`;

  const { convexUrl, convexSiteUrl } = await getSettings();
  if (!convexUrl) {
    showStatus("Configure Convex URL in settings first", true);
    return;
  }

  try {
    const signInResult = await convexSignIn(convexSiteUrl, email, password);
    const tokens = extractTokens(signInResult);
    if (!tokens) throw new Error("Unexpected sign-in response");

    // Look up display name via profiles:current
    let displayName = username;
    try {
      const me = await convexCall(
        "query",
        convexUrl,
        "profiles:current",
        {},
        tokens.accessToken,
      );
      if (me && me.displayName) displayName = me.displayName;
    } catch {
      // Not fatal — fall back to username.
    }

    safeChrome.storage.local.set(
      {
        authAccessToken: tokens.accessToken,
        authRefreshToken: tokens.refreshToken,
        authDisplayName: displayName,
      },
      () => {
        passwordInput.value = "";
        updateAuthUI(true, displayName);
        showStatus("Logged in!");
      },
    );
  } catch (err) {
    passwordInput.value = "";
    showStatus("Login error: " + err.message, true);
  }
}

function handleLogout() {
  safeChrome.storage.local.remove(
    ["authAccessToken", "authRefreshToken", "authDisplayName"],
    () => {
      updateAuthUI(false, null);
      showStatus("Logged out");
    },
  );
}

async function getValidToken() {
  const { convexSiteUrl } = await getSettings();
  return new Promise((resolve) => {
    safeChrome.storage.local.get(
      ["authAccessToken", "authRefreshToken"],
      async (result) => {
        if (!result.authAccessToken) {
          resolve(null);
          return;
        }
        // Try to refresh eagerly on each call if a refresh token is present.
        // Convex JWTs are short-lived; if the access token works, the call
        // succeeds and we never hit this path. If it fails, caller handles.
        resolve(result.authAccessToken);
        // Best-effort background refresh (non-blocking).
        if (result.authRefreshToken && convexSiteUrl) {
          try {
            const refreshed = await convexRefresh(
              convexSiteUrl,
              result.authRefreshToken,
            );
            const tokens = extractTokens(refreshed);
            if (tokens) {
              safeChrome.storage.local.set({
                authAccessToken: tokens.accessToken,
                authRefreshToken: tokens.refreshToken,
              });
            }
          } catch {
            // ignore — token may still be valid
          }
        }
      },
    );
  });
}

// ---- CREATE LOT MODULE ----
function setupCreateLotListeners() {
  const btn = document.getElementById("createLotBtn");
  if (btn) btn.addEventListener("click", handleCreateLot);
}

function showCreateLotStatus(message, isError = false) {
  const el = document.getElementById("createLotStatus");
  if (!el) return;
  el.textContent = message;
  el.style.background = isError ? "#ffebee" : "#e8f5e9";
  el.style.color = isError ? "#c62828" : "#2e7d32";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 5000);
}

async function handleCreateLot() {
  const btn = document.getElementById("createLotBtn");
  const originalText = btn ? btn.textContent : "";

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Scraping page...";
    }

    const token = await getValidToken();
    if (!token) {
      showCreateLotStatus("Not authenticated. Please log in.", true);
      return;
    }

    const { convexUrl } = await getSettings();
    if (!convexUrl) {
      showCreateLotStatus("Configure Convex URL in settings first", true);
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.url) {
      showCreateLotStatus("No active tab found", true);
      return;
    }

    if (!tab.url.includes("razorerp.com")) {
      showCreateLotStatus("Navigate to a Razor ERP page first", true);
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const header = document.querySelector("div.page-aside-header");
        const headerText = header ? header.textContent : "";

        const lotMatch = headerText.match(/Lot:\s*(\d+)/);
        let lotNumber = lotMatch ? lotMatch[1] : null;
        if (!lotNumber) {
          const urlParams = new URLSearchParams(window.location.search);
          lotNumber = urlParams.get("lotId") || null;
        }

        let contents = "UNKNOWN";
        const contentsMatch = headerText.match(/Lot:\s*\d+\s+(.+)/);
        if (contentsMatch) {
          contents = contentsMatch[1].trim();
        }

        let io = null;
        const auditForm = document.querySelector("form.form-horizontal.audit");
        if (auditForm) {
          const ioElement = auditForm.querySelector("div.col-sm-7");
          if (ioElement) {
            const ioText = ioElement.textContent.trim();
            io = ioText.replace(/^IO-/, "");
          }
        }

        return { lotNumber, contents, io };
      },
    });

    if (!results || !results[0] || !results[0].result) {
      showCreateLotStatus("Failed to scrape page data", true);
      return;
    }

    const { lotNumber, contents, io } = results[0].result;
    if (!lotNumber || !/^\d+$/.test(lotNumber)) {
      showCreateLotStatus("Could not find a valid lot number on page", true);
      return;
    }

    const sanitizedContents = (contents || "UNKNOWN").trim().slice(0, 500);

    if (btn) btn.textContent = "Saving lot...";

    const result = await convexCall(
      "mutation",
      convexUrl,
      "lots:createOrJoin",
      {
        lot_number: lotNumber,
        contents: sanitizedContents,
        io: io || null,
      },
      token,
    );

    if (result && result.isNewLot) {
      showCreateLotStatus(`Lot ${lotNumber} created & joined!`);
    } else {
      showCreateLotStatus(`Joined lot ${lotNumber}!`);
    }
  } catch (err) {
    showCreateLotStatus("Error: " + err.message, true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

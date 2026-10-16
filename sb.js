/* =====================================================================
   sb.js — «міст» між сайтом і базою Supabase (без сторонніх бібліотек).
   Гість (клієнт) може тільки ДОДАТИ заявку. Усе інше — тільки після входу адміна.
   Права доступу перевіряє сама база (setup.sql), а не цей файл.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.APP_CONFIG || {};
  const BASE = String(C.SUPABASE_URL || "").replace(/\/+$/, "");
  const KEY = String(C.SUPABASE_KEY || "");
  const SESSION_KEY = "sb_session_v1";

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; } },
    set(v) { try { v ? localStorage.setItem(SESSION_KEY, JSON.stringify(v)) : localStorage.removeItem(SESSION_KEY); } catch (e) {} }
  };
  let session = store.get();

  const configured = () => !!(BASE && KEY);
  const signedIn = () => !!(session && session.access_token);

  // Загальний запит. Ключ сайту завжди йде в apikey; токен адміна — в Authorization.
  async function call(path, { method = "GET", body, auth = false, headers = {} } = {}) {
    if (!configured()) throw new Error("NOT_CONFIGURED");
    const h = Object.assign({ apikey: KEY, "Content-Type": "application/json" }, headers);
    if (auth) {
      await freshToken();
      if (!signedIn()) throw new Error("AUTH");
      h.Authorization = "Bearer " + session.access_token;
    }
    const res = await fetch(BASE + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    if (res.status === 401 || res.status === 403) { if (auth) { setSession(null); throw new Error("AUTH"); } }
    if (!res.ok) {
      let msg = ""; try { msg = (await res.json()).message || ""; } catch (e) {}
      const err = new Error(msg || "HTTP " + res.status); err.status = res.status; throw err;
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  function setSession(data) {
    if (!data) { session = null; store.set(null); return; }
    session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
      email: (data.user && data.user.email) || (session && session.email) || ""
    };
    store.set(session);
  }

  // Токен живе ~1 годину — оновлюємо його автоматично
  async function freshToken() {
    if (!session) return;
    if (session.expires_at - 60 > Date.now() / 1000) return;
    try {
      const data = await call("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: session.refresh_token } });
      setSession(data);
    } catch (e) { setSession(null); }
  }

  window.SB = {
    configured,
    isSignedIn: signedIn,
    email: () => (session && session.email) || "",

    async signIn(email, password) {
      const data = await call("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password } });
      setSession(data);
    },
    signOut() { setSession(null); },

    // КЛІЄНТ: додати заявку (дозволено всім)
    async insertRequest(row) {
      await call("/rest/v1/requests", { method: "POST", body: row, headers: { Prefer: "return=minimal" } });
    },

    // АДМІН: тільки після входу
    listRequests() { return call("/rest/v1/requests?select=*&order=created_at.desc&limit=500", { auth: true }); },
    updateRequest(id, patch) {
      return call("/rest/v1/requests?id=eq." + encodeURIComponent(id), { method: "PATCH", body: patch, auth: true, headers: { Prefer: "return=minimal" } });
    },
    deleteRequest(id) {
      return call("/rest/v1/requests?id=eq." + encodeURIComponent(id), { method: "DELETE", auth: true, headers: { Prefer: "return=minimal" } });
    }
  };
})();

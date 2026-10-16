/* =====================================================================
   client.js — сторінка для клієнта (французькою):
   малює прайс, рахує орієнтовну суму, перевіряє форму і відправляє заявку.
   Структура:  1) допоміжні  2) прайс  3) перевірки  4) відправка  5) події
   ===================================================================== */
(function () {
  "use strict";
  const C = window.APP_CONFIG || {};
  const CAT = window.CATALOGUE;

  // ---------- 1. Допоміжні ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const round2 = (n) => Math.round(n * 100) / 100;
  const eur = (n) => round2(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const hrs = (h) => String(h).replace(".", ",") + " h";
  const price = (it) => round2(it.hours * CAT.rate);
  const val = (id) => ($("#" + id).value || "").trim();
  const nz = (s) => (s ? s : null);
  const allItems = () => CAT.categories.flatMap((c) => c.items);
  const uuid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });

  const sel = {};                 // вибрані послуги: id -> кількість
  const startedAt = Date.now();   // для захисту від роботів

  // Тексти з налаштувань
  $("#biz-name").textContent = C.BUSINESS_NAME || "";
  $("#priv-biz").textContent = C.BUSINESS_NAME || "";
  $("#priv-mail").textContent = C.CONTACT_EMAIL || "";
  $("#priv-ret").textContent = C.RETENTION || "12 mois";
  if (!window.SB.configured()) $("#setup-warning").hidden = false;

  // ---------- 2. Прайс ----------
  function presetSel(id) {
    const p = CAT.presets.find((x) => x.id === id);
    if (!p) return {};
    return Object.assign({}, p.extends ? presetSel(p.extends) : {}, p.items);
  }

  function renderPresets() {
    $("#presets").innerHTML = CAT.presets.map((p) => {
      const s = presetSel(p.id);
      const total = Object.keys(s).reduce((t, id) => { const it = allItems().find((x) => x.id === id); return t + (it && !it.monthly ? price(it) * s[id] : 0); }, 0);
      return `<button type="button" data-preset="${esc(p.id)}"><span>${esc(p.label)}</span><small>${eur(total)}</small></button>`;
    }).join("");
  }

  function renderCats() {
    $("#cats").innerHTML = CAT.categories.map((cat) => `
      <div class="cat">
        <h3>${esc(cat.title)}</h3>
        ${cat.note ? `<p class="note">${esc(cat.note)}</p>` : ""}
        ${cat.items.map((it) => {
          const on = !!sel[it.id];
          return `<div class="row ${on ? "on" : ""}" data-id="${esc(it.id)}">
            <input type="checkbox" id="chk-${esc(it.id)}" ${on ? "checked" : ""}>
            <label class="name" for="chk-${esc(it.id)}">${esc(it.label)}</label>
            <div class="meta"><b>${eur(price(it))}${it.monthly ? " / mois" : ""}</b><span>${hrs(it.hours)}${it.monthly ? " / mois" : ""}</span></div>
            ${it.qty ? `<div class="qty">Quantité <input type="number" min="1" max="20" step="1" value="${sel[it.id] || 1}"></div>` : ""}
          </div>`;
        }).join("")}
      </div>`).join("");
  }

  function compute() {
    let total = 0, monthly = 0; const lines = [];
    allItems().forEach((it) => {
      const q = sel[it.id]; if (!q) return;
      lines.push({ id: it.id, label: it.label, qty: q, hours: it.hours, unit_price: price(it), monthly: !!it.monthly });
      if (it.monthly) monthly += price(it) * q; else total += price(it) * q;
    });
    return { lines, total: round2(total), monthly: round2(monthly) };
  }

  function updateBar() {
    const c = compute();
    $("#t-total").textContent = eur(c.total);
    const parts = [];
    if (c.monthly) parts.push("+ " + eur(c.monthly) + " / mois");
    if (C.VAT_NOTE) parts.push(C.VAT_NOTE);
    $("#t-sub").textContent = parts.join(" · ");
  }

  // ---------- 3. Перевірки ----------
  function luhn(num) {
    let sum = 0;
    for (let i = 0; i < num.length; i++) {
      let d = +num[num.length - 1 - i];
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum % 10 === 0;
  }
  function siretOk(s) {
    if (!/^\d{14}$/.test(s)) return false;
    if (s.slice(0, 9) === "356000000") return s.split("").reduce((a, d) => a + +d, 0) % 5 === 0; // особливий випадок La Poste
    return luhn(s);
  }

  function collect() {
    const type = $("input[name=ctype]:checked").value;
    const hasSite = $("input[name=hassite]:checked").value === "oui";
    const c = compute();
    return {
      client_type: type,
      first_name: val("c-first"), last_name: val("c-last"), email: val("c-email"), phone: val("c-phone"), address: val("c-address"),
      company_name: type === "entreprise" ? val("e-company") : "",
      siret: type === "entreprise" ? val("e-siret").replace(/\s+/g, "") : "",
      vat_number: type === "entreprise" ? val("e-vat").replace(/\s+/g, "").toUpperCase() : "",
      has_site: hasSite, site_url: hasSite ? val("p-siteurl") : "",
      has_items: $$("input[name=has]:checked").map((i) => i.value),
      activity: val("p-activity"), budget: val("p-budget"), deadline: val("p-deadline"),
      inspiration: val("p-inspiration"), dislikes: val("p-dislikes"), message: val("p-message"),
      custom_wishes: $$("#wishes input").map((i) => i.value.trim()).filter(Boolean).map((s) => s.slice(0, 300)),
      items: c.lines, total_ht: c.total, monthly_total: c.monthly, rate: CAT.rate,
      consent: $("#consent").checked
    };
  }

  function validate(d) {
    const e = [];   // [текст помилки, id поля]
    if (!d.first_name) e.push(["Indiquez votre prénom.", "c-first"]);
    if (!d.last_name) e.push(["Indiquez votre nom.", "c-last"]);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.push(["Indiquez une adresse e-mail valide.", "c-email"]);
    if (d.phone && d.phone.replace(/\D/g, "").length < 9) e.push(["Le numéro de téléphone semble incomplet.", "c-phone"]);
    if (d.address.length < 5) e.push(["Indiquez votre adresse.", "c-address"]);
    if (d.client_type === "entreprise") {
      if (!d.company_name) e.push(["Indiquez le nom de votre entreprise.", "e-company"]);
      if (!siretOk(d.siret)) e.push(["Le numéro SIRET doit comporter 14 chiffres valides.", "e-siret"]);
      if (d.vat_number && !/^[A-Z]{2}[0-9A-Z]{2,12}$/.test(d.vat_number)) e.push(["Le numéro de TVA semble incorrect (ex. FR12345678901).", "e-vat"]);
    }
    if (d.has_site && d.site_url && !/^https?:\/\/.+\..+/i.test(d.site_url)) e.push(["L'adresse de votre site doit commencer par https://", "p-siteurl"]);
    if (!d.items.length && !d.custom_wishes.length) e.push(["Choisissez au moins une prestation ou décrivez un souhait.", "cats"]);
    if (!d.consent) e.push(["Merci d'accepter l'utilisation de vos données pour recevoir votre devis.", "consent"]);
    return e;
  }

  function showErrors(list) {
    const box = $("#errors");
    if (!list.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.innerHTML = "<strong>Merci de corriger :</strong><ul>" + list.map((x) => `<li>${esc(x[0])}</li>`).join("") + "</ul>";
    box.hidden = false;
    const target = $("#" + list[0][1]);
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    if (target && target.focus) target.focus({ preventScroll: true });
  }

  // ---------- 4. Відправка ----------
  function thanks(ref) {
    $("#ref").textContent = ref;
    $("#f").hidden = true; $("#bar").hidden = true; $("#thanks").hidden = false;
    window.scrollTo(0, 0);
  }

  async function submit(ev) {
    ev.preventDefault();
    const d = collect();
    const errs = validate(d);
    showErrors(errs);
    if (errs.length) return;

    const id = uuid();
    const ref = id.slice(0, 8).toUpperCase();

    // Захист від роботів: приховане поле заповнене або форму надіслано за 3 секунди
    if ($("#hp").value || Date.now() - startedAt < 3000) { thanks(ref); return; }

    const btn = $("#submit");
    btn.disabled = true; btn.textContent = "Envoi en cours…";
    try {
      await window.SB.insertRequest({
        id, client_type: d.client_type, first_name: d.first_name, last_name: d.last_name, email: d.email,
        phone: nz(d.phone), address: d.address,
        company_name: nz(d.company_name), siret: nz(d.siret), vat_number: nz(d.vat_number),
        has_site: d.has_site, site_url: nz(d.site_url), has_items: d.has_items,
        activity: nz(d.activity), budget: nz(d.budget), deadline: nz(d.deadline),
        inspiration: nz(d.inspiration), dislikes: nz(d.dislikes), message: nz(d.message),
        custom_wishes: d.custom_wishes, items: d.items,
        total_ht: d.total_ht, monthly_total: d.monthly_total, rate: d.rate,
        consent_at: new Date().toISOString()
      });
      thanks(ref);
    } catch (err) {
      console.error(err);
      const mail = C.CONTACT_EMAIL ? " Vous pouvez aussi m'écrire à " + C.CONTACT_EMAIL + "." : "";
      showErrors([["Impossible d'envoyer votre demande pour le moment. Vérifiez votre connexion et réessayez." + mail, "submit"]]);
      btn.disabled = false; btn.textContent = "Enregistrer ma demande";
    }
  }

  // ---------- 5. Події ----------
  function addWish(text) {
    const wrap = document.createElement("div");
    wrap.className = "wish";
    wrap.innerHTML = `<input maxlength="300" placeholder="Ex. : une page pour réserver en ligne" aria-label="Autre souhait"><button type="button" class="x" aria-label="Retirer cette ligne">×</button>`;
    $("input", wrap).value = text || "";
    $(".x", wrap).addEventListener("click", () => { wrap.remove(); if (!$$("#wishes .wish").length) addWish(); });
    $("#wishes").appendChild(wrap);
  }

  $("#add-wish").addEventListener("click", () => { if ($$("#wishes .wish").length < 10) { addWish(); $$("#wishes input").pop().focus(); } });

  $$("input[name=ctype]").forEach((r) => r.addEventListener("change", () => { $("#biz-fields").hidden = $("input[name=ctype]:checked").value !== "entreprise"; }));
  $$("input[name=hassite]").forEach((r) => r.addEventListener("change", () => { $("#p-siteurl").hidden = $("input[name=hassite]:checked").value !== "oui"; }));

  $("#presets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]"); if (!b) return;
    Object.keys(sel).forEach((k) => delete sel[k]);
    Object.assign(sel, presetSel(b.dataset.preset));
    renderCats(); updateBar();
  });
  $("#cats").addEventListener("change", (e) => {
    const row = e.target.closest(".row"); if (!row || e.target.type !== "checkbox") return;
    const id = row.dataset.id;
    if (e.target.checked) { const q = $(".qty input", row); sel[id] = q ? Math.min(20, Math.max(1, parseInt(q.value, 10) || 1)) : 1; } else delete sel[id];
    row.classList.toggle("on", e.target.checked); updateBar();
  });
  $("#cats").addEventListener("input", (e) => {
    const row = e.target.closest(".row"); if (!row || e.target.type !== "number") return;
    if (sel[row.dataset.id]) { sel[row.dataset.id] = Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 1)); updateBar(); }
  });
  $("#f").addEventListener("submit", submit);

  renderPresets(); renderCats(); addWish(); updateBar();
})();

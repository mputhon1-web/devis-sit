/* Логіка сайту. Дані зараз зберігаються в браузері (localStorage).
   Наступний крок: замінити функції store.* на запити до Supabase — решта коду не зміниться. */
(function () {
  "use strict";

  // ---------- Сховище (єдине місце, де торкаємось localStorage) ----------
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  const DEFAULT_SETTINGS = {
    name: "", siret: "", address: "", phone: "", email: "",
    validDays: 30, vat: "none",
    terms: "Acompte de 30 % à la commande, solde à la livraison du site. Paiement par virement."
  };

  const state = {
    cat: store.get("cat_v1", null) || JSON.parse(JSON.stringify(window.CATALOGUE)),
    settings: Object.assign({}, DEFAULT_SETTINGS, store.get("settings_v1", {})),
    sel: {},                       // id послуги -> кількість
    client: store.get("client_v1", { name: "", phone: "", email: "", address: "" })
  };

  // ---------- Допоміжні функції ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const round2 = (n) => Math.round(n * 100) / 100;
  const eur = (n) => round2(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const hrs = (h) => String(h).replace(".", ",") + " h";
  const price = (item) => round2(item.hours * state.cat.rate);
  const allItems = () => state.cat.categories.flatMap((c) => c.items);
  const saveCat = () => store.set("cat_v1", state.cat);
  const uid = () => "x" + Math.random().toString(36).slice(2, 8);

  // ---------- Підсумки ----------
  function compute() {
    let hours = 0, total = 0, monthHours = 0, monthTotal = 0;
    const lines = [];
    allItems().forEach((it) => {
      const qty = state.sel[it.id];
      if (!qty) return;
      const h = it.hours * qty, p = price(it) * qty;
      lines.push({ item: it, qty, hours: h, price: p });
      if (it.monthly) { monthHours += h; monthTotal += p; } else { hours += h; total += p; }
    });
    return { lines, hours, total: round2(total), monthHours, monthTotal: round2(monthTotal) };
  }

  function updateBar() {
    const c = compute();
    $("#t-hours").textContent = hrs(c.hours);
    $("#t-ht").textContent = eur(c.total) + (state.settings.vat === "20" ? " HT" : "");
    $("#t-month").textContent = c.monthTotal ? "+ " + eur(c.monthTotal) + " / mois" : "";
  }

  // ---------- Вкладка «Nouveau devis» ----------
  function renderPresets() {
    $("#presets").innerHTML = state.cat.presets.map((p) => {
      const sel = presetSelection(p.id);
      const h = Object.keys(sel).reduce((s, id) => {
        const it = allItems().find((x) => x.id === id);
        return s + (it && !it.monthly ? it.hours * sel[id] : 0);
      }, 0);
      return `<button data-preset="${esc(p.id)}"><span>${esc(p.label)}</span><small>${hrs(h)} · ${eur(h * state.cat.rate)}</small></button>`;
    }).join("");
  }

  function presetSelection(id) {
    const p = state.cat.presets.find((x) => x.id === id);
    if (!p) return {};
    const base = p.extends ? presetSelection(p.extends) : {};
    return Object.assign({}, base, p.items);
  }

  function renderCategories() {
    $("#categories").innerHTML = state.cat.categories.map((cat) => `
      <div class="card cat">
        <h3>${esc(cat.title)}</h3>
        ${cat.note ? `<p class="note">${esc(cat.note)}</p>` : ""}
        ${cat.items.map((it) => {
          const on = !!state.sel[it.id];
          return `<div class="row ${on ? "on" : ""}" data-id="${esc(it.id)}">
            <input type="checkbox" id="chk-${esc(it.id)}" ${on ? "checked" : ""}>
            <label class="name" for="chk-${esc(it.id)}">${esc(it.label)}</label>
            <div class="meta"><b>${eur(price(it))}${it.monthly ? " / mois" : ""}</b><span>${hrs(it.hours)}${it.monthly ? " / mois" : ""}</span></div>
            ${it.qty ? `<div class="qty">Quantité <input type="number" min="1" step="1" value="${state.sel[it.id] || 1}"></div>` : ""}
          </div>`;
        }).join("")}
      </div>`).join("");
  }

  function renderDevis() {
    $("#c-name").value = state.client.name;
    $("#c-phone").value = state.client.phone;
    $("#c-email").value = state.client.email;
    $("#c-address").value = state.client.address;
    renderPresets();
    renderCategories();
    updateBar();
  }

  // ---------- Вкладка «Catalogue» ----------
  function renderCatalogue() {
    $("#rate").value = state.cat.rate;
    $("#catalogue-editor").innerHTML = state.cat.categories.map((cat) => `
      <div class="card" data-cat="${esc(cat.id)}">
        <h3>${esc(cat.title)}</h3>
        ${cat.items.map((it) => `
          <div class="edit-row" data-id="${esc(it.id)}">
            <input class="e-label" value="${esc(it.label)}" aria-label="Nom de la prestation">
            <input class="e-hours" type="number" min="0" step="0.5" value="${it.hours}" aria-label="Durée en heures">
            <button class="del" title="Supprimer" aria-label="Supprimer">×</button>
            <div class="price">${eur(price(it))}${it.monthly ? " / mois" : ""} · ${it.hours} h${it.qty ? " · quantité possible" : ""}</div>
          </div>`).join("")}
        <div class="add-row">
          <input class="n-label" placeholder="Nouvelle prestation">
          <input class="n-hours h" type="number" min="0" step="0.5" placeholder="h">
          <button class="secondary n-add">Ajouter</button>
        </div>
      </div>`).join("");
  }

  // ---------- Вкладка «Réglages» ----------
  function renderSettings() {
    const s = state.settings;
    $("#s-name").value = s.name; $("#s-siret").value = s.siret; $("#s-address").value = s.address;
    $("#s-phone").value = s.phone; $("#s-email").value = s.email; $("#s-valid").value = s.validDays;
    $("#s-vat").value = s.vat; $("#s-terms").value = s.terms;
  }

  // ---------- Перегляд devis (документ) ----------
  function renderPaper() {
    const c = compute(), s = state.settings, cl = state.client;
    const d = new Date();
    const valid = new Date(d.getTime() + (Number(s.validDays) || 30) * 86400000);
    const fdate = (x) => x.toLocaleDateString("fr-FR");
    const num = "DEV-" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") + "-" + String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0");
    const vat20 = s.vat === "20";
    const vatAmount = vat20 ? round2(c.total * 0.2) : 0;
    const ttc = round2(c.total + vatAmount);
    const oneTime = c.lines.filter((l) => !l.item.monthly);
    const monthly = c.lines.filter((l) => l.item.monthly);
    const row = (l) => `<tr><td>${esc(l.item.label)}</td><td class="r">${l.qty}</td><td class="r hm">${hrs(l.hours)}</td><td class="r hm">${eur(price(l.item))}</td><td class="r">${eur(l.price)}</td></tr>`;
    const table = (rows, title) => rows.length ? `<table>
        <thead><tr><th>${title}</th><th class="r">Qté</th><th class="r hm">Durée</th><th class="r hm">Prix unitaire</th><th class="r">Total</th></tr></thead>
        <tbody>${rows.map(row).join("")}</tbody></table>` : "";
    const note = (id) => (state.cat.categories.find((x) => x.id === id) || {}).note;

    $("#paper").innerHTML = `
      <div class="head">
        <div><h2>DEVIS</h2><div>Création de site web</div></div>
        <div class="meta-box"><div><b>N° ${num}</b></div><div>Date : ${fdate(d)}</div><div>Valable jusqu'au ${fdate(valid)}</div></div>
      </div>
      <div class="parties">
        <div class="party"><h3>Prestataire</h3>
          <div><b>${esc(s.name) || "—"}</b></div>
          ${s.address ? `<div>${esc(s.address)}</div>` : ""}
          ${s.siret ? `<div>SIRET : ${esc(s.siret)}</div>` : ""}
          ${s.phone ? `<div>${esc(s.phone)}</div>` : ""}${s.email ? `<div>${esc(s.email)}</div>` : ""}
        </div>
        <div class="party"><h3>Client</h3>
          <div><b>${esc(cl.name) || "—"}</b></div>
          ${cl.address ? `<div>${esc(cl.address)}</div>` : ""}
          ${cl.phone ? `<div>${esc(cl.phone)}</div>` : ""}${cl.email ? `<div>${esc(cl.email)}</div>` : ""}
        </div>
      </div>
      ${c.lines.length ? "" : `<p class="small">Aucune prestation sélectionnée.</p>`}
      ${table(oneTime, "Prestations")}
      ${table(monthly, "Abonnement mensuel")}
      <div class="sum">
        <div><span>Total ${vat20 ? "HT" : ""}</span><span>${eur(c.total)}</span></div>
        ${vat20 ? `<div><span>TVA 20 %</span><span>${eur(vatAmount)}</span></div><div class="grand"><span>Total TTC</span><span>${eur(ttc)}</span></div>` : `<div class="grand"><span>Total à payer</span><span>${eur(c.total)}</span></div>`}
        ${c.monthTotal ? `<div><span>+ Maintenance</span><span>${eur(c.monthTotal)} / mois</span></div>` : ""}
      </div>
      ${vat20 ? "" : `<p class="small">TVA non applicable, art. 293 B du CGI.</p>`}
      <p class="small">${esc(note("mise_en_ligne") || "")}</p>
      ${state.sel.cart || state.sel.menu_online ? `<p class="small">${esc(note("commande") || "")}</p>` : ""}
      <p class="small">${esc(s.terms)}</p>
      <div class="sign"><div>Bon pour accord, date et signature du client</div><div>Signature du prestataire</div></div>`;
  }

  // ---------- Перемикання вкладок ----------
  function show(view) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
    $$(".topbar nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    document.body.classList.toggle("preview", view === "preview");
    if (view === "catalogue") renderCatalogue();
    if (view === "devis") renderDevis();
    if (view === "preview") renderPaper();
    window.scrollTo(0, 0);
  }

  // ---------- Події ----------
  $$(".topbar nav button").forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));
  $("#to-preview").addEventListener("click", () => show("preview"));
  $("#back").addEventListener("click", () => show("devis"));
  $("#print").addEventListener("click", () => window.print());

  // Дані клієнта
  [["c-name", "name"], ["c-phone", "phone"], ["c-email", "email"], ["c-address", "address"]].forEach(([id, key]) => {
    $("#" + id).addEventListener("input", (e) => { state.client[key] = e.target.value; store.set("client_v1", state.client); });
  });

  // Формули та вибір послуг
  $("#presets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-preset]");
    if (!b) return;
    state.sel = presetSelection(b.dataset.preset);
    renderCategories(); updateBar();
  });
  $("#clear-sel").addEventListener("click", () => { state.sel = {}; renderCategories(); updateBar(); });
  $("#categories").addEventListener("change", (e) => {
    const row = e.target.closest(".row");
    if (!row || e.target.type !== "checkbox") return;
    const id = row.dataset.id;
    if (e.target.checked) { const q = $(".qty input", row); state.sel[id] = q ? Math.max(1, parseInt(q.value, 10) || 1) : 1; }
    else delete state.sel[id];
    row.classList.toggle("on", e.target.checked);
    updateBar();
  });
  $("#categories").addEventListener("input", (e) => {
    const row = e.target.closest(".row");
    if (!row || e.target.type !== "number") return;
    if (state.sel[row.dataset.id]) { state.sel[row.dataset.id] = Math.max(1, parseInt(e.target.value, 10) || 1); updateBar(); }
  });

  // Редактор каталогу
  $("#rate").addEventListener("change", (e) => { state.cat.rate = Math.max(0, parseFloat(e.target.value) || 0); saveCat(); renderCatalogue(); });
  $("#catalogue-editor").addEventListener("change", (e) => {
    const row = e.target.closest(".edit-row");
    if (!row) return;
    const it = allItems().find((x) => x.id === row.dataset.id);
    if (!it) return;
    if (e.target.classList.contains("e-label")) it.label = e.target.value.trim() || it.label;
    if (e.target.classList.contains("e-hours")) it.hours = Math.max(0, parseFloat(e.target.value) || 0);
    saveCat(); renderCatalogue();
  });
  $("#catalogue-editor").addEventListener("click", (e) => {
    const card = e.target.closest("[data-cat]");
    if (!card) return;
    const cat = state.cat.categories.find((c) => c.id === card.dataset.cat);
    if (e.target.classList.contains("del")) {
      const id = e.target.closest(".edit-row").dataset.id;
      if (!confirm("Supprimer cette prestation ?")) return;
      cat.items = cat.items.filter((x) => x.id !== id);
      delete state.sel[id];
      saveCat(); renderCatalogue();
    }
    if (e.target.classList.contains("n-add")) {
      const label = $(".n-label", card).value.trim();
      const hours = parseFloat($(".n-hours", card).value);
      if (!label || !(hours >= 0)) { alert("Indiquez un nom et une durée en heures."); return; }
      cat.items.push({ id: uid(), label, hours });
      saveCat(); renderCatalogue();
    }
  });
  $("#reset-cat").addEventListener("click", () => {
    if (!confirm("Rétablir le catalogue d'origine ? Vos modifications seront perdues.")) return;
    store.remove("cat_v1");
    state.cat = JSON.parse(JSON.stringify(window.CATALOGUE));
    state.sel = {};
    renderCatalogue();
  });

  // Налаштування
  [["s-name", "name"], ["s-siret", "siret"], ["s-address", "address"], ["s-phone", "phone"], ["s-email", "email"], ["s-valid", "validDays"], ["s-vat", "vat"], ["s-terms", "terms"]].forEach(([id, key]) => {
    $("#" + id).addEventListener("input", (e) => { state.settings[key] = e.target.value; store.set("settings_v1", state.settings); updateBar(); });
  });

  // ---------- Старт ----------
  renderSettings();
  renderDevis();

  // Для автотестів
  window.__app = { state, compute, presetSelection };
})();

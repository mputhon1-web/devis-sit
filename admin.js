/* =====================================================================
   admin.js — твоя адмінка (українською).
   Список заявок -> відкрити заявку -> два «вікна»:
     1) Для devis (Indy): дані клієнта і рядки послуг, які копіюєш в Indy
     2) Промпт для Claude: готовий текст, який вставляєш у новий проєкт
   Структура:  1) допоміжні  2) тексти для копіювання  3) екрани  4) події
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const round2 = (n) => Math.round(n * 100) / 100;
  const eur = (n) => round2(+n || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  const num = (n) => String(round2(+n || 0)).replace(".", ",");
  const hrs = (h) => String(h).replace(".", ",") + " год";
  const when = (iso) => { try { return new Date(iso).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" }); } catch (e) { return iso; } };

  const STATUS = { nouvelle: "Нова", en_cours: "В роботі", terminee: "Готова" };
  const state = { rows: [], filter: "nouvelle", openId: null };

  // ---------- 1. Копіювання ----------
  function copyText(text, btn) {
    const done = () => { if (!btn) return; const old = btn.dataset.label || btn.textContent; btn.dataset.label = old; btn.textContent = "Скопійовано ✓"; setTimeout(() => { btn.textContent = old; }, 1600); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, () => fallback()); } else fallback();
    function fallback() {
      const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) { alert("Не вдалося скопіювати. Виділи текст вручну."); }
      t.remove();
    }
  }

  // ---------- 2. Тексти для копіювання ----------
  const fullName = (r) => r.first_name + " " + r.last_name;
  const typeFr = (r) => (r.client_type === "entreprise" ? "Entreprise / professionnel" : "Particulier");

  // Вікно 1а: дані клієнта (французькою — як у Indy)
  function clientText(r) {
    const L = [];
    L.push("Type : " + typeFr(r));
    if (r.client_type === "entreprise") {
      L.push("Raison sociale : " + (r.company_name || ""));
      L.push("SIRET : " + (r.siret || ""));
      if (r.vat_number) L.push("N° TVA : " + r.vat_number);
    }
    L.push("Prénom : " + r.first_name);
    L.push("Nom : " + r.last_name);
    L.push("Adresse : " + r.address);
    L.push("E-mail : " + r.email);
    if (r.phone) L.push("Téléphone : " + r.phone);
    return L.join("\n");
  }

  // Вікно 1б: рядки послуг
  function linesText(r) {
    const L = (r.items || []).map((it) => `${it.label} — ${it.qty} × ${eur(it.unit_price)} = ${eur(it.unit_price * it.qty)}${it.monthly ? " / mois" : ""}`);
    L.push("");
    L.push("Total : " + eur(r.total_ht) + (+r.monthly_total ? " + " + eur(r.monthly_total) + " / mois" : ""));
    return L.join("\n");
  }

  // Вікно 2: промпт для Claude (контакти приховані, поки не ввімкнеш галочку)
  function buildPrompt(r, withContacts) {
    const m = (r.address || "").match(/(\d{5})\s+(.+)$/);
    const place = withContacts ? r.address : (m ? m[0] : "(адресу приховано)");
    const name = withContacts ? fullName(r) : r.first_name + " " + (r.last_name || "").charAt(0) + ".";
    const items = r.items || [];
    const totalHours = items.filter((i) => !i.monthly).reduce((s, i) => s + i.hours * i.qty, 0);
    const L = [];
    L.push("Ти — мій помічник у веб-проєкті. Нижче повна інформація про нового клієнта з форми на моєму сайті. Прочитай усе уважно і виконай завдання в кінці.");
    L.push("");
    L.push("## Моя ситуація і правила");
    L.push("- Я початківець-фрілансер у Франції і роблю сайти разом із тобою.");
    L.push("- Беремо в роботу ТІЛЬКИ те, що реально зможемо зробити ми двоє. Якщо щось поза нашими можливостями або незрозуміле — прямо скажи, і ми цього клієнту не обіцяємо.");
    L.push("- Devis і facture я оформлюю в Indy. Французькі правила (фізособа / фірма та інші) перевіряй за офіційними джерелами, нічого не вигадуй.");
    L.push("- Мій тариф: " + num(r.rate) + " €/год; ціна послуги = години × тариф.");
    L.push("");
    L.push("## Клієнт");
    L.push("- Тип: " + (r.client_type === "entreprise" ? "фірма / професіонал" : "приватна особа"));
    L.push("- Ім'я: " + name);
    if (r.client_type === "entreprise" && withContacts) L.push("- Фірма: " + (r.company_name || "") + (r.siret ? ", SIRET " + r.siret : ""));
    L.push("- Місце: " + place);
    if (withContacts) { L.push("- E-mail: " + r.email); if (r.phone) L.push("- Телефон: " + r.phone); }
    L.push("- Діяльність: " + (r.activity || "не вказано"));
    L.push("");
    L.push("## Що в клієнта вже є / чого немає");
    L.push("- Сайт: " + (r.has_site ? "так" + (r.site_url ? " (" + r.site_url + ")" : "") : "ні"));
    const has = r.has_items || [];
    const all = ["Logo", "Charte graphique / couleurs", "Textes", "Photos", "Nom de domaine", "Hébergement"];
    L.push("- Вже має: " + (has.length ? has.join(", ") : "нічого з переліку"));
    L.push("- Не має: " + (all.filter((x) => has.indexOf(x) === -1).join(", ") || "—"));
    L.push("");
    L.push("## Бюджет і термін");
    L.push("- Бюджет клієнта: " + (r.budget || "не вказано"));
    L.push("- Бажаний термін: " + (r.deadline || "не вказано"));
    L.push("");
    L.push("## Вимоги й смаки");
    L.push("- Що подобається / приклади: " + (r.inspiration || "не вказано"));
    L.push("- Чого НЕ хоче: " + (r.dislikes || "не вказано"));
    L.push("- Коментар клієнта: " + (r.message || "немає"));
    L.push("");
    L.push("## Обрані послуги з мого прайсу");
    if (items.length) items.forEach((i) => L.push(`- ${i.label} — ${i.qty} × ${eur(i.unit_price)} (${hrs(i.hours * i.qty)})${i.monthly ? " щомісяця" : ""}`));
    else L.push("- нічого не обрано");
    L.push("- Разом разово: " + eur(r.total_ht) + " (" + hrs(totalHours) + ")" + (+r.monthly_total ? "; щомісяця: " + eur(r.monthly_total) : ""));
    L.push("");
    L.push("## Додаткові побажання (яких немає в моєму прайсі)");
    const w = r.custom_wishes || [];
    if (w.length) w.forEach((x, i) => L.push((i + 1) + ". " + x)); else L.push("- немає");
    if (r.note) { L.push(""); L.push("## Мої нотатки"); L.push(r.note); }
    L.push("");
    L.push("## Завдання для тебе");
    L.push("1. Простими словами підсумуй: хто цей клієнт і що йому насправді потрібно.");
    L.push("2. Склади список уточнювальних питань до клієнта (чого не вистачає для точної оцінки).");
    L.push("3. Для кожного додаткового побажання скажи: можемо зробити — так / ні / під питанням; орієнтовні години; ризики. Те, що ми не вміємо, познач і не бери.");
    L.push("4. Оціни, чи вистачає бюджету клієнта на обраний обсяг, і запропонуй 2–3 варіанти (мінімальний, оптимальний, розширений).");
    L.push("5. Вкажи, на що звернути увагу за французькими правилами для цього типу клієнта (з посиланнями на офіційні джерела).");
    L.push("6. Запропонуй план робіт по етапах і проєкт короткої відповіді клієнту французькою.");
    return L.join("\n");
  }

  // ---------- 3. Екрани ----------
  function counts() { const c = { nouvelle: 0, en_cours: 0, terminee: 0 }; state.rows.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; }); return c; }

  function renderTabs() {
    const c = counts();
    const tabs = [["nouvelle", "Нові"], ["en_cours", "В роботі"], ["terminee", "Готові"], ["all", "Усі"]];
    $("#tabs").innerHTML = tabs.map(([k, label]) =>
      `<button type="button" data-f="${k}" class="${state.filter === k ? "active" : ""}">${label}${k === "all" ? ` <span>${state.rows.length}</span>` : ` <span>${c[k] || 0}</span>`}</button>`).join("");
  }

  function renderList() {
    renderTabs();
    const rows = state.rows.filter((r) => state.filter === "all" || r.status === state.filter);
    if (!rows.length) { $("#list").innerHTML = `<div class="card empty">Тут поки порожньо.</div>`; return; }
    $("#list").innerHTML = rows.map((r) => `
      <button type="button" class="req" data-id="${esc(r.id)}">
        <div class="req-top"><strong>${esc(fullName(r))}${r.company_name ? " · " + esc(r.company_name) : ""}</strong>
          <span class="chip s-${esc(r.status)}">${STATUS[r.status] || esc(r.status)}</span></div>
        <div class="req-sub">${r.client_type === "entreprise" ? "Фірма" : "Фізособа"} · ${esc(when(r.created_at))} · ${eur(r.total_ht)}${(r.custom_wishes || []).length ? ` · <b>+${r.custom_wishes.length} побажань</b>` : ""}</div>
        <div class="req-sub">${esc(r.budget || "бюджет не вказано")} · ${esc(r.deadline || "термін не вказано")}</div>
      </button>`).join("");
  }

  const kv = (k, v) => (v ? `<div class="kv"><span>${k}</span><b>${esc(v)}</b></div>` : "");

  function renderDetail() {
    const r = state.rows.find((x) => x.id === state.openId);
    if (!r) { showList(); return; }
    const items = r.items || [];
    const wishes = r.custom_wishes || [];
    const lines = items.map((i, idx) => `
      <tr><td class="cp" data-copy="${esc(i.label)}" title="Натисни, щоб скопіювати">${esc(i.label)}</td>
          <td class="cp r" data-copy="${esc(i.qty)}">${esc(i.qty)}</td>
          <td class="cp r" data-copy="${esc(num(i.unit_price))}">${eur(i.unit_price)}</td>
          <td class="r">${eur(i.unit_price * i.qty)}</td></tr>`).join("");

    $("#detail").innerHTML = `
      <button type="button" class="link" id="back">← Усі заявки</button>
      <div class="card head">
        <div><h2>${esc(fullName(r))}${r.company_name ? " · " + esc(r.company_name) : ""}</h2>
          <p class="hint">Реф. ${esc(r.id.slice(0, 8).toUpperCase())} · ${esc(when(r.created_at))} · ${r.client_type === "entreprise" ? "Фірма" : "Фізособа"}</p></div>
        <label class="inline">Статус
          <select id="status">${Object.keys(STATUS).map((k) => `<option value="${k}" ${r.status === k ? "selected" : ""}>${STATUS[k]}</option>`).join("")}</select>
        </label>
      </div>

      <div class="card">
        <h3>Коротко про заявку</h3>
        ${kv("Діяльність", r.activity)}${kv("Бюджет", r.budget)}${kv("Термін", r.deadline)}
        ${kv("Є сайт", r.has_site ? "так" + (r.site_url ? " – " + r.site_url : "") : "ні")}
        ${kv("Вже має", (r.has_items || []).join(", "))}
        ${kv("Подобається", r.inspiration)}${kv("НЕ хоче", r.dislikes)}${kv("Коментар", r.message)}
        ${wishes.length ? `<div class="kv wish"><span>Додаткові побажання (немає в прайсі)</span><ol>${wishes.map((w) => `<li>${esc(w)}</li>`).join("")}</ol></div>` : ""}
      </div>

      <div class="wins">
        <div class="card win">
          <h3>📄 Для devis (Indy)</h3>
          <p class="hint">Натисни на клітинку, щоб скопіювати її, або скопіюй усе кнопкою.</p>
          <pre class="box" id="client-box">${esc(clientText(r))}</pre>
          <button type="button" class="primary small" id="cp-client">Копіювати дані клієнта</button>
          <div class="tbl-wrap"><table class="lines">
            <thead><tr><th>Послуга</th><th class="r">К-сть</th><th class="r">Ціна</th><th class="r">Разом</th></tr></thead>
            <tbody>${lines || `<tr><td colspan="4">Нічого не обрано</td></tr>`}</tbody>
            <tfoot><tr><td colspan="3">Разом</td><td class="r"><b>${eur(r.total_ht)}</b></td></tr>
              ${+r.monthly_total ? `<tr><td colspan="3">+ щомісяця</td><td class="r">${eur(r.monthly_total)}</td></tr>` : ""}</tfoot>
          </table></div>
          <button type="button" class="primary small" id="cp-lines">Копіювати всі рядки</button>
          ${wishes.length ? `<p class="hint warn-t">Додаткові побажання не входять у суму: ціну для них треба визначити окремо.</p>` : ""}
        </div>

        <div class="card win">
          <h3>🤖 Промпт для Claude</h3>
          <p class="hint">Вставиш цей текст у новий проєкт — і Claude розбере клієнта, бюджет і побажання.</p>
          <label class="inline check"><input type="checkbox" id="with-contacts"> Додати контакти клієнта (e-mail, телефон, адреса)</label>
          <textarea id="prompt-box" class="box mono" rows="16" readonly></textarea>
          <button type="button" class="primary small" id="cp-prompt">Копіювати промпт</button>
        </div>
      </div>

      <div class="card">
        <h3>Мої нотатки</h3>
        <textarea id="note" rows="3" maxlength="4000" placeholder="Нотатки про клієнта…">${esc(r.note || "")}</textarea>
        <p class="hint" id="note-state"></p>
      </div>
      <button type="button" class="link danger" id="del">Видалити заявку</button>`;

    const setPrompt = () => { $("#prompt-box").value = buildPrompt(r, $("#with-contacts").checked); };
    setPrompt();
    $("#with-contacts").addEventListener("change", setPrompt);
    $("#cp-client").addEventListener("click", (e) => copyText(clientText(r), e.currentTarget));
    $("#cp-lines").addEventListener("click", (e) => copyText(linesText(r), e.currentTarget));
    $("#cp-prompt").addEventListener("click", (e) => copyText($("#prompt-box").value, e.currentTarget));
    $$(".cp", $("#detail")).forEach((td) => td.addEventListener("click", () => { copyText(td.dataset.copy, null); td.classList.add("copied"); setTimeout(() => td.classList.remove("copied"), 700); }));
    $("#back").addEventListener("click", showList);

    $("#status").addEventListener("change", async (e) => {
      try { await SB.updateRequest(r.id, { status: e.target.value }); r.status = e.target.value; }
      catch (err) { handleErr(err); e.target.value = r.status; }
    });
    $("#note").addEventListener("blur", async (e) => {
      if (e.target.value === (r.note || "")) return;
      $("#note-state").textContent = "Зберігаю…";
      try { await SB.updateRequest(r.id, { note: e.target.value }); r.note = e.target.value; $("#note-state").textContent = "Збережено ✓"; setPrompt(); }
      catch (err) { $("#note-state").textContent = "Не вдалося зберегти"; handleErr(err); }
    });
    $("#del").addEventListener("click", async () => {
      if (!confirm("Видалити цю заявку назавжди?")) return;
      try { await SB.deleteRequest(r.id); state.rows = state.rows.filter((x) => x.id !== r.id); showList(); } catch (err) { handleErr(err); }
    });
  }

  function showList() { state.openId = null; $("#detail").hidden = true; $("#list").hidden = false; $("#tabs").hidden = false; renderList(); window.scrollTo(0, 0); }
  function showDetail(id) { state.openId = id; $("#list").hidden = true; $("#tabs").hidden = true; $("#detail").hidden = false; renderDetail(); window.scrollTo(0, 0); }

  function showLogin(msg) {
    $("#login").hidden = false; $("#app").hidden = true; $("#top-actions").hidden = true;
    const e = $("#l-err"); e.hidden = !msg; e.textContent = msg || "";
  }
  function handleErr(err) {
    if (err && err.message === "AUTH") { showLogin("Сесія завершилась. Увійди ще раз."); return; }
    alert("Помилка: " + (err && err.message ? err.message : err));
  }

  async function load() {
    $("#login").hidden = true; $("#app").hidden = false; $("#top-actions").hidden = false;
    $("#who").textContent = SB.email();
    try { state.rows = (await SB.listRequests()) || []; }
    catch (err) { if (err.message === "AUTH") return showLogin("Сесія завершилась. Увійди ще раз."); $("#list").innerHTML = `<div class="notice err">Не вдалося завантажити заявки: ${esc(err.message)}</div>`; return; }
    if (state.openId && state.rows.some((r) => r.id === state.openId)) renderDetail(); else showList();
  }

  // ---------- 4. Події ----------
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#l-btn"); btn.disabled = true; btn.textContent = "Входжу…";
    try { await SB.signIn($("#l-email").value.trim(), $("#l-pass").value); $("#l-pass").value = ""; await load(); }
    catch (err) { showLogin(err.message === "NOT_CONFIGURED" ? "Supabase не налаштовано (config.js)." : "Невірний e-mail або пароль."); }
    btn.disabled = false; btn.textContent = "Увійти";
  });
  $("#logout").addEventListener("click", () => { SB.signOut(); state.rows = []; showLogin(""); });
  $("#refresh").addEventListener("click", load);
  $("#tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (!b) return; state.filter = b.dataset.f; renderList(); });
  $("#list").addEventListener("click", (e) => { const b = e.target.closest(".req"); if (b) showDetail(b.dataset.id); });

  if (!SB.configured()) $("#setup-warning").hidden = false;
  if (SB.isSignedIn()) load(); else showLogin("");
})();

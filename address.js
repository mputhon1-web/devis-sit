/* =====================================================================
   address.js — підказки адреси під полем «Адреса клієнта».
   Використовує безкоштовний державний сервіс Франції «Géocodage» (IGN, колишній API Adresse)
   (data.geopf.fr): ключ не потрібен, реєстрація не потрібна.
   Людина друкує адресу — під полем з'являється список, вона торкається
   потрібного рядка, і адреса вставляється в поле.
   Підключається до поля #c-address; інші поля можна додати атрибутом data-address="1".
   ===================================================================== */
(function () {
  "use strict";

  const URL = "https://data.geopf.fr/geocodage/search/"; // новий державний сервіс (IGN), наступник api-adresse.data.gouv.fr
  const MIN_CHARS = 3;     // з якої довжини починати шукати
  const DELAY = 300;       // пауза (мс) після останньої літери, щоб не слати зайвих запитів
  const MAX = 5;           // скільки підказок показувати

  // Невеликі стилі додаємо прямо звідси, щоб не чіпати style.css
  const css = document.createElement("style");
  css.textContent =
    ".addr-wrap{position:relative}" +
    ".addr-list{position:absolute;left:0;right:0;top:100%;z-index:30;margin:4px 0 0;padding:4px;list-style:none;" +
    "background:#fff;border:1px solid #e3e6ec;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.12)}" +
    ".addr-list li{padding:11px 12px;border-radius:8px;cursor:pointer;font-size:15px;line-height:1.3;color:#1d2433}" +
    ".addr-list li small{display:block;color:#667085;font-size:12px}" +
    ".addr-list li:hover,.addr-list li.on{background:#eef3ff}";
  document.head.appendChild(css);

  function attach(input) {
    // обгортка потрібна, щоб список з'являвся точно під полем
    const wrap = document.createElement("div");
    wrap.className = "addr-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const list = document.createElement("ul");
    list.className = "addr-list";
    list.hidden = true;
    wrap.appendChild(list);
    input.setAttribute("autocomplete", "off");

    let timer = null, ctrl = null, items = [], active = -1;

    const close = () => { list.hidden = true; list.innerHTML = ""; items = []; active = -1; };

    function choose(i) {
      if (!items[i]) return;
      input.value = items[i];
      // повідомляємо app.js, що значення змінилось (щоб воно збереглось)
      input.dispatchEvent(new Event("input", { bubbles: true }));
      close();
    }

    function show(features) {
      items = features.map((f) => f.properties.label);
      list.innerHTML = "";
      features.forEach((f, i) => {
        const li = document.createElement("li");
        li.textContent = f.properties.name || f.properties.label;
        const small = document.createElement("small");
        small.textContent = ((f.properties.postcode || "") + " " + (f.properties.city || "")).trim();
        li.appendChild(small);
        // mousedown, а не click: спрацьовує до того, як поле втратить фокус
        li.addEventListener("mousedown", (e) => { e.preventDefault(); choose(i); });
        li.addEventListener("touchstart", (e) => { e.preventDefault(); choose(i); }, { passive: false });
        list.appendChild(li);
      });
      list.hidden = !features.length;
      active = -1;
    }

    async function search(q) {
      if (ctrl) ctrl.abort();
      ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      try {
        const res = await fetch(URL + "?q=" + encodeURIComponent(q) + "&limit=" + MAX + "&autocomplete=1",
          ctrl ? { signal: ctrl.signal } : undefined);
        if (!res.ok) return close();
        const data = await res.json();
        show((data && data.features) || []);
      } catch (e) { if (!e || e.name !== "AbortError") close(); } // немає інтернету — просто без підказок
    }

    input.addEventListener("input", () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < MIN_CHARS) return close();
      timer = setTimeout(() => search(q), DELAY);
    });
    input.addEventListener("keydown", (e) => 

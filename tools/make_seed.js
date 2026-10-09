// Генерує supabase/seed.sql із catalogue.js:  node tools/make_seed.js
const fs = require("fs");
const path = require("path");
global.window = {};
require(path.join(__dirname, "..", "catalogue.js"));
const C = window.CATALOGUE;
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";

let sql = "-- Згенеровано з catalogue.js. Виконати після schema.sql\n";
sql += `insert into settings (key, value) values ('rate', '${C.rate}') on conflict (key) do update set value = excluded.value;\n\n`;
C.categories.forEach((cat, ci) => {
  sql += `insert into categories (id, title, note, position) values (${q(cat.id)}, ${q(cat.title)}, ${cat.note ? q(cat.note) : "null"}, ${ci})\n  on conflict (id) do update set title = excluded.title, note = excluded.note, position = excluded.position;\n`;
});
sql += "\n";
C.categories.forEach((cat) => {
  cat.items.forEach((it, i) => {
    sql += `insert into services (id, category_id, label, hours, qty_allowed, monthly, position) values (${q(it.id)}, ${q(cat.id)}, ${q(it.label)}, ${it.hours}, ${!!it.qty}, ${!!it.monthly}, ${i})\n  on conflict (id) do update set label = excluded.label, hours = excluded.hours, qty_allowed = excluded.qty_allowed, monthly = excluded.monthly, position = excluded.position;\n`;
  });
});
fs.mkdirSync(path.join(__dirname, "..", "supabase"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "..", "supabase", "seed.sql"), sql);
console.log("seed.sql: " + C.categories.reduce((n, c) => n + c.items.length, 0) + " services");

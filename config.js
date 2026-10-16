/* =====================================================================
   config.js — єдине місце з налаштуваннями сайту.
   УВАГА: сюди вставляються тільки ПУБЛІЧНІ ключі (Project URL і publishable/anon key).
   Ключ з назвою «secret» або «service_role» сюди НІКОЛИ не вставляй!
   ===================================================================== */
window.APP_CONFIG = {
  // Supabase: Project Settings -> API
  SUPABASE_URL: "",   // наприклад "https://abcdxyz.supabase.co"
  SUPABASE_KEY: "",   // «publishable key» (sb_publishable_...) або «anon key»

  // Дані, які бачить клієнт на сайті (французькою)
  BUSINESS_NAME: "Votre nom ou entreprise",
  CONTACT_EMAIL: "contact@exemple.fr",
  VAT_NOTE: "TVA non applicable, art. 293 B du CGI",   // можна залишити "" , якщо не потрібно
  RETENTION: "12 mois"                                  // скільки зберігаєш дані клієнта
};

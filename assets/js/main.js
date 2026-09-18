/* ==========================================================================
   LoveToLive.com — core site behaviour (no dependencies)
   ========================================================================== */
(function () {
  "use strict";
  const CFG = window.LTL_CONFIG || {};
  const ROOT = document.body.dataset.root || "";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k, d = null) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  window.LTL = { $, $$, store, CFG, ROOT };

  /* ---------- Theme ---------- */
  const savedTheme = store.get("ltl-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next; store.set("ltl-theme", next);
  }));

  /* ---------- Mobile nav ---------- */
  const mt = $("[data-menu-toggle]"), mn = $("#mobile-nav");
  if (mt && mn) mt.addEventListener("click", () => {
    const open = mn.classList.toggle("open"); mt.setAttribute("aria-expanded", open);
  });

  /* ---------- Toast ---------- */
  const toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status");
  document.body.appendChild(toastEl);
  window.LTL.toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add("show"); clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 3200); };

  /* ---------- UTM / attribution capture ---------- */
  const qs = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "gclid"].forEach((k) => { if (qs.get(k)) store.sset(k, qs.get(k)); });
  if (!store.sget("landing")) store.sset("landing", location.pathname);

  /* ---------- Consent + AdSense + GA4 ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); } window.gtag = window.gtag || gtag;
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 });

  function loadScript(src, attrs = {}) {
    const s = document.createElement("script"); s.async = true; s.src = src;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v)); document.head.appendChild(s); return s;
  }
  function applyConsent(level) {
    const granted = level === "all" ? "granted" : "denied";
    gtag("consent", "update", { ad_storage: granted, ad_user_data: granted, ad_personalization: granted, analytics_storage: granted });
    if (CFG.ga4) { loadScript("https://www.googletagmanager.com/gtag/js?id=" + CFG.ga4); gtag("js", new Date()); gtag("config", CFG.ga4, { anonymize_ip: true }); }
    initAds(level);
  }
  function initAds(level) {
    const client = CFG.adsense && CFG.adsense.client;
    const slots = $$(".ad-slot");
    slots.forEach((slot) => {
      const type = slot.dataset.slot || "inContent";
      const id = client && CFG.adsense.slots && CFG.adsense.slots[type];
      if (id) {
        const fmt = type === "multiplex" ? "autorelaxed" : "auto";
        slot.innerHTML = '<div class="ad-label">Advertisement</div><ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="' + client +
          '" data-ad-slot="' + id + '" data-ad-format="' + fmt + '" data-full-width-responsive="true"></ins>';
      } else if (!slot.dataset.filled) {
        slot.innerHTML = '<a class="ad-placeholder" href="' + ROOT + 'advertise.html"><span><span class="sponsored-tag">Ad space</span><br>Reach people planning their next move — <u>advertise here</u></span></a>';
      }
      slot.dataset.filled = "1";
    });
    if (client) {
      window.adsbygoogle = window.adsbygoogle || [];
      if (level !== "all") window.adsbygoogle.requestNonPersonalizedAds = 1;
      loadScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client, { crossorigin: "anonymous" });
      $$("ins.adsbygoogle").forEach(() => { try { window.adsbygoogle.push({}); } catch (e) {} });
      if (CFG.adsense.autoAds) window.adsbygoogle.push({ google_ad_client: client, enable_page_level_ads: true });
    }
  }
  const cookie = $("#cookie");
  const consent = store.get("ltl-consent");
  if (consent) applyConsent(consent);
  else { initAds("essential"); if (cookie) setTimeout(() => cookie.classList.add("show"), 900); }
  $$("[data-consent]").forEach((b) => b.addEventListener("click", () => {
    const lvl = b.dataset.consent; store.set("ltl-consent", lvl); cookie && cookie.classList.remove("show");
    $$(".ad-slot").forEach((s) => delete s.dataset.filled); applyConsent(lvl);
  }));

  /* ---------- Config-driven links (donations, social, YouTube) ---------- */
  $$("[data-donate]").forEach((a) => {
    const url = CFG.donate && CFG.donate[a.dataset.donate];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; } else if (a.hasAttribute("data-hide-empty")) a.hidden = true;
  });
  $$("[data-social]").forEach((a) => {
    const url = CFG.social && CFG.social[a.dataset.social];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener me"; } else a.hidden = true;
  });
  $$("[data-yt-channel]").forEach((a) => {
    const yt = CFG.youtube || {};
    const url = yt.channelId ? "https://www.youtube.com/channel/" + yt.channelId + "?sub_confirmation=1" : yt.channelUrl;
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---------- YouTube: privacy-friendly lite embeds ---------- */
  const PLAY = '<span class="play"><svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>';
  window.LTL.videoCard = (id, title, query) => {
    if (id) return '<button class="yt" data-yt="' + id + '" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)" aria-label="Play: ' + title + '">' + PLAY + '<span class="yt-title">' + title + '</span></button>';
    const q = encodeURIComponent(query || title);
    return '<a class="yt" href="https://www.youtube.com/results?search_query=' + q + '" target="_blank" rel="noopener" style="background-image:linear-gradient(135deg,#1c1917,#44403c)" aria-label="Watch on YouTube: ' + title + '">' + PLAY + '<span class="yt-title">' + title + ' ↗</span></a>';
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("button.yt[data-yt]"); if (!b) return;
    b.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0" title="' + (b.getAttribute("aria-label") || "Video") +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    if (window.gtag) gtag("event", "video_play", { video_id: b.dataset.yt });
  });
  $$("[data-featured-videos]").forEach((wrap) => {
    const yt = CFG.youtube || {}; const vids = (yt.featured || []).filter((v) => v.id);
    const fallback = JSON.parse(wrap.dataset.featuredVideos || "[]");
    const list = vids.length ? vids : fallback;
    wrap.innerHTML = list.map((v) => '<article class="card video-card">' + window.LTL.videoCard(v.id, v.title, v.q) +
      '<div class="city-body"><h3 style="font-size:1.05rem;margin:0">' + v.title + '</h3>' + (v.meta ? '<p class="small muted" style="margin:6px 0 0">' + v.meta + '</p>' : '') + '</div></article>').join("");
  });
  $$("[data-city-video]").forEach((el) => {
    const slug = el.dataset.cityVideo; const id = CFG.youtube && CFG.youtube.cityVideos && CFG.youtube.cityVideos[slug];
    el.innerHTML = window.LTL.videoCard(id, el.dataset.title, el.dataset.q);
  });

  /* ---------- Forms (lead gen, newsletter, contest, careers, partners, contact) ---------- */
  async function submitForm(form) {
    const type = form.dataset.form || "default";
    const endpoint = (CFG.forms && (CFG.forms[type] || CFG.forms.default)) || "";
    const fd = new FormData(form);
    if (fd.get("_gotcha")) return true; // honeypot: silently accept bots
    fd.delete("_gotcha");
    fd.append("_form", type); fd.append("_page", location.pathname); fd.append("_submitted", new Date().toISOString());
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "gclid", "landing"].forEach((k) => { const v = store.sget(k); if (v) fd.append(k, v); });
    if (!endpoint) {
      // No endpoint configured yet: keep a local copy so nothing is lost during testing.
      const saved = store.get("ltl-pending-submissions", []); saved.push(Object.fromEntries(fd.entries())); store.set("ltl-pending-submissions", saved);
      console.warn("[LoveToLive] No form endpoint configured for '" + type + "'. Set LTL_CONFIG.forms in assets/js/config.js. Saved locally.");
      return true;
    }
    const res = await fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  }
  window.LTL.submitForm = submitForm;
  $$("form[data-form]").forEach((form) => {
    if (!form.querySelector("[name=_gotcha]")) form.insertAdjacentHTML("afterbegin", '<input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">');
    if (form.dataset.multistep !== undefined) return; // handled by leadform.js
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const btn = form.querySelector("[type=submit]"); const txt = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }
      try {
        await submitForm(form);
        if (window.gtag) gtag("event", form.dataset.form === "leads" ? "generate_lead" : "form_submit", { form_type: form.dataset.form });
        const ok = form.parentElement.querySelector(".form-success");
        if (ok) { form.hidden = true; ok.classList.add("show"); ok.focus && ok.setAttribute("tabindex", "-1"); ok.focus(); }
        else { window.LTL.toast("Thanks! You're in."); form.reset(); }
      } catch (err) {
        window.LTL.toast("Something went wrong — please try again or email " + (CFG.contactEmail || "us"));
      } finally { if (btn) { btn.disabled = false; btn.innerHTML = txt; } }
    });
  });

  /* ---------- Reveal on scroll, bars, counters ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target; el.classList.add("in");
      $$(".bar > i[data-w]", el).forEach((i) => (i.style.width = i.dataset.w + "%"));
      if (el.dataset.count) animateCount(el);
      io.unobserve(el);
    });
  }, { threshold: 0.12 }) : null;
  function animateCount(el) {
    const end = parseFloat(el.dataset.count); const dur = 1200; const t0 = performance.now(); const suf = el.dataset.suffix || "";
    const step = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString() + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  window.LTL.observe = (root = document) => {
    $$(".reveal, [data-count], .score-list, .bars", root).forEach((el) => {
      if (io) io.observe(el); else { el.classList.add("in"); $$(".bar > i[data-w]", el).forEach((i) => (i.style.width = i.dataset.w + "%")); }
    });
  };
  window.LTL.observe();

  /* ---------- City data + search autosuggest ---------- */
  let citiesPromise = null;
  window.LTL.cities = () => citiesPromise || (citiesPromise = fetch(ROOT + "data/cities.json").then((r) => r.json()));
  $$("[data-city-search]").forEach((input) => {
    const box = document.createElement("ul"); box.className = "suggest"; box.setAttribute("role", "listbox");
    input.parentElement.appendChild(box); let items = [], idx = -1;
    const render = async () => {
      const q = input.value.trim().toLowerCase(); if (!q) { box.classList.remove("open"); return; }
      const all = await window.LTL.cities();
      items = all.filter((c) => (c.name + " " + c.country + " " + c.tags.join(" ")).toLowerCase().includes(q)).slice(0, 8);
      idx = -1;
      box.innerHTML = items.length ? items.map((c, i) => '<li><a href="' + ROOT + 'places/' + c.slug + '.html" data-i="' + i + '"><span>' + c.flag + " " + c.name + ", " + c.country + '</span><span class="score-pill">' + c.score + '</span></a></li>').join("")
        : '<li class="small muted" style="padding:10px 12px">No match yet — <a href="' + ROOT + 'contact.html?topic=city-request&city=' + encodeURIComponent(input.value) + '">request this city</a></li>';
      box.classList.add("open");
    };
    input.addEventListener("input", render);
    input.addEventListener("keydown", (e) => {
      const links = $$("a[data-i]", box);
      if (e.key === "ArrowDown") { idx = Math.min(links.length - 1, idx + 1); e.preventDefault(); }
      else if (e.key === "ArrowUp") { idx = Math.max(0, idx - 1); e.preventDefault(); }
      else if (e.key === "Enter") { e.preventDefault(); const l = links[idx >= 0 ? idx : 0]; if (l) location.href = l.href; return; }
      else if (e.key === "Escape") { box.classList.remove("open"); return; }
      links.forEach((l, i) => l.classList.toggle("active", i === idx));
    });
    document.addEventListener("click", (e) => { if (!input.parentElement.contains(e.target)) box.classList.remove("open"); });
    const form = input.closest("form");
    if (form) form.addEventListener("submit", (e) => { e.preventDefault(); const l = $("a[data-i]", box); if (l) location.href = l.href; else location.href = ROOT + "places.html?q=" + encodeURIComponent(input.value); });
  });

  /* ---------- Countdown ---------- */
  $$("[data-countdown]").forEach((el) => {
    const end = new Date(el.dataset.countdown || (CFG.contest && CFG.contest.deadline)).getTime();
    const tick = () => {
      let d = Math.max(0, end - Date.now());
      const parts = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
      el.innerHTML = ["Days", "Hours", "Mins", "Secs"].map((l, i) => "<div><b>" + String(parts[i]).padStart(2, "0") + "</b><span>" + l + "</span></div>").join("");
    };
    tick(); setInterval(tick, 1000);
  });

  /* ---------- Sticky CTA ---------- */
  const sticky = $("#sticky-cta");
  if (sticky && !store.sget("ltl-sticky-closed")) {
    const onScroll = () => { if (scrollY > 900) { sticky.classList.add("show"); removeEventListener("scroll", onScroll); } };
    addEventListener("scroll", onScroll, { passive: true });
    $("[data-close-sticky]", sticky).addEventListener("click", () => { sticky.classList.remove("show"); store.sset("ltl-sticky-closed", "1"); });
  }

  /* ---------- Modals + exit-intent lead magnet ---------- */
  function openModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.add("open"); const f = m.querySelector("input,button"); f && f.focus(); }
  function closeModal(m) { m.classList.remove("open"); }
  window.LTL.openModal = openModal;
  $$("[data-open-modal]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openModal(b.dataset.openModal); }));
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close-modal]")) closeModal(m); });
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal.open").forEach(closeModal); });
  const magnet = $("#magnet-modal");
  if (magnet && !store.get("ltl-magnet-seen") && !document.body.hasAttribute("data-no-popup")) {
    const show = () => { if (store.get("ltl-magnet-seen")) return; store.set("ltl-magnet-seen", Date.now()); openModal("magnet-modal"); };
    document.addEventListener("mouseout", (e) => { if (!e.relatedTarget && e.clientY < 8) show(); });
    setTimeout(() => { if (scrollY > document.body.scrollHeight * 0.45) show(); }, 60000);
  }

  /* ---------- Share ---------- */
  $$("[data-share]").forEach((b) => b.addEventListener("click", async () => {
    const data = { title: document.title, url: location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); window.LTL.toast("Link copied!"); } } catch (e) {}
  }));

  /* ---------- Decorative city skylines (deterministic per slug) ---------- */
  function hue(str) { let h = 0; for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
  window.LTL.skyline = (slug) => {
    let seed = hue(slug) + 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let x = 0, r = "";
    while (x < 400) { const w = 14 + rnd() * 26, h = 20 + rnd() * 80; r += '<rect x="' + x.toFixed(0) + '" y="' + (100 - h).toFixed(0) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '"/>'; x += w + 2; }
    return '<svg class="skyline" viewBox="0 0 400 100" preserveAspectRatio="none" fill="#fff" aria-hidden="true">' + r + "</svg>";
  };
  $$("[data-sky]").forEach((el) => el.insertAdjacentHTML("afterbegin", window.LTL.skyline(el.dataset.sky)));

  /* ---------- Year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();

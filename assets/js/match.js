/* City Match quiz */
(function () {
  const { $, $$, cities, observe, submitForm } = window.LTL;
  const form = $("#quiz"), steps = $$(".step", form), bar = $("#qz-bar"), label = $("#qz-step"), back = $("#qz-back"), next = $("#qz-next"), out = $("#qz-results");
  let i = 0;
  $$("[data-w]", form).forEach((r) => r.addEventListener("input", () => ($("#" + r.id + "-o").textContent = r.value)));
  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach((s, k) => s.classList.toggle("active", k === i));
    bar.style.width = ((i + 1) / steps.length) * 100 + "%";
    label.textContent = "Question " + (i + 1) + " of " + steps.length;
    back.disabled = i === 0; next.textContent = i === steps.length - 1 ? "See my matches 🎯" : "Next →";
  }
  back.addEventListener("click", () => go(i - 1));
  next.addEventListener("click", () => {
    if (i === 2 && !$$("[name=region]:checked", form).length) { window.LTL.toast("Pick at least one region"); return; }
    if (i < steps.length - 1) go(i + 1); else results();
  });
  go(0);

  const NEAR = { Tropical: ["Warm"], Warm: ["Tropical", "Mild"], Mild: ["Warm", "Four-season"], "Four-season": ["Mild", "Cold"], Cold: ["Four-season"] };
  const LABEL = { safety: "safety", health: "healthcare", jobs: "jobs", nature: "nature", culture: "culture & food", nightlife: "nightlife", family: "family life", walk: "walkability", internet: "internet", english: "English", afford: "affordability" };

  async function results() {
    const data = await cities();
    const fd = new FormData(form);
    const budget = +fd.get("budget"), climate = fd.get("climate"), regions = fd.getAll("region"), who = fd.get("who"), size = fd.get("size"), when = fd.get("when");
    const w = {}; $$("[data-w]", form).forEach((r) => (w[r.dataset.w] = +r.value));
    w.afford = 2;
    if (who === "family") w.family += 3; if (who === "retire") { w.health += 2; w.safety += 2; } if (who === "nomad") { w.internet += 3; w.afford += 2; }
    const wsum = Object.values(w).reduce((a, b) => a + b, 0) || 1;
    const ranked = data.filter((c) => regions.includes(c.region)).map((c) => {
      let s = Object.entries(w).reduce((acc, [k, v]) => acc + c[k] * v, 0) / wsum;
      if (c.monthly > budget) s -= Math.min(35, ((c.monthly - budget) / budget) * 45);
      if (climate !== "any") s += c.climate === climate ? 7 : (NEAR[climate] || []).includes(c.climate) ? 1 : -9;
      if ((who === "nomad" && c.tags.includes("nomad")) || (who === "retire" && c.tags.includes("retire")) || (who === "family" && c.tags.includes("family"))) s += 5;
      if (size !== "any") { const sz = c.pop >= 3 ? "big" : c.pop >= 0.5 ? "mid" : "small"; s += sz === size ? 4 : -3; }
      const why = Object.keys(w).filter((k) => w[k] >= 3).sort((a, b) => c[b] - c[a]).slice(0, 3).map((k) => LABEL[k]);
      return { c, s, why };
    }).sort((a, b) => b.s - a.s);
    if (!ranked.length) { out.hidden = false; out.innerHTML = '<div class="card">No cities match those regions yet. <a href="#" onclick="location.reload()">Try again</a></div>'; return; }
    const top = ranked.slice(0, 5), best = top[0].s;
    const pct = (s) => Math.max(40, Math.min(98, Math.round(98 - (best - s) * 1.6)));
    form.hidden = true; out.hidden = false;
    const urgent = when === "3m" || when === "6m";
    out.innerHTML =
      '<div class="section-head"><span class="eyebrow">Your results</span><h2>Your top ' + top.length + ' cities</h2><p class="muted">Ranked by how well each city fits your budget, climate, priorities and lifestyle.</p></div>' +
      '<div class="stack">' + top.map((r, k) => '<article class="card reveal" style="display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center' + (k === 0 ? ";border:2px solid var(--love)" : "") + '"><div style="font-size:2rem">' + r.c.flag + '</div><div><h3 style="margin:0"><a href="places/' + r.c.slug + '.html">' + (k + 1) + ". " + r.c.name + '</a> <span class="small muted">' + r.c.country + '</span></h3><p class="small muted" style="margin:4px 0 0">Strong on ' + r.why.join(", ") + " · ~$" + r.c.monthly.toLocaleString() + '/mo · ' + r.c.climate + '</p><div class="bar love" style="margin-top:8px"><i data-w="' + pct(r.s) + '"></i></div></div><div style="text-align:right"><b style="font-family:var(--display);font-size:1.8rem">' + pct(r.s) + '%</b><br><span class="small muted">match</span></div></article>').join("") + "</div>" +
      '<div class="lead-form" style="margin-top:28px"><span class="eyebrow">Free personalised plan</span><h3>Get your ' + top[0].c.name + " relocation plan</h3><p class=\"muted small\">We'll email your full results, a neighbourhood shortlist, a cost breakdown and a moving timeline" + (urgent ? ", plus quotes from vetted movers for your date." : ".") + '</p>' +
      '<form id="qz-lead" class="form-grid two"><input type="hidden" name="need" value="' + (urgent ? "movers" : "consult") + '"><input type="hidden" name="to" value="' + top[0].c.name + '"><input type="hidden" name="quiz_top5" value="' + top.map((r) => r.c.name).join(", ") + '"><input type="hidden" name="timeline" value="' + when + '"><input type="hidden" name="source" value="city-match-quiz">' +
      '<div class="field"><label for="qz-name">First name</label><input id="qz-name" name="name" required></div><div class="field"><label for="qz-email">Email</label><input id="qz-email" name="email" type="email" required></div>' +
      '<div class="field full"><label for="qz-from">Where do you live now?</label><input id="qz-from" name="from" placeholder="City or ZIP"></div>' +
      '<label class="check full"><input type="checkbox" name="consent" value="yes" required> Email me my plan and relevant relocation offers. I can unsubscribe anytime. <a href="privacy.html">Privacy</a></label>' +
      '<button class="btn btn-primary full" type="submit">Email me my plan →</button></form><div class="form-success" id="qz-ok"><b>Sent! ✉️</b> Check your inbox. Ready to move? <a href="get-quotes.html?to=' + encodeURIComponent(top[0].c.name) + '">Compare moving quotes →</a></div></div>' +
      '<div class="flex" style="margin-top:20px"><a class="btn btn-live" href="compare.html?a=' + top[0].c.slug + "&b=" + (top[1] || top[0]).c.slug + '">Compare #1 vs #2</a><button class="btn btn-ghost" type="button" onclick="location.reload()">Retake quiz</button><button class="btn btn-ghost" type="button" data-share-q>Share my results</button></div>';
    observe(out);
    out.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.gtag) gtag("event", "quiz_complete", { top_city: top[0].c.slug });
    const lf = $("#qz-lead");
    lf.insertAdjacentHTML("afterbegin", '<input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">');
    lf.dataset.form = "leads";
    lf.addEventListener("submit", async (e) => {
      e.preventDefault(); if (!lf.checkValidity()) { lf.reportValidity(); return; }
      try { await submitForm(lf); lf.hidden = true; $("#qz-ok").classList.add("show"); if (window.gtag) gtag("event", "generate_lead", { form_type: "quiz" }); }
      catch (err) { window.LTL.toast("Couldn't send — please try again."); }
    });
    $("[data-share-q]", out).addEventListener("click", async () => {
      const text = "My top cities to live in: " + top.map((r) => r.c.name).join(", ") + " — via LoveToLive City Match";
      try { if (navigator.share) await navigator.share({ title: "My City Match", text, url: location.href }); else { await navigator.clipboard.writeText(text + " " + location.href); window.LTL.toast("Copied!"); } } catch (e) {}
    });
  }
})();

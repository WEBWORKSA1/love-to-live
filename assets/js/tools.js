/* Calculators: cost of living, moving cost, mortgage, live-well score */
(function () {
  const { $, $$, cities, observe } = window.LTL;
  const money = (n) => "$" + Math.round(n).toLocaleString();
  let data = [];
  const find = (slug) => data.find((c) => c.slug === slug);

  /* ---------- Tabs (hash-aware) ---------- */
  const tabs = $$("[data-tab]");
  function show(id) {
    if (!document.getElementById(id)) return;
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === id));
    $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === id));
  }
  tabs.forEach((t) => t.addEventListener("click", () => { show(t.dataset.tab); history.replaceState(null, "", "#" + t.dataset.tab); }));
  addEventListener("hashchange", () => show(location.hash.slice(1)));
  if (location.hash) { show(location.hash.slice(1)); setTimeout(() => scrollTo(0, 0), 0); }
  const toParam = new URLSearchParams(location.search).get("to");
  if (toParam) { const s1 = $("#col-to"), s2 = $("#mv-to"); if (s1) s1.value = toParam; if (s2) s2.value = toParam; }

  /* ---------- Cost of living ---------- */
  function col(e) {
    e && e.preventDefault();
    const a = find($("#col-from").value), b = find($("#col-to").value); if (!a || !b) return;
    const inc = parseFloat($("#col-income").value) || 0, hh = parseFloat($("#col-house").value);
    const rentShare = 0.35, other = 1 - rentShare;
    const rentRatio = b.rent / a.rent, costRatio = b.cost / a.cost;
    const needed = inc * (rentShare * rentRatio + other * costRatio);
    const pct = ((needed - inc) / inc) * 100;
    const budgetB = b.rent * (hh > 1.5 ? 1.45 : 1) + b.cost * 16 * hh;
    $("#col-out").innerHTML =
      '<span class="small muted">To keep the same lifestyle in ' + b.name + " you'd need about</span>" +
      '<div class="big">' + money(needed) + '<span class="small muted">/month</span></div>' +
      '<p class="delta ' + (pct > 0 ? "up" : "down") + '"><b>' + (pct > 0 ? "+" : "") + pct.toFixed(0) + "%</b> vs your " + money(inc) + " in " + a.name + ".</p>" +
      '<div class="score-list bars" style="margin:14px 0">' +
      '<div class="score-row"><span>Housing</span><div class="bar love"><i data-w="' + Math.min(100, rentRatio * 50) + '"></i></div><b>' + (rentRatio * 100 - 100 > 0 ? "+" : "") + (rentRatio * 100 - 100).toFixed(0) + "%</b></div>" +
      '<div class="score-row"><span>Everything else</span><div class="bar"><i data-w="' + Math.min(100, costRatio * 50) + '"></i></div><b>' + (costRatio * 100 - 100 > 0 ? "+" : "") + (costRatio * 100 - 100).toFixed(0) + "%</b></div></div>" +
      "<p class=small>Typical household budget in " + b.name + ": <b>~" + money(budgetB) + "/mo</b>. Average local net salary ≈ " + money(b.salary) + "/mo.</p>" +
      '<div class="flex"><a class="btn btn-primary btn-sm" href="get-quotes.html?from=' + encodeURIComponent(a.name) + "&to=" + encodeURIComponent(b.name) + '">Get moving quotes →</a><a class="btn btn-ghost btn-sm" href="compare.html?a=' + a.slug + "&b=" + b.slug + '">Full comparison</a><a class="btn btn-ghost btn-sm" href="places/' + b.slug + '.html">' + b.name + " guide</a></div>" +
      '<p class="form-note" style="margin-top:10px">Indicative estimate based on city cost indices. Not financial advice.</p>';
    observe($("#col-out"));
  }

  /* ---------- Moving cost ---------- */
  function hav(a, b) {
    const R = 6371, t = (x) => (x * Math.PI) / 180;
    const d = Math.sin(t(b.lat - a.lat) / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(t(b.lon - a.lon) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(d));
  }
  function syncDist() {
    const a = find($("#mv-from").value), b = find($("#mv-to").value);
    if (a && b) $("#mv-dist").value = Math.max(5, Math.round(hav(a, b) * 1.2));
  }
  function moving(e) {
    e && e.preventDefault();
    const a = find($("#mv-from").value), b = find($("#mv-to").value);
    const dist = parseFloat($("#mv-dist").value) || 0, size = parseFloat($("#mv-size").value), type = $("#mv-type").value, season = parseFloat($("#mv-month").value);
    const intl = a && b && a.country !== b.country && !(a.region === b.region && dist < 1500);
    let base;
    if (intl) base = size * (3200 + dist * 0.35);                  // sea/air freight door-to-door
    else if (dist < 80) base = size * 5.5 * 160;                    // local: crew hours
    else base = size * (1400 + dist * 1.05);                         // long-distance
    const typeMul = intl ? 1 : type === "container" ? 0.55 : type === "diy" ? 0.3 : 1;
    let cost = base * typeMul * season;
    const extras = [];
    if ($("#mv-pack").checked && type === "full") { cost += size * 850; extras.push("packing"); }
    if ($("#mv-car").checked) { const car = intl ? 2800 : dist < 80 ? 0 : 700 + dist * 0.3; cost += car; extras.push("car shipping"); }
    if ($("#mv-storage").checked) { cost += size * 190; extras.push("storage"); }
    const lo = cost * 0.8, hi = cost * 1.25;
    const label = intl ? "International move" : dist < 80 ? "Local move" : "Long-distance move";
    $("#mv-out").innerHTML = '<span class="small muted">' + label + " · " + Math.round(dist).toLocaleString() + " km" + (extras.length ? " · incl. " + extras.join(", ") : "") + "</span>" +
      '<div class="big">' + money(lo) + " – " + money(hi) + "</div>" +
      "<p>Planning range for a " + $("#mv-size").selectedOptions[0].text.toLowerCase() + " move" + (intl ? " (door-to-door international shipping)" : " with " + $("#mv-type").selectedOptions[0].text.toLowerCase()) + ".</p>" +
      '<div class="cta-band" style="padding:22px;margin-top:10px"><b style="font-size:1.1rem">Lock in a real price.</b><p style="margin:6px 0 12px">Compare binding quotes from vetted movers for this route — free.</p><a class="btn btn-dark" href="get-quotes.html?need=' + (intl ? "international" : "movers") + (a ? "&from=" + encodeURIComponent(a.name) : "") + (b ? "&to=" + encodeURIComponent(b.name) : "") + '">Get my free quotes →</a></div>' +
      '<p class="form-note" style="margin-top:10px">Estimate only. Real prices depend on inventory, access, dates and insurance.</p>';
  }

  /* ---------- Mortgage ---------- */
  function mortgage(e) {
    e && e.preventDefault();
    const price = +$("#mg-price").value || 0, down = (+$("#mg-down").value || 0) / 100, rate = (+$("#mg-rate").value || 0) / 100 / 12, n = +$("#mg-years").value * 12;
    const tax = (+$("#mg-tax").value || 0) / 12, income = (+$("#mg-income").value || 0) / 12;
    const loan = price * (1 - down);
    const pmt = rate ? (loan * rate) / (1 - Math.pow(1 + rate, -n)) : loan / n;
    const pmi = down < 0.2 ? (loan * 0.007) / 12 : 0;
    const total = pmt + tax + pmi, ratio = income ? (total / income) * 100 : 0;
    const maxPay = income * 0.28 - tax - pmi;
    const factor = rate ? (1 - Math.pow(1 + rate, -n)) / rate : n;
    const maxPrice = maxPay > 0 ? (maxPay * factor) / (1 - down) : 0;
    const totalInterest = pmt * n - loan;
    const status = ratio <= 28 ? ["✅ Comfortable", "var(--ok)"] : ratio <= 36 ? ["⚠️ Stretch", "var(--warn)"] : ["⛔ Risky", "var(--bad)"];
    $("#mg-out").innerHTML = '<span class="small muted">Estimated monthly payment</span><div class="big">' + money(total) + "</div>" +
      '<div class="grid grid-3" style="margin:12px 0"><div><span class="small muted">Principal &amp; interest</span><br><b>' + money(pmt) + '</b></div><div><span class="small muted">Tax &amp; insurance</span><br><b>' + money(tax) + '</b></div><div><span class="small muted">PMI (if &lt;20% down)</span><br><b>' + money(pmi) + "</b></div></div>" +
      '<p>Housing = <b style="color:' + status[1] + '">' + ratio.toFixed(1) + "% of gross income — " + status[0] + "</b> (28% guideline). Total interest over the loan: " + money(totalInterest) + ".</p>" +
      "<p>At 28% of income you could afford a home up to about <b>" + money(maxPrice) + "</b> with " + (down * 100).toFixed(0) + "% down.</p>" +
      '<div class="flex"><a class="btn btn-primary btn-sm" href="get-quotes.html?need=mortgage">Compare lender rates →</a><a class="btn btn-ghost btn-sm" href="get-quotes.html?need=agent">Find a top local agent</a></div>' +
      '<p class="form-note" style="margin-top:10px">Illustrative only; not a loan offer. PMI estimated at 0.7%/yr.</p>';
  }

  /* ---------- Live-Well score ---------- */
  const TIPS = {
    move: "Build walking into errands and choose a more walkable neighbourhood next time you move.",
    food: "Cook one extra plant-based meal a week and try stopping at 80% full.",
    sleep: "Protect a consistent bedtime, and keep your bedroom cool, dark and screen-free.",
    people: "Schedule a standing weekly meet-up with friends or join a local club.",
    purpose: "Write down what gets you out of bed. Volunteer, mentor or start a craft.",
    money: "Automate saving 10% and check that housing costs stay under 30% of take-home pay.",
    place: "Your home and neighbourhood matter — explore places that better fit your life.",
    nature: "Aim for 2 hours a week in green or blue space; it adds up."
  };
  $$("[data-lw]").forEach((r) => r.addEventListener("input", () => ($("#" + r.id + "-o").textContent = r.value)));
  function liveWell(e) {
    e && e.preventDefault();
    const vals = $$("[data-lw]").map((r) => [r.dataset.lw, +r.value, r.closest(".field").querySelector("label").textContent.split(":")[0]]);
    const score = Math.round((vals.reduce((s, v) => s + v[1], 0) / (vals.length * 10)) * 100);
    const low = vals.slice().sort((a, b) => a[1] - b[1]).slice(0, 2);
    const band = score >= 80 ? "Thriving 🌟" : score >= 60 ? "Doing well 🌿" : score >= 40 ? "Room to grow 🌱" : "Time for a reset 🔄";
    $("#lw-out").innerHTML = '<span class="small muted">Your Live-Well score</span><div class="big">' + score + '<span class="small muted">/100</span> · ' + band + "</div>" +
      "<h3 style='margin-top:14px'>Your two biggest opportunities</h3><ul>" + low.map((l) => "<li><b>" + l[2] + ":</b> " + TIPS[l[0]] + "</li>").join("") + "</ul>" +
      (low.some((l) => l[0] === "place" || l[0] === "nature" || l[0] === "money") ? '<a class="btn btn-live btn-sm" href="match.html">Find a city that fits you better →</a> ' : "") +
      '<a class="btn btn-ghost btn-sm" href="guides/live-well-anywhere.html">Read: how to live well anywhere</a>';
  }

  cities().then((d) => {
    data = d;
    $("#col-form").addEventListener("submit", col); $("#mv-form").addEventListener("submit", moving);
    ["#mv-from", "#mv-to"].forEach((s) => $(s).addEventListener("change", () => { syncDist(); moving(); }));
    $("#mg-form").addEventListener("submit", mortgage); $("#lw-form").addEventListener("submit", liveWell);
    syncDist(); col(); moving(); mortgage();
  });
})();

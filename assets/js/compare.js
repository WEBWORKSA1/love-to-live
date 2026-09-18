/* City vs City comparison */
(function () {
  const { $, cities, observe } = window.LTL;
  const A = $("#cmp-a"), B = $("#cmp-b"), sal = $("#cmp-salary"), out = $("#cmp-out");
  const p = new URLSearchParams(location.search);
  if (p.get("a")) A.value = p.get("a"); if (p.get("b")) B.value = p.get("b");
  const F = [["score", "LiveScore"], ["safety", "Safety"], ["health", "Healthcare"], ["afford", "Affordability"], ["jobs", "Jobs"], ["nature", "Nature"], ["culture", "Culture & food"], ["nightlife", "Nightlife"], ["family", "Family"], ["walk", "Walkability"], ["air", "Air quality"], ["internet", "Internet"], ["english", "English"]];
  const money = (n) => "$" + Math.round(n).toLocaleString();
  let data = [];
  function render() {
    const a = data.find((c) => c.slug === A.value), b = data.find((c) => c.slug === B.value); if (!a || !b) return;
    let winsA = 0, winsB = 0;
    const rows = F.map(([k, l]) => {
      const wa = a[k] > b[k], wb = b[k] > a[k]; if (k !== "score") { if (wa) winsA++; if (wb) winsB++; }
      return '<div class="cmp-row"><div class="left"><b class="' + (wa ? "win" : "") + '">' + a[k] + '</b><div class="bar"><i data-w="' + a[k] + '"></i></div></div><div class="lbl">' + l + '</div><div class="right"><div class="bar love"><i data-w="' + b[k] + '"></i></div><b class="' + (wb ? "win" : "") + '">' + b[k] + "</b></div></div>";
    }).join("");
    const diff = ((b.monthly - a.monthly) / a.monthly) * 100;
    const income = parseFloat(sal.value);
    const incomeLine = income > 0 ? "<p>To keep your lifestyle, " + money(income) + "/mo in " + a.name + " ≈ <b>" + money(income * (b.monthly / a.monthly)) + "/mo</b> in " + b.name + ".</p>" : "";
    const verdict = winsA === winsB ? "It's a tie on factors — decide on what matters most to you." : (winsA > winsB ? a.name : b.name) + " wins on " + Math.max(winsA, winsB) + " of 12 factors.";
    out.innerHTML =
      '<div class="grid grid-2" style="margin-bottom:22px">' +
      [a, b].map((c) => '<div class="card"><span class="small muted">' + c.flag + " " + c.country + '</span><h2 style="margin:4px 0"><a href="places/' + c.slug + '.html" style="color:inherit;text-decoration:none">' + c.name + '</a></h2><span class="score-pill">LiveScore ' + c.score + '</span> <span class="small muted">#' + c.rank + '</span><div class="meta-row"><span>💵 ~' + money(c.monthly) + '/mo</span><span>🏠 ' + money(c.rent) + ' rent</span><span>🌡️ ' + c.temp + '°C ' + c.climate + '</span><span>📶 ' + c.mbps + ' Mbps</span></div></div>').join("") + "</div>" +
      '<div class="result" style="margin-bottom:22px"><span class="small muted">Cost of living</span><div class="big"><span class="delta ' + (diff > 0 ? "up" : "down") + '">' + b.name + " is " + Math.abs(diff).toFixed(0) + "% " + (diff > 0 ? "more expensive" : "cheaper") + "</span></div><p>than " + a.name + " (" + money(b.monthly) + " vs " + money(a.monthly) + " per month, single person, indicative).</p>" + incomeLine + "<p><b>Verdict:</b> " + verdict + "</p></div>" +
      '<div class="card bars">' + rows + '</div>' +
      '<div class="flex" style="margin-top:18px"><a class="btn btn-primary" href="get-quotes.html?from=' + encodeURIComponent(a.name) + "&to=" + encodeURIComponent(b.name) + '">Get moving quotes: ' + a.name + " → " + b.name + '</a><button class="btn btn-ghost" data-share-cmp>Share this comparison</button></div>';
    document.title = a.name + " vs " + b.name + ": Cost of Living & Quality of Life | LoveToLive";
    history.replaceState(null, "", "?a=" + a.slug + "&b=" + b.slug);
    observe(out);
    const sh = out.querySelector("[data-share-cmp]");
    sh.addEventListener("click", async () => { try { if (navigator.share) await navigator.share({ title: document.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); window.LTL.toast("Link copied!"); } } catch (e) {} });
  }
  cities().then((d) => { data = d; render(); });
  [A, B, sal].forEach((el) => el.addEventListener("input", render));
  $("#cmp-swap").addEventListener("click", () => { const t = A.value; A.value = B.value; B.value = t; render(); });
})();
